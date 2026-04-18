import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users, doctorProfiles } from "@/src/schema";
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
  name: users.name,
  email: users.email,
  role: users.role,
  accountStatus: users.accountStatus,
  restrictionEndsAt: users.restrictionEndsAt,
  isAnonymous: users.isAnonymous,
  likedTags: users.likedTags,
  ageGroup: users.ageGroup,
  gender: users.gender,
  location: users.location,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
} as const;

const DOCTOR_PROFILE_SELECT = {
  specialty: doctorProfiles.specialty,
  bio: doctorProfiles.bio,
  qualifications: doctorProfiles.qualifications,
  institution: doctorProfiles.institution,
  availabilityInfo: doctorProfiles.availabilityInfo,
} as const;

const EMPTY_DOCTOR_PROFILE = {
  specialty: null,
  bio: null,
  qualifications: null,
  institution: null,
  availabilityInfo: null,
};

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

    const payload: Record<string, unknown> = { ...user };

    if (user.role === "doctor") {
      const [doctorProfile] = await db
        .select(DOCTOR_PROFILE_SELECT)
        .from(doctorProfiles)
        .where(eq(doctorProfiles.userId, user.id))
        .limit(1);
      payload.doctorProfile = doctorProfile ?? EMPTY_DOCTOR_PROFILE;
    }

    return jsonResponse(payload, 200, origin);
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
 * Updates the current user's profile.
 * Body: { isAnonymous?: boolean, likedTags?: string[], ageGroup?: string, gender?: string, location?: string, specialty?: string, availabilityInfo?: string }
 * specialty and availabilityInfo only apply when role is doctor.
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
      name?: string | null;
      isAnonymous?: boolean;
      likedTags?: string[] | null;
      ageGroup?: string | null;
      gender?: string | null;
      location?: string | null;
      updatedAt: Date;
    } = { updatedAt: new Date() };

    if (typeof body.name === "string") {
      const v = body.name.trim().slice(0, 255);
      updates.name = v || null;
    }
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

    const hasUserUpdates = Object.keys(updates).length > 1;

    const doctorUpdates: {
      specialty?: string | null;
      bio?: string | null;
      qualifications?: string | null;
      institution?: string | null;
      availabilityInfo?: string | null;
    } = {};
    if (typeof body.specialty === "string") {
      doctorUpdates.specialty = body.specialty.trim().slice(0, 100) || null;
    }
    if (typeof body.bio === "string") {
      doctorUpdates.bio = body.bio.trim() || null;
    }
    if (typeof body.qualifications === "string") {
      doctorUpdates.qualifications = body.qualifications.trim() || null;
    }
    if (typeof body.institution === "string") {
      doctorUpdates.institution = body.institution.trim().slice(0, 200) || null;
    }
    if (typeof body.availabilityInfo === "string") {
      doctorUpdates.availabilityInfo = body.availabilityInfo.trim() || null;
    }
    const hasDoctorUpdates = Object.keys(doctorUpdates).length > 0;

    if (!hasUserUpdates && !hasDoctorUpdates) {
      return jsonResponse(
        { error: "No valid fields to update" },
        400,
        origin
      );
    }

    if (hasUserUpdates) {
      await db
        .update(users)
        .set(updates)
        .where(eq(users.id, session.user.id));
    }

    if (hasDoctorUpdates && session.user.role === "doctor") {
      const [existing] = await db
        .select({ userId: doctorProfiles.userId })
        .from(doctorProfiles)
        .where(eq(doctorProfiles.userId, session.user.id))
        .limit(1);

      if (existing) {
        await db
          .update(doctorProfiles)
          .set({
            ...doctorUpdates,
            updatedAt: new Date(),
          })
          .where(eq(doctorProfiles.userId, session.user.id));
      } else {
        await db.insert(doctorProfiles).values({
          userId: session.user.id,
          specialty: doctorUpdates.specialty ?? null,
          bio: doctorUpdates.bio ?? null,
          qualifications: doctorUpdates.qualifications ?? null,
          institution: doctorUpdates.institution ?? null,
          availabilityInfo: doctorUpdates.availabilityInfo ?? null,
        });
      }
    }

    const [updated] = await db
      .select(PROFILE_SELECT)
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    const payload: Record<string, unknown> = { ...(updated ?? {}) };

    if (updated?.role === "doctor") {
      const [doctorProfile] = await db
        .select(DOCTOR_PROFILE_SELECT)
        .from(doctorProfiles)
        .where(eq(doctorProfiles.userId, session.user.id))
        .limit(1);
      payload.doctorProfile = doctorProfile ?? EMPTY_DOCTOR_PROFILE;
    }

    return jsonResponse(payload, 200, origin);
  } catch (err) {
    console.error("Profile PATCH error:", err);
    return jsonResponse(
      { error: "Failed to update profile" },
      500,
      origin
    );
  }
}
