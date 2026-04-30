import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { desc, eq, inArray } from "drizzle-orm";
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

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return jsonResponse({ error: "Unauthorized" }, 401, origin);
  }

  try {
    const questions = await db
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
      .where(eq(doctorQuestions.userId, session.user.id))
      .orderBy(desc(doctorQuestions.createdAt));

    if (questions.length === 0) {
      return jsonResponse([], 200, origin);
    }

    const questionIds = questions.map((question) => question.id);
    const answers = await db
      .select({
        id: doctorAnswers.id,
        questionId: doctorAnswers.questionId,
        answerText: doctorAnswers.answerText,
        createdAt: doctorAnswers.createdAt,
        doctorEmail: users.email,
        doctorName: users.name,
        doctorSpecialty: doctorProfiles.specialty,
      })
      .from(doctorAnswers)
      .innerJoin(users, eq(doctorAnswers.doctorUserId, users.id))
      .leftJoin(doctorProfiles, eq(doctorAnswers.doctorUserId, doctorProfiles.userId))
      .where(inArray(doctorAnswers.questionId, questionIds))
      .orderBy(doctorAnswers.createdAt);

    const answersByQuestion = new Map<number, Array<{
      id: number;
      answerText: string;
      createdAt: Date;
      doctorDisplayName: string;
      doctorSpecialty: string | null;
    }>>();

    answers.forEach((answer) => {
      const questionAnswers = answersByQuestion.get(answer.questionId) ?? [];
      questionAnswers.push({
        id: answer.id,
        answerText: answer.answerText,
        createdAt: answer.createdAt,
        doctorDisplayName: buildDisplayName(answer.doctorName, answer.doctorEmail),
        doctorSpecialty: answer.doctorSpecialty,
      });
      answersByQuestion.set(answer.questionId, questionAnswers);
    });

    const assignedDoctorIds = Array.from(
      new Set(
        questions
          .map((question) => question.doctorUserId)
          .filter((doctorId): doctorId is string => Boolean(doctorId))
      )
    );
    const assignedDoctors = assignedDoctorIds.length
      ? await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            specialty: doctorProfiles.specialty,
          })
          .from(users)
          .leftJoin(doctorProfiles, eq(users.id, doctorProfiles.userId))
          .where(inArray(users.id, assignedDoctorIds))
      : [];
    const assignedDoctorById = new Map(
      assignedDoctors.map((doctor) => [
        doctor.id,
        {
          displayName: buildDisplayName(doctor.name, doctor.email),
          specialty: doctor.specialty,
        },
      ])
    );

    const payload = questions.map((question) => ({
      ...question,
      isSpecified: Boolean(question.doctorUserId),
      specifiedDoctorName: question.doctorUserId
        ? (assignedDoctorById.get(question.doctorUserId)?.displayName ?? null)
        : null,
      specifiedDoctorSpecialty: question.doctorUserId
        ? (assignedDoctorById.get(question.doctorUserId)?.specialty ?? null)
        : null,
      answers: answersByQuestion.get(question.id) ?? [],
    }));

    return jsonResponse(payload, 200, origin);
  } catch (error) {
    console.error("Error fetching current user's questions:", error);
    return jsonResponse({ error: "Failed to fetch your questions" }, 500, origin);
  }
}
