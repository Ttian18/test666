# Plan to Make the Backend User-Aware

The goal is to ensure that all relevant API endpoints and database queries are scoped to the authenticated user. This will prevent users from accessing or modifying data that does not belong to them.

## 📋 Overall Progress Tracker

### 🎯 **Status: Phase 2 Complete - Ready for Phase 3**

- ✅ **Phase 1**: Foundation and Security Fixes (COMPLETED)
- ✅ **Phase 2**: Create Service Layer (COMPLETED)
- 🔄 **Phase 3**: Apply Authentication Middleware (NEXT)
- ⏳ **Phase 4-7**: Pending Phase 3 completion

---

**Phase 1: Foundation and Security Fixes** ✅ **COMPLETED**

- [x] **1.1** Resolve User Model Architecture _(Using Prisma User Model)_
  - [x] Remove `src/models/entities/User.js` (conflicting model)
  - [x] Update all authentication logic to use Prisma User model
  - [x] Ensure JWT tokens contain Prisma User `id` (integer)
  - [x] Update any imports that reference the entity User model
- [x] **1.2** Enhance Authentication Middleware
  - [x] Add database validation to auth middleware
  - [x] Test middleware with valid/invalid users
- [x] **1.3** Fix Existing Security Vulnerabilities
  - [x] Remove `user_id` query parameter from routes
  - [x] Audit all routes for similar vulnerabilities
- [x] **1.4** Test Phase 1 Changes
  - [x] Authentication middleware works correctly
  - [x] No breaking changes to existing functionality

**Phase 2: Create Service Layer** ✅ **COMPLETED**

- [x] **2.1** Create Missing Transaction Services
  - [x] Create `transactionService.js`
  - [x] Create `insightsService.js`
  - [x] Create `voucherService.js`
- [x] **2.2** Update Existing Services
  - [x] Update `recommendationService.js` to be user-aware
  - [x] Update `menuAnalysisService.js` to be user-aware
  - [x] Update `zhongcaoService.js` to be user-aware
- [x] **2.3** Test Service Layer
  - [x] Unit tests for all service functions
  - [x] Verify user isolation in services

**Phase 3: Apply Authentication Middleware**

- [ ] **3.1** Apply to Route Files
  - [ ] `transactionRoutes.js`
  - [ ] `insightsRoutes.js`
  - [ ] `voucherRoutes.js`
  - [ ] `profileRoutes.js`
  - [ ] `recommendationRoutes.js` (personalized)
  - [ ] `menuAnalysisRoutes.js` (user-specific)
  - [ ] `zhongcaoRoutes.js` (after Phase 5)

**Phase 4: Update Route Handlers**

- [ ] **4.1** Refactor Routes to Use Services
  - [ ] `transactionRoutes.js` - Remove direct Prisma access
  - [ ] `insightsRoutes.js` - Ensure uses service layer
  - [ ] `voucherRoutes.js` - Move DB access to service
  - [ ] `profileRoutes.js` - Use service layer
  - [ ] Other routes as needed
- [ ] **4.2** Test Route Integration
  - [ ] All routes use service layer correctly
  - [ ] No direct database access in routes

**Phase 5: Handle Models Without User Relationships**

- [ ] **5.1** ZhongcaoResult Model Decision
  - [ ] Decide if ZhongcaoResult should be user-specific
  - [ ] Update `schema.prisma` if needed
  - [ ] Create and run safe migration
  - [ ] Update `zhongcaoService.js` accordingly
  - [ ] Update `zhongcaoRoutes.js` with authentication

**Phase 6: Comprehensive Testing**

- [ ] **6.1** Unit Testing
  - [ ] Service function tests for user isolation
  - [ ] Authentication middleware edge cases
- [ ] **6.2** Integration Testing
  - [ ] Protected routes with valid tokens
  - [ ] Protected routes without tokens (401 expected)
- [ ] **6.3** Security Testing
  - [ ] Cross-user data access prevention
  - [ ] Invalid JWT handling
  - [ ] Authorization boundary testing

**Phase 7: Rollback and Monitoring**

- [ ] **7.1** Rollback Preparation
  - [ ] Document current API behavior
  - [ ] Create database backup
  - [ ] Prepare rollback scripts
- [ ] **7.2** Monitoring Setup
  - [ ] Authentication failure logging
  - [ ] API response time monitoring
  - [ ] Error rate alerts
- [ ] **7.3** Gradual Deployment
  - [ ] Deploy Phase 1 changes
  - [ ] Deploy Phase 2 changes
  - [ ] Deploy Phase 3-4 changes incrementally
  - [ ] Monitor each deployment phase

