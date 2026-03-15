import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users } from "@/src/schema/users";
import { authOptions } from "@/lib/auth";
import { withCorsHeaders } from "@/lib/cors";

function jsonResponse(
  data: object,
  status: number,
  origin: string | null
): NextResponse {
  const res = NextResponse.json(data, { status });
  Object.entries(withCorsHeaders(origin)).forEach(([key, value]) => {
    res.headers.set(key, value);
  });
  return res;
}

/** Profile fields exposed to the client (no passwordHash) */
const PROFILE_SELECT = {
  id: users.id,
  email: users.email,
  role: users.role,
  accountStatus: users.accountStatus,
  isAnonymous: users.isAnonymous,
  likedTags: users.likedTags,
  ageGroup: users.ageGroup,
  gender: users.gender,
  location: users.location,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
} as const;

export async function OPTIONS(_request: NextRequest) {
  const origin = _request.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: withCorsHeaders(origin),
  });
}

/**
 * GET /api/profile
 * Returns the current authenticated user's profile (safe fields only).
 */
export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return jsonResponse({ error: "Unauthorized" }, 401, origin);
  }

  try {
    const [user] = await db
      .select(PROFILE_SELECT)
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return jsonResponse({ error: "User not found" }, 404, origin);
    }

    return jsonResponse(user, 200, origin);
  } catch (err) {
    console.error("Profile GET error:", err);
    return jsonResponse(
      { error: "Failed to load profile" },
      500,
      origin
    );
  }
}

/**
 * PATCH /api/profile
 * Updates the current user's profile (privacy preferences and optional profile fields).
 * Body: { isAnonymous?: boolean, likedTags?: string[], ageGroup?: string, gender?: string, location?: string }
 */
export async function PATCH(request: NextRequest) {
  const origin = request.headers.get("origin");
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return jsonResponse({ error: "Unauthorized" }, 401, origin);
  }

  try {
    const body = await request.json();
    if (typeof body !== "object" || body === null) {
      return jsonResponse({ error: "Invalid body" }, 400, origin);
    }

    const updates: {
      isAnonymous?: boolean;
      likedTags?: string[] | null;
      ageGroup?: string | null;
      gender?: string | null;
      location?: string | null;
      updatedAt: Date;
    } = { updatedAt: new Date() };

    if (typeof body.isAnonymous === "boolean") {
      updates.isAnonymous = body.isAnonymous;
    }
    if (Array.isArray(body.likedTags)) {
      updates.likedTags = body.likedTags.filter(
        (t: unknown): t is string => typeof t === "string"
      );
    }
    if (typeof body.ageGroup === "string") {
      const v = body.ageGroup.trim().slice(0, 50);
      updates.ageGroup = v || null;
    }
    if (typeof body.gender === "string") {
      const v = body.gender.trim().slice(0, 30);
      updates.gender = v || null;
    }
    if (typeof body.location === "string") {
      const v = body.location.trim().slice(0, 100);
      updates.location = v || null;
    }

    if (Object.keys(updates).length <= 1) {
      return jsonResponse(
        { error: "No valid fields to update" },
        400,
        origin
      );
    }

    await db
      .update(users)
      .set(updates)
      .where(eq(users.id, session.user.id));

    const [updated] = await db
      .select(PROFILE_SELECT)
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    return jsonResponse(updated ?? {}, 200, origin);
  } catch (err) {
    console.error("Profile PATCH error:", err);
    return jsonResponse(
      { error: "Failed to update profile" },
      500,
      origin
    );
  }
}
