import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { doctorAnswers, doctorProfiles, doctorRatings, users } from "@/src/schema";

function jsonResponse(data: object, status: number, origin: string | null) {
  const res = NextResponse.json(data, { status });
  res.headers.set("Access-Control-Allow-Origin", origin ?? "*");
  res.headers.set("Access-Control-Allow-Methods", "GET");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");

  try {
    // Load doctors and their profile info
    const doctors = await db
      .select({
        userId: doctorProfiles.userId,
        specialty: doctorProfiles.specialty,
        availabilityInfo: doctorProfiles.availabilityInfo,
        email: users.email,
      })
      .from(doctorProfiles)
      .innerJoin(users, doctorProfiles.userId.equals(users.id));

    // Load recent answer activity (last 24h)
    const since = new Date();
    since.setHours(since.getHours() - 24);

    const answers = await db
      .select({
        doctorUserId: doctorAnswers.doctorUserId,
        createdAt: doctorAnswers.createdAt,
      })
      .from(doctorAnswers)
      .where(doctorAnswers.createdAt.gte(since));

    const activityByDoctor = new Map<string, number>();
    answers.forEach((answer) => {
      const id = answer.doctorUserId;
      if (!id) return;
      activityByDoctor.set(id, (activityByDoctor.get(id) ?? 0) + 1);
    });

    // Load average rating per doctor
    const ratings = await db
      .select({
        doctorUserId: doctorRatings.doctorUserId,
        rating: doctorRatings.rating,
      })
      .from(doctorRatings);

    const ratingByDoctor = new Map<string, { total: number; count: number }>();
    ratings.forEach((row) => {
      const id = row.doctorUserId;
      if (!id) return;
      const existing = ratingByDoctor.get(id) ?? { total: 0, count: 0 };
      ratingByDoctor.set(id, {
        total: existing.total + row.rating,
        count: existing.count + 1,
      });
    });

    const ranked = doctors
      .map((doc) => {
        const activity = activityByDoctor.get(doc.userId) ?? 0;
        const ratingMeta = ratingByDoctor.get(doc.userId);
        const avgRating = ratingMeta ? ratingMeta.total / ratingMeta.count : 0;

        const score = avgRating * 3 + activity * 0.8; // mix of rating + activity

        return {
          userId: doc.userId,
          email: doc.email,
          specialty: doc.specialty,
          availabilityInfo: doc.availabilityInfo,
          activityCount: activity,
          avgRating: Number(avgRating.toFixed(2)),
          score,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return jsonResponse(ranked, 200, origin);
  } catch (error) {
    console.error("Error fetching top doctors:", error);
    return jsonResponse({ error: "Failed to fetch top doctors" }, 500, origin);
  }
}
