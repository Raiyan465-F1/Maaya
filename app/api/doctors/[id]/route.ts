import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { doctorAnswers, doctorProfiles, doctorRatings, users } from "@/src/schema";
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

const buildDisplayName = (name: string | null, email: string) => {
  if (name?.trim()) {
    return name.trim();
  }

  const emailPrefix = email.split("@")[0] ?? "doctor";
  const formatted = emailPrefix
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return formatted || "Doctor";
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const origin = request.headers.get("origin");
    const { id } = await params;

    const [doctor] = await db
      .select({
        userId: doctorProfiles.userId,
        name: users.name,
        email: users.email,
        specialty: doctorProfiles.specialty,
        availabilityInfo: doctorProfiles.availabilityInfo,
        location: users.location,
        bio: doctorProfiles.bio,
        qualifications: doctorProfiles.qualifications,
        institution: doctorProfiles.institution,
      })
      .from(doctorProfiles)
      .innerJoin(users, eq(doctorProfiles.userId, users.id))
      .where(eq(doctorProfiles.userId, id))
      .limit(1);

    if (!doctor) {
      return jsonResponse({ error: "Doctor not found" }, 404, origin);
    }

    const answers = await db
      .select({ id: doctorAnswers.id })
      .from(doctorAnswers)
      .where(eq(doctorAnswers.doctorUserId, doctor.userId));

    const ratings = await db
      .select({ rating: doctorRatings.rating })
      .from(doctorRatings)
      .where(eq(doctorRatings.doctorUserId, doctor.userId));

    const avgRating = ratings.length
      ? Number(
          (ratings.reduce((total, entry) => total + entry.rating, 0) / ratings.length).toFixed(1)
        )
      : 0;

    return jsonResponse(
      {
        ...doctor,
        displayName: buildDisplayName(doctor.name, doctor.email),
        replyCount: answers.length,
        avgRating,
      },
      200,
      origin
    );
  } catch (error) {
    console.error("Error fetching doctor details:", error);
    return jsonResponse({ error: "Failed to fetch doctor details" }, 500, null);
  }
}
