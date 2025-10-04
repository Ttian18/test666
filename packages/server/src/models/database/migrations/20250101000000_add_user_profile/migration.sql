-- CreateTable
CREATE TABLE "user_profiles" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "monthlyIncome" DOUBLE PRECISION,
    "monthlyBudget" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "budgetAllocation" JSONB,
    "dietaryRestrictions" TEXT[],
    "cuisinePreferences" TEXT[],
    "allergies" TEXT[],
    "spiceTolerance" TEXT,
    "mealTiming" JSONB,
    "activityLevel" TEXT,
    "healthGoals" TEXT[],
    "cookingSkill" TEXT,
    "kitchenEquipment" TEXT[],
    "priceRangePreference" TEXT,
    "brandPreferences" TEXT[],
    "shoppingHabits" JSONB,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "smsNotifications" BOOLEAN NOT NULL DEFAULT false,
    "profileVisibility" TEXT NOT NULL DEFAULT 'private',
    "dataSharing" BOOLEAN NOT NULL DEFAULT false,
    "analyticsOptIn" BOOLEAN NOT NULL DEFAULT false,
    "completionPercentage" INTEGER NOT NULL DEFAULT 0,
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_behaviors" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "actionType" TEXT NOT NULL,
    "actionTarget" TEXT NOT NULL,
    "actionData" JSONB,
    "sessionId" TEXT,
    "deviceInfo" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_behaviors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_behaviors" ADD CONSTRAINT "user_behaviors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
