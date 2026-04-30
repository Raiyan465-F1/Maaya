import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/src/db";
import {
  doctorAnswers,
  doctorProfiles,
  doctorQuestions,
  doctorRatings,
  users,
} from "@/src/schema";
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

const extractTitle = (questionText: string) => {
  const normalized = questionText.replace(/\r\n/g, "\n");
  const [first] = normalized.split("\n\n");
  return (first ?? normalized).trim();
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
        memberSince: users.createdAt,
        profileUpdatedAt: doctorProfiles.updatedAt,
      })
      .from(doctorProfiles)
      .innerJoin(users, eq(doctorProfiles.userId, users.id))
      .where(eq(doctorProfiles.userId, id))
      .limit(1);

    if (!doctor) {
      return jsonResponse({ error: "Doctor not found" }, 404, origin);
    }

    const answers = await db
      .select({
        id: doctorAnswers.id,
        questionId: doctorAnswers.questionId,
        createdAt: doctorAnswers.createdAt,
        questionText: doctorQuestions.questionText,
        questionStatus: doctorQuestions.status,
        questionCreatedAt: doctorQuestions.createdAt,
        questionIsAnonymous: doctorQuestions.isAnonymous,
      })
      .from(doctorAnswers)
      .innerJoin(
        doctorQuestions,
        eq(doctorAnswers.questionId, doctorQuestions.id)
      )
      .where(eq(doctorAnswers.doctorUserId, doctor.userId))
      .orderBy(desc(doctorAnswers.createdAt));

    const ratings = await db
      .select({
        rating: doctorRatings.rating,
        comment: doctorRatings.comment,
        createdAt: doctorRatings.createdAt,
      })
      .from(doctorRatings)
      .where(eq(doctorRatings.doctorUserId, doctor.userId))
      .orderBy(desc(doctorRatings.createdAt));

    const replyCount = answers.length;
    const uniqueQuestionIds = new Set(answers.map((a) => a.questionId));
    const questionsAnsweredCount = uniqueQuestionIds.size;

    const ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    ratings.forEach((entry) => {
      const key = Math.min(5, Math.max(1, entry.rating)) as 1 | 2 | 3 | 4 | 5;
      ratingBreakdown[key] += 1;
    });

    const avgRating = ratings.length
      ? Number(
          (
            ratings.reduce((total, entry) => total + entry.rating, 0) /
            ratings.length
          ).toFixed(1)
        )
      : 0;

    const seenQuestions = new Set<number>();
    const answeredQuestions = answers
      .filter((answer) => {
        if (seenQuestions.has(answer.questionId)) {
          return false;
        }
        seenQuestions.add(answer.questionId);
        return true;
      })
      .map((answer) => ({
        questionId: answer.questionId,
        title: extractTitle(answer.questionText),
        status: answer.questionStatus,
        isAnonymous: answer.questionIsAnonymous ?? false,
        answeredAt: answer.createdAt,
      }));

    const reviews = ratings
      .filter((entry) => entry.comment && entry.comment.trim().length > 0)
      .map((entry) => ({
        rating: entry.rating,
        comment: entry.comment,
        createdAt: entry.createdAt,
      }));

    return jsonResponse(
      {
        userId: doctor.userId,
        displayName: buildDisplayName(doctor.name, doctor.email),
        email: doctor.email,
        specialty: doctor.specialty,
        location: doctor.location,
        availabilityInfo: doctor.availabilityInfo,
        bio: doctor.bio,
        qualifications: doctor.qualifications,
        institution: doctor.institution,
        memberSince: doctor.memberSince,
        profileUpdatedAt: doctor.profileUpdatedAt,
        replyCount,
        questionsAnsweredCount,
        avgRating,
        ratingCount: ratings.length,
        ratingBreakdown,
        answeredQuestions,
        reviews,
      },
      200,
      origin
    );
  } catch (error) {
    console.error("Error fetching doctor details:", error);
    return jsonResponse({ error: "Failed to fetch doctor details" }, 500, null);
  }
}
