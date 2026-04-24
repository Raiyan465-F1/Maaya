import { getServerSession } from "next-auth";
import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/src/db";
import { alerts, doctorAnswers, doctorQuestions } from "@/src/schema";

const MIN_REPLY_LENGTH = 5;

function parseQuestionId(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const questionId = parseQuestionId(id);

  if (!questionId) {
    return NextResponse.json({ error: "Invalid question id" }, { status: 400 });
  }

  const [question] = await db
    .select()
    .from(doctorQuestions)
    .where(eq(doctorQuestions.id, questionId))
    .limit(1);

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  if (
    question.doctorUserId &&
    session.user.role !== "admin" &&
    question.doctorUserId !== session.user.id
  ) {
    return NextResponse.json(
      { error: "This question was assigned to another doctor" },
      { status: 403 }
    );
  }

  if (session.user.role === "user" && question.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const answers = await db
    .select()
    .from(doctorAnswers)
    .where(eq(doctorAnswers.questionId, questionId))
    .orderBy(desc(doctorAnswers.createdAt));

  return NextResponse.json({ question, answers });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "doctor" && session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Only doctors can reply to questions" },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const questionId = parseQuestionId(id);

  if (!questionId) {
    return NextResponse.json({ error: "Invalid question id" }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        answerText?: string;
      }
    | null;

  const answerText = body?.answerText?.trim();

  if (!answerText || answerText.length < MIN_REPLY_LENGTH) {
    return NextResponse.json(
      {
        error: `Reply must be at least ${MIN_REPLY_LENGTH} characters long`,
      },
      { status: 400 }
    );
  }

  const [question] = await db
    .select()
    .from(doctorQuestions)
    .where(eq(doctorQuestions.id, questionId))
    .limit(1);

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const [existingAnswer] = await db
    .select()
    .from(doctorAnswers)
    .where(eq(doctorAnswers.questionId, questionId))
    .limit(1);

  if (existingAnswer) {
    return NextResponse.json(
      { error: "This question has already been answered" },
      { status: 409 }
    );
  }

  const [answer] = await db
    .insert(doctorAnswers)
    .values({
      questionId,
      doctorUserId: session.user.id,
      answerText,
    })
    .returning();

  const [updatedQuestion] = await db
    .update(doctorQuestions)
    .set({
      status: "answered",
    })
    .where(
      and(
        eq(doctorQuestions.id, questionId),
        eq(doctorQuestions.userId, question.userId)
      )
    )
    .returning();

  await db.insert(alerts).values({
    userId: question.userId,
    type: "doctor_response",
    title: "Doctor replied to your post",
    message: "A doctor has reviewed your post and sent feedback. Open your dashboard to read the reply.",
  });

  return NextResponse.json({ answer, question: updatedQuestion });
}
