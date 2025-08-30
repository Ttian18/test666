import { authenticate } from "../../src/routes/middleware/auth.js";

describe("Authentication Middleware", () => {
  let testUser;
  let req, res, next;

  beforeEach(async () => {
    await global.testDb.cleanup();

    testUser = await global.testDb.createUser({
      email: "auth@test.com",
      name: "Auth Test User",
    });

    // Mock request, response, and next
    req = {
      header: jest.fn(),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe("Token Validation Tests", () => {
    test("should reject request without token", async () => {
      req.header.mockReturnValue(null);

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "No token, authorization denied",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should reject request with invalid token", async () => {
      req.header.mockReturnValue("invalid_token");

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Token is not valid",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should reject expired token", async () => {
      // Create expired token (expired 1 hour ago)
      const jwt = await import("jsonwebtoken");
      const expiredToken = jwt.default.sign(
        { id: testUser.id },
        global.testConfig.JWT_SECRET,
        { expiresIn: "-1h" }
      );

      req.header.mockReturnValue(expiredToken);

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Token is not valid",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should reject token with invalid signature", async () => {
      const jwt = await import("jsonwebtoken");
      const tokenWithWrongSecret = jwt.default.sign(
        { id: testUser.id },
        "wrong_secret",
        { expiresIn: "1h" }
      );

      req.header.mockReturnValue(tokenWithWrongSecret);

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Token is not valid",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("User Validation Tests", () => {
    test("should reject token for non-existent user", async () => {
      const nonExistentUserId = 99999;
      const validToken = global.testUtils.generateTestToken(nonExistentUserId);

      req.header.mockReturnValue(validToken);

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should accept valid token for existing user", async () => {
      const validToken = global.testUtils.generateTestToken(testUser.id);

      req.header.mockReturnValue(validToken);

      await authenticate(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(testUser.id);
      expect(req.user.email).toBe(testUser.email);
      expect(req.user.name).toBe(testUser.name);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test("should only include safe user data in req.user", async () => {
      const validToken = global.testUtils.generateTestToken(testUser.id);

      req.header.mockReturnValue(validToken);

      await authenticate(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(testUser.id);
      expect(req.user.email).toBe(testUser.email);
      expect(req.user.name).toBe(testUser.name);

      // Should not include sensitive data
      expect(req.user.password).toBeUndefined();
      expect(req.user.createdAt).toBeUndefined();
      expect(req.user.updatedAt).toBeUndefined();
    });
  });

  describe("Token Header Formats", () => {
    test("should handle x-auth-token header", async () => {
      const validToken = global.testUtils.generateTestToken(testUser.id);

      req.header.mockImplementation((headerName) => {
        if (headerName === "x-auth-token") return validToken;
        return null;
      });

      await authenticate(req, res, next);

      expect(req.user.id).toBe(testUser.id);
      expect(next).toHaveBeenCalled();
    });

    test("should handle empty string token", async () => {
      req.header.mockReturnValue("");

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "No token, authorization denied",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("Database Integration Tests", () => {
    test("should work with real database operations", async () => {
      const validToken = global.testUtils.generateTestToken(testUser.id);
      req.header.mockReturnValue(validToken);

      await authenticate(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(testUser.id);
      expect(req.user.email).toBe(testUser.email);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("Concurrent Request Tests", () => {
    test("should handle multiple concurrent authentication requests", async () => {
      const validToken = global.testUtils.generateTestToken(testUser.id);

      const requests = Array(5)
        .fill()
        .map(() => ({
          header: jest.fn().mockReturnValue(validToken),
        }));

      const responses = requests.map(() => ({
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      }));

      const nexts = requests.map(() => jest.fn());

      // Run all authentications concurrently
      const promises = requests.map((req, index) =>
        authenticate(req, responses[index], nexts[index])
      );

      await Promise.all(promises);

      // All should succeed
      requests.forEach((req, index) => {
        expect(req.user.id).toBe(testUser.id);
        expect(nexts[index]).toHaveBeenCalled();
        expect(responses[index].status).not.toHaveBeenCalled();
      });
    });
  });

  describe("Token Payload Validation", () => {
    test("should reject token with missing user ID", async () => {
      const jwt = await import("jsonwebtoken");
      const tokenWithoutUserId = jwt.default.sign(
        { email: "test@example.com" }, // missing id field
        global.testConfig.JWT_SECRET,
        { expiresIn: "1h" }
      );

      req.header.mockReturnValue(tokenWithoutUserId);

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    test("should reject token with string user ID", async () => {
      const jwt = await import("jsonwebtoken");
      const tokenWithStringId = jwt.default.sign(
        { id: "string_id" }, // should be integer
        global.testConfig.JWT_SECRET,
        { expiresIn: "1h" }
      );

      req.header.mockReturnValue(tokenWithStringId);

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Token is not valid",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
