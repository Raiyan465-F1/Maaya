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

export async function GET(request: NextRequest) {
  try {
    const origin = request.headers.get("origin");

    const doctors = await db
      .select({
        id: doctorProfiles.id,
        name: users.name,
        email: users.email,
        specialty: doctorProfiles.specialty,
        availabilityInfo: doctorProfiles.availabilityInfo,
        userId: doctorProfiles.userId,
        location: users.location,
      })
      .from(doctorProfiles)
      .innerJoin(users, eq(doctorProfiles.userId, users.id))
      .where(eq(users.role, "doctor"));

    const answers = await db
      .select({
        doctorUserId: doctorAnswers.doctorUserId,
      })
      .from(doctorAnswers);

    const ratings = await db
      .select({
        doctorUserId: doctorRatings.doctorUserId,
        rating: doctorRatings.rating,
      })
      .from(doctorRatings);

    const repliesByDoctor = new Map<string, number>();
    answers.forEach((answer) => {
      repliesByDoctor.set(
        answer.doctorUserId,
        (repliesByDoctor.get(answer.doctorUserId) ?? 0) + 1
      );
    });

    const ratingByDoctor = new Map<string, { total: number; count: number }>();
    ratings.forEach((entry) => {
      const current = ratingByDoctor.get(entry.doctorUserId) ?? { total: 0, count: 0 };
      ratingByDoctor.set(entry.doctorUserId, {
        total: current.total + entry.rating,
        count: current.count + 1,
      });
    });

    const doctorsWithStats = doctors.map((doctor) => {
      const emailPrefix = doctor.email.split("@")[0] ?? "doctor";
      const fallbackDisplayName = emailPrefix
        .split(/[._-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
      const displayName = doctor.name?.trim() || fallbackDisplayName || "Doctor";
      const ratingMeta = ratingByDoctor.get(doctor.userId);

      return {
        ...doctor,
        displayName,
        replyCount: repliesByDoctor.get(doctor.userId) ?? 0,
        avgRating: ratingMeta ? Number((ratingMeta.total / ratingMeta.count).toFixed(1)) : 0,
      };
    });

    return jsonResponse(doctorsWithStats, 200, origin);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return jsonResponse({ error: "Failed to fetch doctors" }, 500, null);
  }
}
