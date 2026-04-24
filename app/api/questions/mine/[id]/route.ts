import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { withCorsHeaders } from "@/lib/cors";
import { db } from "@/src/db";
import { doctorAnswers, doctorProfiles, doctorQuestions, users } from "@/src/schema";

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
  const origin = request.headers.get("origin");
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return jsonResponse({ error: "Unauthorized" }, 401, origin);
  }

  try {
    const { id } = await params;
    const questionId = Number.parseInt(id, 10);

    if (Number.isNaN(questionId)) {
      return jsonResponse({ error: "Invalid question ID" }, 400, origin);
    }

    const [question] = await db
      .select({
        id: doctorQuestions.id,
        questionText: doctorQuestions.questionText,
        isAnonymous: doctorQuestions.isAnonymous,
        status: doctorQuestions.status,
        createdAt: doctorQuestions.createdAt,
        doctorUserId: doctorQuestions.doctorUserId,
        userEmail: users.email,
      })
      .from(doctorQuestions)
      .innerJoin(users, eq(doctorQuestions.userId, users.id))
      .where(
        and(
          eq(doctorQuestions.id, questionId),
          eq(doctorQuestions.userId, session.user.id)
        )
      )
      .limit(1);

    if (!question) {
      return jsonResponse({ error: "Question not found" }, 404, origin);
    }

    const answers = await db
      .select({
        id: doctorAnswers.id,
        answerText: doctorAnswers.answerText,
        createdAt: doctorAnswers.createdAt,
        doctorUserId: doctorAnswers.doctorUserId,
        doctorEmail: users.email,
        doctorName: users.name,
        doctorSpecialty: doctorProfiles.specialty,
      })
      .from(doctorAnswers)
      .innerJoin(users, eq(doctorAnswers.doctorUserId, users.id))
      .leftJoin(doctorProfiles, eq(doctorAnswers.doctorUserId, doctorProfiles.userId))
      .where(eq(doctorAnswers.questionId, questionId))
      .orderBy(doctorAnswers.createdAt);

    const [assignedDoctor] = question.doctorUserId
      ? await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            specialty: doctorProfiles.specialty,
          })
          .from(users)
          .leftJoin(doctorProfiles, eq(users.id, doctorProfiles.userId))
          .where(eq(users.id, question.doctorUserId))
          .limit(1)
      : [];

    return jsonResponse(
      {
        ...question,
        isSpecified: Boolean(question.doctorUserId),
        specifiedDoctorName:
          assignedDoctor && question.doctorUserId
            ? buildDisplayName(assignedDoctor.name, assignedDoctor.email)
            : null,
        specifiedDoctorSpecialty: assignedDoctor?.specialty ?? null,
        answers: answers.map((answer) => ({
          id: answer.id,
          answerText: answer.answerText,
          createdAt: answer.createdAt,
          doctorUserId: answer.doctorUserId,
          doctorDisplayName: buildDisplayName(answer.doctorName, answer.doctorEmail),
          doctorSpecialty: answer.doctorSpecialty,
        })),
      },
      200,
      origin
    );
  } catch (error) {
    console.error("Error fetching question details:", error);
    return jsonResponse({ error: "Failed to fetch question details" }, 500, origin);
  }
}
