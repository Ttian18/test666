# 🚀 Bun Guide for MealMint AI Project

## 📋 Overview

Bun is an all-in-one JavaScript runtime & toolkit designed for speed. It includes a package manager, bundler, and test runner that's significantly faster than npm/yarn/pnpm.

## ⚡ Performance Benefits

| Task | npm | Bun | Speed Improvement |
|------|-----|-----|-------------------|
| **Install Dependencies** | ~30-60s | ~5-15s | **3-4x faster** |
| **Dev Server Start** | ~3-5s | ~1-2s | **2-3x faster** |
| **Build Time** | ~15-30s | ~8-15s | **2x faster** |
| **Test Execution** | Variable | Very fast | **Up to 10x faster** |

## 🛠 Setup & Installation

### 1. **Install Bun (if not already installed)**
```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows (via npm)
npm install -g bun

# Verify installation
bun --version
```

### 2. **Project Setup**
```bash
# Install dependencies (replaces npm install)
bun install

# Clean install (removes node_modules and reinstalls)
bun run install:clean
```

## 🎯 Daily Development Commands

### **Development Server**
```bash
# Start development server with Bun (fastest)
bun run dev

# Alternative: Start with npm (fallback)
bun run dev:npm

# The dev server will start at http://localhost:5173
```

### **Building the Project**
```bash
# Build for production with Bun
bun run build

# Build for development with Bun
bun run build:dev

# Preview production build
bun run preview
```

### **Code Quality**
```bash
# Run ESLint with Bun
bun run lint

# Type checking
bun run type-check

# Format code (requires prettier)
bun run format

# Run all checks
bun run check
```

## 🧪 Testing with Bun

### **Setup Testing**
Bun has a built-in test runner that's extremely fast. Let's set it up:

```bash
# Create a test file
touch src/utils/test-utils.ts
```

### **Example Test File**
```typescript
// src/utils/__tests__/auth.test.ts
import { expect, test, describe } from "bun:test";

describe("Authentication Utils", () => {
  test("should validate JWT format", () => {
    const mockToken = "header.payload.signature";
    expect(mockToken.split('.').length).toBe(3);
  });

  test("should handle token expiry", () => {
    const now = Date.now() / 1000;
    const expiredToken = { exp: now - 3600 }; // 1 hour ago
    expect(expiredToken.exp < now).toBe(true);
  });
});
```

### **Running Tests**
```bash
# Run all tests
bun test

# Run tests in watch mode
bun run test:watch

# Run specific test file
bun test src/utils/__tests__/auth.test.ts

# Run tests with coverage
bun test --coverage
```

## 📦 Package Management

### **Adding Dependencies**
```bash
# Add production dependency
bun add react-query

# Add development dependency
bun add -d @types/jest

# Add specific version
bun add lodash@4.17.21

# Remove dependency
bun remove package-name
```

### **Dependency Management**
```bash
# Update all dependencies
bun update

# Update specific dependency
bun update react

# Check outdated packages
bun outdated

# Audit dependencies
bun audit
```

## 🏗 Build Optimization

### **Bun-Optimized Vite Config**
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Force pre-bundling of these packages
    include: ['react', 'react-dom', 'zustand']
  },
  build: {
    // Optimize for Bun's fast bundling
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast'],
          utils: ['zustand', 'react-router-dom']
        }
      }
    }
  }
})
```

## 🔧 Troubleshooting

### **Common Issues & Solutions**

#### **1. Node.js Compatibility**
If you encounter Node.js specific issues:
```bash
# Use npm scripts as fallback
bun run dev:npm
bun run build:npm
bun run lint:npm
```

#### **2. Module Resolution**
If modules aren't found:
```bash
# Clear cache and reinstall
rm -rf node_modules bun.lockb
bun install
```

#### **3. TypeScript Issues**
```bash
# Run type checking separately
bun run type-check

# Clear TypeScript cache
rm -rf .tsc-cache
```

#### **4. Performance Issues**
```bash
# Check Bun version
bun --version

# Update Bun
curl -fsSL https://bun.sh/install | bash

# Use more memory for large projects
BUN_CONFIG_MAX_HTTP_REQUESTS=100 bun run dev
```

## 🚀 Production Deployment

### **Building for Production**
```bash
# Build optimized production bundle
bun run build

# Verify build output
ls -la dist/

# Test production build locally
bun run preview
```

### **Deployment Commands**
```bash
# Vercel deployment
bun add -g vercel
vercel --prod

# Netlify deployment
bun add -g netlify-cli
netlify deploy --prod

# Docker deployment (Dockerfile)
FROM oven/bun:1 as dependencies
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

FROM dependencies as build
COPY . .
RUN bun run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

## 📊 Performance Monitoring

### **Bundle Analysis**
```bash
# Install bundle analyzer
bun add -d rollup-plugin-analyzer

# Analyze bundle size
bun run build && bun run analyze
```

### **Development Metrics**
```bash
# Measure dev server startup time
time bun run dev

# Memory usage monitoring
bun --inspect run dev
```

## 🎯 Best Practices

### **1. Lock File Management**
- Commit `bun.lockb` to version control
- Use `bun install --frozen-lockfile` in CI/CD
- Regularly update dependencies with `bun update`

### **2. Performance Optimization**
- Use `bun --bun` flag for maximum speed
- Pre-bundle large dependencies in Vite config
- Use Bun's built-in test runner for fastest testing

### **3. Development Workflow**
```bash
# Morning routine
bun install          # Update dependencies
bun run dev         # Start development server
bun run test:watch  # Run tests in watch mode

# Before committing
bun run check       # Lint and build
bun test           # Run all tests
```

### **4. Team Collaboration**
- Ensure all team members use Bun for consistency
- Document Bun version in README
- Provide npm fallback scripts for compatibility

## 🔄 Migration from npm/yarn

### **Step-by-Step Migration**
1. **Install Bun**: `curl -fsSL https://bun.sh/install | bash`
2. **Remove old lock files**: `rm package-lock.json yarn.lock`
3. **Install with Bun**: `bun install`
4. **Update scripts**: Use the scripts we've already configured
5. **Test everything**: `bun run dev` and verify all functionality

### **Compatibility Notes**
- ✅ **Works perfectly**: React, Vite, TypeScript, ESLint
- ✅ **Great support**: Most npm packages, Radix UI, Zustand
- ⚠️ **Possible issues**: Some Node.js specific packages
- 🔄 **Fallback**: Use `bun run dev:npm` if needed

## 📈 Expected Performance Improvements

Based on your MealMint AI project:

- **Development server startup**: 3-5s → 1-2s
- **Dependency installation**: 96s (current) → 15-20s
- **Build time**: ~30s → ~15s
- **Test execution**: Significantly faster
- **Hot reload**: Faster module replacement

## 🎉 Getting Started Right Now

```bash
# 1. Start development with Bun
bun run dev

# 2. In another terminal, run tests
bun run test:watch

# 3. Make changes and see instant hot reload

# 4. When ready to build
bun run build

# 5. Preview production build
bun run preview
```

Your MealMint AI project is now fully optimized for Bun! 🚀✨
