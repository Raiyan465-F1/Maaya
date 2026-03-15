import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { doctorQuestions, doctorAnswers, users } from "@/src/schema";
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

export async function GET(request: NextRequest) {
  try {
    const origin = request.headers.get("origin");

    const questions = await db
      .select({
        id: doctorQuestions.id,
        questionText: doctorQuestions.questionText,
        isAnonymous: doctorQuestions.isAnonymous,
        createdAt: doctorQuestions.createdAt,
        userId: doctorQuestions.userId,
        doctorUserId: doctorQuestions.doctorUserId,
        // Include user info if not anonymous
        userEmail: users.email,
        userAgeGroup: users.ageGroup,
        userGender: users.gender,
      })
      .from(doctorQuestions)
      .leftJoin(users, eq(doctorQuestions.userId, users.id))
      .orderBy(doctorQuestions.createdAt);

    return jsonResponse(questions, 200, origin);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return jsonResponse({ error: "Failed to fetch questions" }, 500, null);
  }
}

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin");
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return jsonResponse({ error: "Unauthorized" }, 401, origin);
    }

    const body = await request.json();
    const { questionText, isAnonymous = false } = body;

    if (!questionText?.trim()) {
      return jsonResponse({ error: "Question text is required" }, 400, origin);
    }

    const newQuestion = await db
      .insert(doctorQuestions)
      .values({
        userId: session.user.id,
        questionText: questionText.trim(),
        isAnonymous,
      })
      .returning();

    return jsonResponse(newQuestion[0], 201, origin);
  } catch (error) {
    console.error("Error creating question:", error);
    return jsonResponse({ error: "Failed to create question" }, 500, null);
  }
}