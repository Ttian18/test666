/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NODE_ENV: string
  readonly VITE_API_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_JWT_SECRET: string
  readonly VITE_JWT_EXPIRES_IN: string
  readonly VITE_REFRESH_TOKEN_EXPIRES_IN: string
  readonly VITE_AI_SERVICE_URL: string
  readonly VITE_AI_API_KEY: string
  readonly VITE_DATABASE_URL: string
  readonly VITE_ANALYTICS_ID: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_ENABLE_DEV_TOOLS: string
  readonly VITE_ENABLE_MOCK_DATA: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