**🎯 Completion Criteria:**

- [ ] All user-specific data is properly scoped to authenticated users
- [ ] No direct database access in route handlers
- [ ] Comprehensive test coverage for user isolation
- [ ] Security vulnerabilities resolved
- [ ] Monitoring and rollback capabilities in place

---

## ⚠️ CRITICAL: Prerequisites and Architecture Issues

**STOP: The following critical issues must be resolved before proceeding with user-aware refactoring:**

### 1. Resolve User Model Inconsistency ✅ DECISION MADE: Use Prisma User Model

There are currently TWO different User models in the codebase:

- **Prisma User Model** (`schema.prisma`): Uses integer `id` with database persistence ← **CHOSEN**
- **Entity User Model** (`entities/User.js`): Uses UUID `_id` with in-memory storage ← **REMOVE**

**Action Required:** Remove the Entity User model and ensure all authentication uses the Prisma User model. This is blocking for the entire refactor.

### 2. Fix Existing Security Vulnerability

The current `transactionRoutes.js` has a critical security flaw:

```javascript
const userId = parseInt(req.query.user_id) || 1; // ALLOWS ACCESS TO ANY USER'S DATA!
```

**Action Required:** Remove this insecure implementation before applying authentication middleware.

### 3. Enhance Authentication Middleware

The current middleware doesn't validate that the JWT user ID exists in the database:

```javascript
// Current - unsafe
req.user = { id: decoded.id };

// Needed - validate user exists
const user = await prisma.user.findUnique({ where: { id: decoded.id } });
if (!user) return res.status(401).json({ message: "User not found" });
req.user = user;
```

## Phase 1: Foundation and Security Fixes

**1.1 Resolve User Model Architecture** _(Using Prisma User Model)_

**Tasks to Complete:**

- [ ] Remove `src/models/entities/User.js` (conflicting entity model)
- [ ] Update all authentication logic to use Prisma User model only
- [ ] Ensure JWT tokens contain the Prisma User `id` (integer)
- [ ] Find and update any imports that reference `entities/User.js`
- [ ] Update authentication routes to use Prisma for user operations

**Files to Check and Update:**

- [ ] `src/routes/auth/authRoutes.js` - Update to use Prisma User
- [ ] `src/routes/auth/profileRoutes.js` - Update to use Prisma User
- [ ] `src/models/index.js` - Remove User entity export
- [ ] Any other files importing from `entities/User.js`

**Verification:**

- [ ] All user operations use `prisma.user.*` methods
- [ ] No remaining references to `entities/User.js`
- [ ] JWT creation/validation uses integer user IDs

**1.2 Enhance Authentication Middleware**

**Current Issue:** The middleware doesn't validate that JWT user IDs exist in the database.

**Required Changes:**

- [ ] Import Prisma client in the auth middleware
- [ ] Add database lookup to validate user exists
- [ ] Handle cases where user is deleted but JWT is still valid
- [ ] Add proper error logging

**Updated Implementation:**

```javascript
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_secure_secret";

export const authenticate = async (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // CRITICAL: Validate user exists in database (Prisma User model)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }, // Using integer ID from Prisma model
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // Now contains validated Prisma user data
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};
```

**1.3 Fix Existing Security Vulnerabilities**

- [ ] Remove `user_id` query parameter from `transactionRoutes.js`
- [ ] Audit all routes for similar vulnerabilities
- [ ] Ensure no direct user ID parameters in URLs or query strings

**Checklist:**

- [ ] Choose and implement single User model system
- [ ] Update authentication middleware with database validation
- [ ] Fix existing security vulnerabilities
- [ ] Test authentication middleware in isolation

## Phase 2: Create Service Layer

**2.1 Create Missing Transaction Services**

The `services/transaction/` directory is currently empty. Create:

- [ ] `transactionService.js` - All transaction CRUD operations
- [ ] `insightsService.js` - Transaction analytics and insights
- [ ] `voucherService.js` - Voucher processing (if not already user-aware)

**2.2 Service Function Patterns**

All service functions must follow this pattern with **Prisma User model (integer IDs)**:

```javascript
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// CORRECT: User-scoped service function using Prisma integer user IDs
export const getAllTransactions = async (userId) => {
  if (!userId || typeof userId !== "number") {
    throw new Error("Valid user ID (integer) is required");
  }

  return await prisma.transaction.findMany({
    where: { user_id: userId }, // userId is integer from Prisma User model
    orderBy: { date: "desc" },
    include: {
      user: {
        // Can include user data if needed
        select: { id: true, email: true, name: true },
      },
    },
  });
};

// WRONG: Global service function
export const getAllTransactions = async () => {
  return await prisma.transaction.findMany(); // Security vulnerability!
};

// WRONG: Using string/UUID user IDs (from old Entity model)
export const getAllTransactions = async (userId) => {
  return await prisma.transaction.findMany({
    where: { user_id: userId }, // Will fail if userId is UUID string
  });
};
```

