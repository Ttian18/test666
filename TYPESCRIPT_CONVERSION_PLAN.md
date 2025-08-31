# Backend TypeScript Conversion Plan

## Overview

Convert the Node.js/Express backend from JavaScript to TypeScript to enable direct imports from the schema package's TypeScript source files, eliminating the need to build the schema package after every change.

## Current State Analysis

- **Server**: ~30+ JavaScript files across routes, services, models, utils
- **Schema Package**: TypeScript with build process (src → dist)
- **Current Import Pattern**: Server imports from `schema` (compiled dist files)
- **Target Import Pattern**: Server imports directly from `schema/src/*` (TypeScript sources)

## Phase-by-Phase Conversion Plan

### Phase 1: TypeScript Foundation Setup ✅ COMPLETED

**Goal**: Set up TypeScript infrastructure without breaking existing functionality

**Dependencies to Install**:

```bash
cd packages/server
npm install -D typescript @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken @types/multer ts-node nodemon
```

**TypeScript Configuration** (`tsconfig.json`):

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "schema/*": ["../schema/src/*"],
      "schema": ["../schema/src/index.ts"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

**Updated package.json Scripts**:

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "start": "node dist/index.js",
    "build": "tsc",
    "build:watch": "tsc -w",
    "type-check": "tsc --noEmit",
    "seed": "ts-node src/models/database/seed.ts",
    "test": "NODE_OPTIONS='--experimental-vm-modules --no-warnings' jest",
    "test:watch": "NODE_OPTIONS='--experimental-vm-modules --no-warnings' jest --watch",
    "test:coverage": "NODE_OPTIONS='--experimental-vm-modules --no-warnings' jest --coverage",
    "test:reco": "ts-node test/runRecommendation.ts"
  }
}
```

**Phase 1 Checklist - COMPLETED**:
- [x] Installed TypeScript dependencies (`typescript`, `@types/*`, `ts-node`, `nodemon`)
- [x] Created `tsconfig.json` with proper configuration for Node.js/Express
- [x] Configured path mapping for direct schema imports (`schema/*` → `../schema/src/*`)
- [x] Updated `package.json` scripts to use TypeScript tools
- [x] Created `nodemon.json` configuration for TypeScript development
- [x] Updated Jest configuration to support TypeScript and direct schema imports
- [x] Set up development workflow foundation (ready for file conversion)

### Phase 2: Core Infrastructure Conversion

**Goal**: Convert foundational files that other modules depend on

**Priority Order**:

1. **Configuration Files**

   - [ ] `src/config/app.js` → `src/config/app.ts`
   - [ ] `src/config/database.js` → `src/config/database.ts`
   - [ ] `src/config/openai.js` → `src/config/openai.ts`

2. **Main Entry Points**

   - [ ] `server.js` → `server.ts`
   - [ ] `src/index.js` → `src/index.ts`

3. **Middleware**

   - [ ] `src/routes/middleware/auth.js` → `src/routes/middleware/auth.ts`
   - [ ] `src/routes/middleware/upload.js` → `src/routes/middleware/upload.ts`

4. **Database Client**
   - [ ] `src/models/database/client.js` → `src/models/database/client.ts`

### Phase 3: Models and Entities Conversion

**Goal**: Convert data models with proper typing

**Files to Convert**:

- [ ] `src/models/entities/Profile.js` → `src/models/entities/Profile.ts`
- [ ] `src/models/entities/Restaurant.js` → `src/models/entities/Restaurant.ts`
- [ ] `src/models/entities/Transaction.js` → `src/models/entities/Transaction.ts`
- [ ] `src/models/entities/Voucher.js` → `src/models/entities/Voucher.ts`
- [ ] `src/models/index.js` → `src/models/index.ts`

**Type Integration**:

- Import Prisma generated types
- Use schema package types directly
- Add proper interfaces for all entities

### Phase 4: Services Layer Conversion

**Goal**: Convert business logic with enhanced type safety

**Authentication Services**:

- [ ] `src/services/auth/authUtils.js` → `src/services/auth/authUtils.ts`
- [ ] `src/services/auth/profileService.js` → `src/services/auth/profileService.ts`
- [ ] `src/services/auth/tokenBlacklistService.js` → `src/services/auth/tokenBlacklistService.ts`
- [ ] `src/services/auth/tokenCleanupService.js` → `src/services/auth/tokenCleanupService.ts`

**Transaction Services**:

- [ ] `src/services/transaction/transactionService.js` → `src/services/transaction/transactionService.ts`
- [ ] `src/services/transaction/voucherService.js` → `src/services/transaction/voucherService.ts`

**Restaurant Services**:

- [ ] `src/services/restaurant/budgetRecommendationService.js` → `src/services/restaurant/budgetRecommendationService.ts`
- [ ] `src/services/restaurant/menuAnalysisController.js` → `src/services/restaurant/menuAnalysisController.ts`
- [ ] `src/services/restaurant/menuAnalysisService.js` → `src/services/restaurant/menuAnalysisService.ts`
- [ ] `src/services/restaurant/recommendationService.js` → `src/services/restaurant/recommendationService.ts`

**Zhongcao Services**:

- [ ] `src/services/restaurant/zhongcao/crudOperations.js` → `src/services/restaurant/zhongcao/crudOperations.ts`
- [ ] `src/services/restaurant/zhongcao/imageExtraction.js` → `src/services/restaurant/zhongcao/imageExtraction.ts`
- [ ] `src/services/restaurant/zhongcao/index.js` → `src/services/restaurant/zhongcao/index.ts`

**AI and Other Services**:

- [ ] `src/services/ai/openaiService.js` → `src/services/ai/openaiService.ts`
- [ ] `src/services/insights/insightsService.js` → `src/services/insights/insightsService.ts`

### Phase 5: Routes and Controllers Conversion

**Goal**: Convert API endpoints with request/response typing

**Authentication Routes**:

- [ ] `src/routes/auth/authRoutes.js` → `src/routes/auth/authRoutes.ts`
- [ ] `src/routes/auth/blacklistRoutes.js` → `src/routes/auth/blacklistRoutes.ts`
- [ ] `src/routes/auth/profileRoutes.js` → `src/routes/auth/profileRoutes.ts`
- [ ] `src/routes/auth/index.js` → `src/routes/auth/index.ts`

**Transaction Routes**:

- [ ] `src/routes/transaction/transactionRoutes.js` → `src/routes/transaction/transactionRoutes.ts`
- [ ] `src/routes/transaction/voucherRoutes.js` → `src/routes/transaction/voucherRoutes.ts`
- [ ] `src/routes/transaction/index.js` → `src/routes/transaction/index.ts`

**Restaurant Routes**:

- [ ] `src/routes/restaurant/menuAnalysisRoutes.js` → `src/routes/restaurant/menuAnalysisRoutes.ts`
- [ ] `src/routes/restaurant/recommendationRoutes.js` → `src/routes/restaurant/recommendationRoutes.ts`
- [ ] `src/routes/restaurant/zhongcaoRoutes.js` → `src/routes/restaurant/zhongcaoRoutes.ts`
- [ ] `src/routes/restaurant/index.js` → `src/routes/restaurant/index.ts`

**Insights Routes**:

- [ ] `src/routes/insights/insightsRoutes.js` → `src/routes/insights/insightsRoutes.ts`
- [ ] `src/routes/insights/index.js` → `src/routes/insights/index.ts`

### Phase 6: Utilities Conversion

**Goal**: Convert utility functions with proper typing

**Utility Files**:

- [ ] `src/utils/cache/menuAnalysisCache.js` → `src/utils/cache/menuAnalysisCache.ts`
- [ ] `src/utils/errors/menuAnalysisErrors.js` → `src/utils/errors/menuAnalysisErrors.ts`
- [ ] `src/utils/logging/langchainLogger.js` → `src/utils/logging/langchainLogger.ts`
- [ ] `src/utils/upload/uploadUtils.js` → `src/utils/upload/uploadUtils.ts`
- [ ] `src/utils/validation/validationUtils.js` → `src/utils/validation/validationUtils.ts`

### Phase 7: Direct Schema Integration

**Goal**: Update imports to use TypeScript sources directly

**Schema Package Updates**:

1. **Update `packages/schema/package.json`**:

   ```json
   {
     "exports": {
       ".": {
         "types": "./dist/index.d.ts",
         "import": "./dist/index.js"
       },
       "./src/*": "./src/*",
       "./types/*": "./src/types/*"
     }
   }
   ```

2. **Server Import Updates**:
   - [ ] Replace `import { restaurantSchema } from "schema"`
   - [ ] With `import { restaurantSchema } from "schema/src/types/zhongcao"`
   - [ ] Update all schema imports across the server

**Key Import Conversions**:

```typescript
// Before (requires schema build)
import { restaurantSchema, fallbackRestaurantData } from "schema";
import { findMerchantCategory, categories as allCategories } from "schema";

// After (direct TypeScript imports)
import {
  restaurantSchema,
  fallbackRestaurantData,
} from "schema/src/types/zhongcao";
import {
  findMerchantCategory,
  categories as allCategories,
} from "schema/src/category";
```

### Phase 8: Testing and Validation

**Goal**: Ensure everything works correctly

**Test Conversions**:

- [ ] `test/zhongcao/test-extraction.js` → `test/zhongcao/test-extraction.ts`
- [ ] Update Jest configuration for TypeScript
- [ ] Add type checking to test pipeline

**Validation Checklist**:

- [ ] All API endpoints respond correctly
- [ ] Database operations work as expected
- [ ] Schema validation functions properly
- [ ] Direct imports work without schema builds
- [ ] Hot reloading works in development
- [ ] Production build works correctly
- [ ] Tests pass with TypeScript
- [ ] No type errors in IDE

## Implementation Strategy

### Recommended Approach: Gradual Migration

1. **Start with Phase 1** - Set up TypeScript infrastructure
2. **Convert in dependency order** - Core files first, then dependent files
3. **Test after each phase** - Ensure functionality remains intact
4. **Maintain backward compatibility** - Keep both `.js` and `.ts` files temporarily if needed

### Alternative Approach: Big Bang Migration

- Convert all files at once
- Higher risk but faster completion
- Requires more careful planning and testing

## Expected Benefits

### Development Experience

- ✅ **No Schema Builds**: Changes to schema reflect immediately
- ✅ **Better IntelliSense**: Full type information in IDE
- ✅ **Compile-time Error Detection**: Catch errors before runtime
- ✅ **Better Refactoring**: Safe renaming and restructuring

### Code Quality

- ✅ **Type Safety**: Prevent runtime type errors
- ✅ **Self-documenting Code**: Types serve as documentation
- ✅ **Better API Contracts**: Clear input/output types
- ✅ **Easier Onboarding**: New developers understand code faster

### Maintenance

- ✅ **Easier Debugging**: Better stack traces with source maps
- ✅ **Safer Changes**: TypeScript catches breaking changes
- ✅ **Better Testing**: Type-safe test setup
- ✅ **Consistent Codebase**: Same language across all packages

## Potential Challenges

### Technical Challenges

- **Import Path Resolution**: Ensuring direct TypeScript imports work correctly
- **Build Configuration**: Setting up proper TypeScript compilation
- **Jest Configuration**: Making tests work with TypeScript
- **Prisma Integration**: Ensuring generated types work properly

### Development Workflow

- **Learning Curve**: Team needs to adapt to TypeScript
- **Initial Setup Time**: Converting 30+ files takes time
- **Debugging Setup**: Configuring source maps and debugging

## Migration Timeline Estimate

- **Small Team (1-2 developers)**: 2-3 days
- **Medium Team (3-5 developers)**: 1-2 days (parallel work)
- **Large Team (5+ developers)**: 1 day (highly parallel)

## Success Criteria

1. ✅ Server runs successfully with TypeScript
2. ✅ All existing functionality preserved
3. ✅ Schema changes reflect without builds
4. ✅ No TypeScript compilation errors
5. ✅ All tests pass
6. ✅ Development hot reloading works
7. ✅ Production build succeeds

---

## Quick Start Commands

### Phase 1 - Setup TypeScript

```bash
# Install dependencies
cd packages/server
npm install -D typescript @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken @types/multer ts-node nodemon

# Create tsconfig.json (see configuration above)

# Update package.json scripts (see scripts above)
```

### Phase 2-6 - File Conversion

```bash
# For each .js file, rename to .ts and fix TypeScript errors
# Example:
mv src/config/app.js src/config/app.ts
# Then fix any TypeScript compilation errors
```

### Phase 7 - Direct Schema Imports

```bash
# Update schema package.json exports
# Update all import statements in server files
# Test that schema changes work without builds
```

### Phase 8 - Testing

```bash
# Run type checking
npm run type-check

# Run tests
npm test

# Test development server
npm run dev

# Test production build
npm run build && npm start
```

---

**Next Steps**: Start with Phase 1 to set up the TypeScript foundation, then proceed through each phase systematically.
