import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { eq, and, ne } from "drizzle-orm";
import { db } from "@/src/db";
import { doctorAnswers, doctorQuestions, users, doctorProfiles } from "@/src/schema";
import { authOptions } from "@/lib/auth";
import {
  getUserDisplayLabel,
  notifyDoctorResponse,
} from "@/lib/notifications";
import { withCorsHeaders } from "@/lib/cors";
import { suspendedMutationBlockedResponse } from "@/lib/suspended-mutation";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const origin = request.headers.get("origin");
    const questionId = parseInt(id);

    if (isNaN(questionId)) {
      return jsonResponse({ error: "Invalid question ID" }, 400, origin);
    }

    const answers = await db
      .select({
        id: doctorAnswers.id,
        answerText: doctorAnswers.answerText,
        createdAt: doctorAnswers.createdAt,
        doctorUserId: doctorAnswers.doctorUserId,
        // Include doctor info
        doctorEmail: users.email,
        doctorSpecialty: doctorProfiles.specialty,
      })
      .from(doctorAnswers)
      .innerJoin(users, eq(doctorAnswers.doctorUserId, users.id))
      .innerJoin(doctorProfiles, eq(users.id, doctorProfiles.userId))
      .where(eq(doctorAnswers.questionId, questionId))
      .orderBy(doctorAnswers.createdAt);

    return jsonResponse(answers, 200, origin);
  } catch (error) {
    console.error("Error fetching answers:", error);
    return jsonResponse({ error: "Failed to fetch answers" }, 500, null);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const origin = request.headers.get("origin");
    const session = await getServerSession(authOptions);
    const questionId = parseInt(id);

    if (!session?.user?.id) {
      return jsonResponse({ error: "Unauthorized" }, 401, origin);
    }

    const suspendedBlock = suspendedMutationBlockedResponse(session, origin);
    if (suspendedBlock) return suspendedBlock;

    if (isNaN(questionId)) {
      return jsonResponse({ error: "Invalid question ID" }, 400, origin);
    }

    // Check if user is a doctor
    const user = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user[0] || user[0].role !== "doctor") {
      return jsonResponse({ error: "Only doctors can answer questions" }, 403, origin);
    }

    const body = await request.json();
    const { answerText } = body;

    if (!answerText?.trim()) {
      return jsonResponse({ error: "Answer text is required" }, 400, origin);
    }

    const [existingQuestion] = await db
      .select({
        id: doctorQuestions.id,
        status: doctorQuestions.status,
        doctorUserId: doctorQuestions.doctorUserId,
        userId: doctorQuestions.userId,
        questionText: doctorQuestions.questionText,
      })
      .from(doctorQuestions)
      .where(eq(doctorQuestions.id, questionId))
      .limit(1);

    if (!existingQuestion) {
      return jsonResponse({ error: "Question not found" }, 404, origin);
    }

    if (existingQuestion.status === "closed") {
      return jsonResponse(
        { error: "This question has been closed and no longer accepts answers" },
        403,
        origin
      );
    }

    if (
      existingQuestion.doctorUserId &&
      existingQuestion.doctorUserId !== session.user.id
    ) {
      return jsonResponse(
        { error: "This question was assigned to another doctor" },
        403,
        origin
      );
    }

    const newAnswer = await db
      .insert(doctorAnswers)
      .values({
        questionId,
        doctorUserId: session.user.id,
        answerText: answerText.trim(),
      })
      .returning();

    await db
      .update(doctorQuestions)
      .set({ status: "answered" })
      .where(
        and(
          eq(doctorQuestions.id, questionId),
          ne(doctorQuestions.status, "closed")
        )
      );

    const actorLabel = await getUserDisplayLabel(session.user.id);
    const questionTitle =
      existingQuestion.questionText.split("\n\n")[0]?.trim() || "your question";
    await notifyDoctorResponse({
      recipientUserId: existingQuestion.userId,
      actorUserId: session.user.id,
      questionId,
      questionTitle,
      actorLabel,
    });

    return jsonResponse(newAnswer[0], 201, origin);
  } catch (error) {
    console.error("Error creating answer:", error);
    return jsonResponse({ error: "Failed to create answer" }, 500, null);
  }
}
