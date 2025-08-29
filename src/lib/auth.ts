import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = (user as any).role
        token.teamId = (user as any).teamId
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        (session.user as any).role = token.role
        (session.user as any).teamId = token.teamId
      }
      return session
    },
  },
  providers: [
    // Add your authentication providers here
    // For now, we'll use credentials for development
  ],
})
