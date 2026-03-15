import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users } from "@/src/schema/users";
import type { UserRole } from "@/src/schema/enums";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    role: UserRole;
    accountStatus: string | null;
  }

  interface Session {
    user: User & {
      id: string;
      role: UserRole;
      accountStatus: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    accountStatus: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1);

        if (!user) return null;

        const bannedOrSuspended =
          user.accountStatus === "banned" || user.accountStatus === "suspended";
        if (bannedOrSuspended) return null;

        if (user.accountStatus === "pending") {
          // Optional: block pending users from login until verified
          // return null;
        }

        const valid = await compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          accountStatus: user.accountStatus,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.accountStatus = user.accountStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email ?? "";
        session.user.role = token.role;
        session.user.accountStatus = token.accountStatus;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
