import { getServerSession } from "next-auth";
import { desc, eq, isNull, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/src/db";
import { doctorQuestions, users } from "@/src/schema";
import {
  getUserDisplayLabel,
  notifyDoctorQuestionAssigned,
} from "@/lib/notifications";

const MIN_QUESTION_LENGTH = 10;

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "admin") {
    const questions = await db
      .select()
      .from(doctorQuestions)
      .orderBy(desc(doctorQuestions.createdAt));

    return NextResponse.json({ questions });
  }

  if (session.user.role === "doctor") {
    const questions = await db
      .select()
      .from(doctorQuestions)
      .where(
        or(
          isNull(doctorQuestions.doctorUserId),
          eq(doctorQuestions.doctorUserId, session.user.id)
        )
      )
      .orderBy(desc(doctorQuestions.createdAt));

    return NextResponse.json({ questions });
  }

  const questions = await db
    .select()
    .from(doctorQuestions)
    .where(eq(doctorQuestions.userId, session.user.id))
    .orderBy(desc(doctorQuestions.createdAt));

  return NextResponse.json({ questions });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        questionText?: string;
        isAnonymous?: boolean;
        selectedDoctorUserId?: string;
      }
    | null;

  const questionText = body?.questionText?.trim();
  const isAnonymous = Boolean(body?.isAnonymous);
  const selectedDoctorUserId =
    typeof body?.selectedDoctorUserId === "string" ? body.selectedDoctorUserId.trim() : "";

  if (!questionText || questionText.length < MIN_QUESTION_LENGTH) {
    return NextResponse.json(
      {
        error: `Question must be at least ${MIN_QUESTION_LENGTH} characters long`,
      },
      { status: 400 }
    );
  }

  let assignedDoctorId: string | null = null;
  if (selectedDoctorUserId) {
    const [doctor] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, selectedDoctorUserId))
      .limit(1);

    if (!doctor || doctor.role !== "doctor") {
      return NextResponse.json({ error: "Selected doctor is invalid" }, { status: 400 });
    }

    assignedDoctorId = doctor.id;
  }

  const [createdQuestion] = await db
    .insert(doctorQuestions)
    .values({
      userId: session.user.id,
      doctorUserId: assignedDoctorId,
      questionText,
      isAnonymous,
    })
    .returning();

  if (assignedDoctorId) {
    const actorLabel = await getUserDisplayLabel(session.user.id);
    await notifyDoctorQuestionAssigned({
      doctorUserId: assignedDoctorId,
      actorUserId: session.user.id,
      questionId: createdQuestion.id,
      questionTitle: questionText.split("\n\n")[0]?.trim() || "New question",
      actorLabel,
    });
  }

  return NextResponse.json({ question: createdQuestion }, { status: 201 });
}