**Key Points for Prisma User Model:**

- User IDs are **integers** (not UUIDs)
- Always validate `userId` is a number
- Use `prisma.user.findUnique({ where: { id: userId } })` for user operations
- Foreign keys in other tables reference integer user IDs

**Checklist:**

- [ ] Create `transactionService.js`
- [ ] Create `insightsService.js`
- [ ] Update existing services to be user-aware:
  - [ ] `recommendationService.js`
  - [ ] `menuAnalysisService.js`
  - [ ] `zhongcaoService.js`

## Phase 3: Apply Authentication Middleware to Routes

**3.1 Identify Protected Routes**

Routes that need authentication (user-specific data):

- `transactionRoutes.js`: All routes
- `insightsRoutes.js`: All routes
- `voucherRoutes.js`: All routes
- `profileRoutes.js`: All routes
- `recommendationRoutes.js`: All routes (if personalized)
- `menuAnalysisRoutes.js`: All routes (if user history tracked)
- `zhongcaoRoutes.js`: All routes (after adding user relationship)

Routes that may NOT need authentication:

- Public restaurant recommendations (if not personalized)
- Health check endpoints
- Authentication routes themselves

**3.2 Apply Middleware Systematically**

```javascript
import { authenticate } from "../middleware/auth.js";

// Apply to specific routes
router.get("/", authenticate, async (req, res) => {
  const userId = req.user.id; // Now guaranteed to exist and be valid
  // ...
});

// Or apply to all routes in a file
router.use(authenticate); // Apply to all subsequent routes
```

**Checklist:**

- [ ] `transactionRoutes.js`
- [ ] `insightsRoutes.js`
- [ ] `voucherRoutes.js`
- [ ] `profileRoutes.js`
- [ ] `recommendationRoutes.js` (evaluate if needed)
- [ ] `menuAnalysisRoutes.js` (evaluate if needed)
- [ ] `zhongcaoRoutes.js` (after Phase 4)

## Phase 4: Update Route Handlers to Use Services

**4.1 Refactor Routes to Use Service Layer**

All routes must follow this pattern:

```javascript
import { authenticate } from "../middleware/auth.js";
import * as transactionService from "../services/transaction/transactionService.js";

router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id; // Guaranteed to exist after authentication
    const transactions = await transactionService.getAllTransactions(userId);
    res.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});
```

**4.2 Remove Direct Database Access**

Routes should NEVER directly use Prisma. All database access must go through services.

```javascript
// WRONG: Direct Prisma access in route
const transactions = await prisma.transaction.findMany({
  where: { user_id: userId },
});

// CORRECT: Use service layer
const transactions = await transactionService.getAllTransactions(userId);
```

**Checklist:**

- [ ] `transactionRoutes.js` - Move Prisma queries to service
- [ ] `insightsRoutes.js` - Ensure uses service layer
- [ ] `voucherRoutes.js` - Move any direct DB access to service
- [ ] `profileRoutes.js` - Use service layer
- [ ] Other routes as needed

## Phase 5: Handle Models Without User Relationships

**5.1 ZhongcaoResult Model Migration**

The `ZhongcaoResult` model currently has no user relationship. **CRITICAL DECISION NEEDED:**

**Option A: Make ZhongcaoResult User-Specific**
If restaurant analysis should be per-user:

```prisma
model ZhongcaoResult {
  id                  Int      @id @default(autoincrement())
  user_id             Int      // ADD THIS
  originalFilename    String
  restaurantName      String
  dishName            String?
  address             String?
  description         String
  socialMediaHandle   String?
  processedAt         DateTime
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  // ADD THIS RELATION
  user User @relation(fields: [user_id], references: [id])
}
```

**Safe Migration Strategy:**

```sql
-- Step 1: Add nullable user_id column
ALTER TABLE "ZhongcaoResult" ADD COLUMN "user_id" INTEGER;

-- Step 2: Update existing records (assign to a default user or delete)
UPDATE "ZhongcaoResult" SET "user_id" = 1 WHERE "user_id" IS NULL;

-- Step 3: Make column NOT NULL and add foreign key
ALTER TABLE "ZhongcaoResult" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "ZhongcaoResult" ADD CONSTRAINT "ZhongcaoResult_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE;
```

