import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users } from "@/src/schema";
import type { UserRole } from "@/src/schema/enums";
import { expireAccountRestrictionIfNeeded } from "@/lib/account-restrictions";

declare module "next-auth" {
  interface User {
    id: string;
    name: string | null;
    email: string;
    role: UserRole;
    accountStatus: string | null;
    restrictionEndsAt?: string | null;
    /** Set only inside authorize when login must be blocked; stripped before session */
    loginBlocked?: boolean;
  }

  interface Session {
    user: User & {
      id: string;
      name: string | null;
      role: UserRole;
      accountStatus: string | null;
      restrictionEndsAt: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string | null;
    role: UserRole;
    accountStatus: string | null;
    restrictionEndsAt: string | null;
    statusSyncedAt?: number;
  }
}

const SESSION_STATUS_SYNC_INTERVAL_MS = 15_000;

function restrictionToIso(value: Date | null | undefined): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return null;
}

async function syncTokenModerationState(token: JWT) {
  if (!token.id) return;

  await expireAccountRestrictionIfNeeded(token.id);

  const [row] = await db
    .select({
      accountStatus: users.accountStatus,
      restrictionEndsAt: users.restrictionEndsAt,
    })
    .from(users)
    .where(eq(users.id, token.id))
    .limit(1);

  if (!row) return;

  token.accountStatus = row.accountStatus;
  token.restrictionEndsAt = restrictionToIso(row.restrictionEndsAt ?? undefined);
  token.statusSyncedAt = Date.now();
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

        const email = credentials.email.trim().toLowerCase();

        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (!user) return null;

        const valid = await compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        await expireAccountRestrictionIfNeeded(user.id);

        const [fresh] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
        if (!fresh) return null;

        if (fresh.accountStatus === "banned") {
          return {
            id: fresh.id,
            name: fresh.name ?? null,
            email: fresh.email,
            role: fresh.role,
            accountStatus: fresh.accountStatus,
            restrictionEndsAt: restrictionToIso(fresh.restrictionEndsAt ?? undefined),
            loginBlocked: true,
          };
        }

        if (fresh.accountStatus === "pending") {
          // Optional: block pending users from login until verified
          // return null;
        }

        return {
          id: fresh.id,
          name: fresh.name ?? null,
          email: fresh.email,
          role: fresh.role,
          accountStatus: fresh.accountStatus,
          restrictionEndsAt: restrictionToIso(fresh.restrictionEndsAt ?? undefined),
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user && "loginBlocked" in user && user.loginBlocked) {
        const ends =
          user.restrictionEndsAt && typeof user.restrictionEndsAt === "string"
            ? user.restrictionEndsAt
            : "";
        const qs = ends
          ? `?error=banned&ends=${encodeURIComponent(ends)}`
          : "?error=banned";
        return `/login${qs}`;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name ?? null;
        token.email = user.email ?? token.email;
        token.role = user.role;
        token.accountStatus = user.accountStatus;
        token.restrictionEndsAt = user.restrictionEndsAt ?? null;
        token.statusSyncedAt = Date.now();
      }

      const shouldSyncStatus =
        Boolean(token.id) &&
        (token.accountStatus === "suspended" ||
          token.accountStatus === "banned" ||
          typeof token.statusSyncedAt !== "number" ||
          Date.now() - token.statusSyncedAt >= SESSION_STATUS_SYNC_INTERVAL_MS);

      if (shouldSyncStatus) {
        await syncTokenModerationState(token);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name ?? null;
        session.user.email = token.email ?? "";
        session.user.role = token.role;
        session.user.accountStatus = token.accountStatus;
        session.user.restrictionEndsAt = token.restrictionEndsAt ?? null;
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
