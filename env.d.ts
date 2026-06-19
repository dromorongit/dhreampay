/// <reference types="next" />
/// <reference types="next/types/global" />

namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string
    NEXTAUTH_SECRET: string
    NEXTAUTH_URL: string
    NODE_ENV: string
  }
}