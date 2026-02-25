//types/next-auth.d.ts

// Type definitions for NextAuth and next-auth/jwt for role integration with Prisma and NextAuth
import NextAuth, { type DefaultSession } from "next-auth"
import type { Role } from "@prisma/client"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: Role
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        role: Role
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: Role
    }
}
