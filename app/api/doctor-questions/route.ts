import { getServerSession } from "next-auth";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/src/db";
import { doctorQuestions } from "@/src/schema";

const MIN_QUESTION_LENGTH = 10;

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "doctor" || session.user.role === "admin") {
    const questions = await db
      .select()
      .from(doctorQuestions)
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
      }
    | null;

  const questionText = body?.questionText?.trim();
  const isAnonymous = Boolean(body?.isAnonymous);

  if (!questionText || questionText.length < MIN_QUESTION_LENGTH) {
    return NextResponse.json(
      {
        error: `Question must be at least ${MIN_QUESTION_LENGTH} characters long`,
      },
      { status: 400 }
    );
  }

  const [createdQuestion] = await db
    .insert(doctorQuestions)
    .values({
      userId: session.user.id,
      questionText,
      isAnonymous,
    })
    .returning();

  return NextResponse.json({ question: createdQuestion }, { status: 201 });
}
