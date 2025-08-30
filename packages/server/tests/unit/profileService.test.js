import * as profileService from "../../src/services/auth/profileService.js";

describe("ProfileService", () => {
  let testUser1, testUser2;

  beforeEach(async () => {
    await global.testDb.cleanup();

    testUser1 = await global.testDb.createUser({
      email: "profile1@test.com",
      name: "Profile User 1",
    });
    testUser2 = await global.testDb.createUser({
      email: "profile2@test.com",
      name: "Profile User 2",
    });
  });

  describe("User Isolation Tests", () => {
    test("getUserProfile should only return user-specific profile", async () => {
      const profileData1 = global.testUtils.createTestProfile({
        monthlyBudget: 1000,
      });
      const profileData2 = global.testUtils.createTestProfile({
        monthlyBudget: 2000,
      });

      // Create profiles for both users
      await profileService.createOrUpdateProfile(testUser1.id, profileData1);
      await profileService.createOrUpdateProfile(testUser2.id, profileData2);

      // Get profile for user 1
      const user1Profile = await profileService.getUserProfile(testUser1.id);

      expect(user1Profile.monthlyBudget).toBe(1000);
      expect(user1Profile.monthlyBudget).not.toBe(2000);
    });

    test("getUserDataForPersonalization should be user-specific", async () => {
      const profileData = global.testUtils.createTestProfile({
        expensePreferences: {
          cuisineTypes: ["Italian"],
          diningOut: "frequent",
        },
      });

      await profileService.createOrUpdateProfile(testUser1.id, profileData);

      const userData = await profileService.getUserDataForPersonalization(
        testUser1.id
      );

      expect(userData.id).toBe(testUser1.id);
      expect(userData.email).toBe(testUser1.email);
      expect(userData.expensePreferences.cuisineTypes).toEqual(["Italian"]);
    });
  });

  describe("Input Validation Tests", () => {
    test("should validate user ID for all functions", async () => {
      const invalidUserIds = [null, undefined, "string", 0, -1];

      for (const invalidId of invalidUserIds) {
        await expect(profileService.getUserProfile(invalidId)).rejects.toThrow(
          "Valid user ID (integer) is required"
        );

        await expect(
          profileService.getUserDataForPersonalization(invalidId)
        ).rejects.toThrow("Valid user ID (integer) is required");

        await expect(
          profileService.createOrUpdateProfile(invalidId, {})
        ).rejects.toThrow("Valid user ID (integer) is required");
      }
    });

    test("createOrUpdateProfile should validate required fields", async () => {
      await expect(
        profileService.createOrUpdateProfile(testUser1.id, {})
      ).rejects.toThrow("Missing required profile fields");

      const incompleteProfile = {
        monthlyBudget: 1000,
        // missing monthlyIncome, expensePreferences, savingsGoals
      };

      await expect(
        profileService.createOrUpdateProfile(testUser1.id, incompleteProfile)
      ).rejects.toThrow("Missing required profile fields");
    });

    test("should validate profile data structure", async () => {
      await expect(
        profileService.createOrUpdateProfile(testUser1.id, null)
      ).rejects.toThrow("Profile data is required");

      await expect(
        profileService.createOrUpdateProfile(testUser1.id, "invalid")
      ).rejects.toThrow("Profile data is required");
    });
  });

  describe("CRUD Operations Tests", () => {
    test("createOrUpdateProfile should create new profile", async () => {
      const profileData = global.testUtils.createTestProfile();

      const result = await profileService.createOrUpdateProfile(
        testUser1.id,
        profileData
      );

      expect(result.profileId).toBeDefined();
      expect(result.profileComplete).toBe(true);

      // Verify profile was created
      const savedProfile = await profileService.getUserProfile(testUser1.id);
      expect(savedProfile.monthlyBudget).toBe(profileData.monthlyBudget);
      expect(savedProfile.monthlyIncome).toBe(profileData.monthlyIncome);
    });

    test("createOrUpdateProfile should update existing profile", async () => {
      const initialProfile = global.testUtils.createTestProfile({
        monthlyBudget: 1000,
      });

      // Create initial profile
      await profileService.createOrUpdateProfile(testUser1.id, initialProfile);

      // Update profile
      const updatedProfile = global.testUtils.createTestProfile({
        monthlyBudget: 2000,
        monthlyIncome: 6000,
      });

      const result = await profileService.createOrUpdateProfile(
        testUser1.id,
        updatedProfile
      );

      expect(result.profileComplete).toBe(true);

      // Verify profile was updated
      const savedProfile = await profileService.getUserProfile(testUser1.id);
      expect(savedProfile.monthlyBudget).toBe(2000);
      expect(savedProfile.monthlyIncome).toBe(6000);
    });

    test("should mark user as profileComplete in database", async () => {
      const profileData = global.testUtils.createTestProfile();

      await profileService.createOrUpdateProfile(testUser1.id, profileData);

      // Check user record in database
      const user = await global.prisma.user.findUnique({
        where: { id: testUser1.id },
      });

      expect(user.profileComplete).toBe(true);
    });
  });

  describe("User Validation Tests", () => {
    test("validateUser should return user data for valid user", async () => {
      const user = await profileService.validateUser(testUser1.id);

      expect(user.id).toBe(testUser1.id);
      expect(user.email).toBe(testUser1.email);
      expect(user.name).toBe(testUser1.name);
    });

    test("validateUser should return null for invalid user", async () => {
      const nonExistentUserId = 99999;
      const user = await profileService.validateUser(nonExistentUserId);

      expect(user).toBeNull();
    });

    test("validateUser should handle invalid input gracefully", async () => {
      expect(await profileService.validateUser(null)).toBeNull();
      expect(await profileService.validateUser("invalid")).toBeNull();
      expect(await profileService.validateUser(undefined)).toBeNull();
    });
  });

  describe("Profile Retrieval Tests", () => {
    test("getUserProfile should return null for non-existent profile", async () => {
      const profile = await profileService.getUserProfile(testUser1.id);
      expect(profile).toBeNull();
    });

    test("getUserDataForPersonalization should work without profile", async () => {
      const userData = await profileService.getUserDataForPersonalization(
        testUser1.id
      );

      expect(userData.id).toBe(testUser1.id);
      expect(userData.email).toBe(testUser1.email);
      expect(userData.name).toBe(testUser1.name);
      // Should not have profile-specific fields
      expect(userData.monthlyBudget).toBeUndefined();
      expect(userData.expensePreferences).toBeUndefined();
    });

    test("getUserDataForPersonalization should return null for invalid user", async () => {
      const userData = await profileService.getUserDataForPersonalization(
        99999
      );
      expect(userData).toBeNull();
    });
  });

  describe("Profile Data Safety Tests", () => {
    test("getUserProfile should return safe profile data only", async () => {
      const profileData = global.testUtils.createTestProfile();
      await profileService.createOrUpdateProfile(testUser1.id, profileData);

      const retrievedProfile = await profileService.getUserProfile(
        testUser1.id
      );

      // Should have expected fields
      expect(retrievedProfile.monthlyBudget).toBeDefined();
      expect(retrievedProfile.monthlyIncome).toBeDefined();
      expect(retrievedProfile.expensePreferences).toBeDefined();
      expect(retrievedProfile.savingsGoals).toBeDefined();
      expect(retrievedProfile.lifestylePreferences).toBeDefined();
      expect(retrievedProfile.createdAt).toBeDefined();
      expect(retrievedProfile.updatedAt).toBeDefined();

      // Should not have internal fields
      expect(retrievedProfile._id).toBeUndefined();
      expect(retrievedProfile.userId).toBeUndefined();
    });
  });
});
