//lib/auth.ts

//Authentication configuration for NextAuth and PrismaAdapter 
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"

//NextAuth's CredentialsProvider - handles authorization.

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    
    session: {
        strategy: "jwt", //employ JWT for session management rather than database-stored sessions
    },
    //redirect users to a custom /auth/login page instead of the default NextAuth sign-in screen
    pages: {
        signIn: "/auth/login",
    },
    providers: [
        //allowing users to log in with an email and password.manually queries the db, verify user exists, & checks the hashed password using bcrypt
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials")
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                })

                if (!user || !user.password) {
                    throw new Error("User not found")
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

                if (!isPasswordValid) {
                    throw new Error("Invalid password")
                }

                return user
            },
        }),
    ],
    callbacks: {
        //jwt callback to attach user's id and role from the database to the token upon login
        async jwt({ token, user, trigger, session }) {
            if (user) {
        return {
            ...token,
            id: user.id,
            role: user.role,
        }
    }
    return token;
        },
        //session callback then passes that data from the token into the client-side session object, making 'session.user.role' accessible in components
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id
                session.user.role = token.role
            }
            return session
        },
    },
}