**Option B: Keep ZhongcaoResult Global**
If restaurant analysis should be shared across all users, keep it as-is but ensure the service doesn't leak data inappropriately.

**Checklist:**

- [ ] Decide if ZhongcaoResult should be user-specific
- [ ] If yes: Update `schema.prisma` with user relationship
- [ ] If yes: Create and run safe migration
- [ ] Update `zhongcaoService.js` accordingly
- [ ] Update `zhongcaoRoutes.js` with authentication

## Phase 6: Comprehensive Testing Strategy

**6.1 Unit Testing**

Test each service function in isolation:

```javascript
// Example test
describe("TransactionService", () => {
  it("should only return transactions for the specified user", async () => {
    // Create test data for multiple users
    const user1 = await createTestUser();
    const user2 = await createTestUser();

    await createTestTransaction({ user_id: user1.id, amount: 100 });
    await createTestTransaction({ user_id: user2.id, amount: 200 });

    // Test that service returns only user1's transactions
    const transactions = await transactionService.getAllTransactions(user1.id);

    expect(transactions).toHaveLength(1);
    expect(transactions[0].amount).toBe(100);
    expect(transactions[0].user_id).toBe(user1.id);
  });
});
```

**6.2 Integration Testing**

Test complete request flows:

```javascript
describe("Transaction Routes", () => {
  it("should return 401 without valid token", async () => {
    const response = await request(app).get("/api/transactions").expect(401);
  });

  it("should return only user-specific data with valid token", async () => {
    const user = await createTestUser();
    const token = generateJWT(user.id);

    const response = await request(app)
      .get("/api/transactions")
      .set("x-auth-token", token)
      .expect(200);

    // Verify all returned transactions belong to the user
    response.body.transactions.forEach((transaction) => {
      expect(transaction.user_id).toBe(user.id);
    });
  });
});
```

**6.3 Security Testing**

Critical security tests:

```javascript
describe("Security Tests", () => {
  it("should not allow access to other users data", async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const user1Token = generateJWT(user1.id);

    // Create transaction for user2
    await createTestTransaction({ user_id: user2.id });

    // Try to access with user1's token
    const response = await request(app)
      .get("/api/transactions")
      .set("x-auth-token", user1Token)
      .expect(200);

    // Should not see user2's transactions
    expect(response.body.transactions).toHaveLength(0);
  });

  it("should reject invalid user IDs in JWT", async () => {
    const invalidToken = generateJWT(99999); // Non-existent user

    await request(app)
      .get("/api/transactions")
      .set("x-auth-token", invalidToken)
      .expect(401);
  });
});
```

**Checklist:**

- [ ] Create unit tests for all service functions
- [ ] Create integration tests for all protected routes
- [ ] Create security tests for user isolation
- [ ] Test authentication middleware edge cases
- [ ] Test error handling scenarios

## Phase 7: Rollback and Monitoring

**7.1 Rollback Strategy**

Prepare for rollback if issues arise:

- [ ] Document current API behavior before changes
- [ ] Create database backup before migrations
- [ ] Implement feature flags for gradual rollout
- [ ] Prepare rollback scripts for database migrations

**7.2 Monitoring and Alerts**

Add monitoring for the refactor:

- [ ] Log authentication failures
- [ ] Monitor for 401/403 error rate increases
- [ ] Track API response times (middleware adds database calls)
- [ ] Alert on unusual user access patterns

**7.3 Gradual Deployment**

Deploy incrementally:

1. Deploy Phase 1 (authentication fixes) first
2. Deploy Phase 2 (services) second
3. Deploy Phase 3-4 (route updates) per route file
4. Monitor each phase before proceeding

## Summary

This phased approach addresses the critical architectural issues:

1. **Phase 1**: Fixes fundamental security and architecture problems
2. **Phase 2**: Establishes proper service layer
3. **Phase 3-4**: Applies authentication systematically
4. **Phase 5**: Handles edge cases (ZhongcaoResult)
5. **Phase 6**: Ensures comprehensive testing
6. **Phase 7**: Provides safety nets and monitoring

**Key Improvements Over Original Plan:**

- ✅ Identifies and fixes critical User model inconsistency
- ✅ Addresses existing security vulnerabilities first
- ✅ Enhances authentication middleware with database validation
- ✅ Creates missing service layer before applying authentication
- ✅ Provides safe database migration strategy
- ✅ Includes comprehensive testing and rollback plans
- ✅ Phases work to minimize risk

**CRITICAL**: Do not proceed with authentication middleware until Phase 1 is complete, or the refactor will fail due to the User model inconsistency.
