import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { desc, eq, inArray, isNull, or } from "drizzle-orm";
import { db } from "@/src/db";
import { doctorAnswers, doctorProfiles, doctorQuestions, users } from "@/src/schema";
import { authOptions } from "@/lib/auth";
import {
  getUserDisplayLabel,
  notifyDoctorQuestionAssigned,
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

async function loadDoctorsByIds(doctorIds: string[]) {
  if (doctorIds.length === 0) {
    return new Map<string, { displayName: string; specialty: string | null }>();
  }

  const doctorRows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      specialty: doctorProfiles.specialty,
    })
    .from(users)
    .leftJoin(doctorProfiles, eq(users.id, doctorProfiles.userId))
    .where(inArray(users.id, doctorIds));

  return new Map(
    doctorRows.map((doctor) => [
      doctor.id,
      {
        displayName: buildDisplayName(doctor.name, doctor.email),
        specialty: doctor.specialty,
      },
    ])
  );
}

export async function GET(request: NextRequest) {
  try {
    const origin = request.headers.get("origin");
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return jsonResponse({ error: "Unauthorized" }, 401, origin);
    }

    const [currentUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    const baseQuery = db
      .select({
        id: doctorQuestions.id,
        questionText: doctorQuestions.questionText,
        isAnonymous: doctorQuestions.isAnonymous,
        status: doctorQuestions.status,
        createdAt: doctorQuestions.createdAt,
        userId: doctorQuestions.userId,
        doctorUserId: doctorQuestions.doctorUserId,
        userEmail: users.email,
        userAgeGroup: users.ageGroup,
        userGender: users.gender,
      })
      .from(doctorQuestions)
      .leftJoin(users, eq(doctorQuestions.userId, users.id));

    const questions =
      currentUser?.role === "admin"
        ? await baseQuery.orderBy(desc(doctorQuestions.createdAt))
        : currentUser?.role === "doctor"
          ? await baseQuery
              .where(
                or(
                  isNull(doctorQuestions.doctorUserId),
                  eq(doctorQuestions.doctorUserId, session.user.id)
                )
              )
              .orderBy(desc(doctorQuestions.createdAt))
          : await baseQuery
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
        doctorUserId: doctorAnswers.doctorUserId,
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
      doctorUserId: string;
      doctorDisplayName: string;
      doctorSpecialty: string | null;
    }>>();

    answers.forEach((answer) => {
      const list = answersByQuestion.get(answer.questionId) ?? [];
      list.push({
        id: answer.id,
        answerText: answer.answerText,
        createdAt: answer.createdAt,
        doctorUserId: answer.doctorUserId,
        doctorDisplayName: buildDisplayName(answer.doctorName, answer.doctorEmail),
        doctorSpecialty: answer.doctorSpecialty,
      });
      answersByQuestion.set(answer.questionId, list);
    });

    const assignedDoctorIds = Array.from(
      new Set(
        questions
          .map((question) => question.doctorUserId)
          .filter((doctorId): doctorId is string => Boolean(doctorId))
      )
    );
    const assignedDoctorMap = await loadDoctorsByIds(assignedDoctorIds);

    const payload = questions.map((question) => ({
      ...question,
      isSpecified: Boolean(question.doctorUserId),
      specifiedDoctorName: question.doctorUserId
        ? (assignedDoctorMap.get(question.doctorUserId)?.displayName ?? null)
        : null,
      specifiedDoctorSpecialty: question.doctorUserId
        ? (assignedDoctorMap.get(question.doctorUserId)?.specialty ?? null)
        : null,
      answers: answersByQuestion.get(question.id) ?? [],
    }));

    return jsonResponse(payload, 200, origin);
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

    const suspendedBlock = suspendedMutationBlockedResponse(session, origin);
    if (suspendedBlock) return suspendedBlock;

    const body = await request.json();
    const {
      questionTitle,
      questionText,
      isAnonymous = false,
      selectedDoctorUserId,
    }: {
      questionTitle?: string;
      questionText?: string;
      isAnonymous?: boolean;
      selectedDoctorUserId?: string;
    } = body;

    const [currentUserRow] = await db
      .select({ isAnonymous: users.isAnonymous })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);
    const globallyAnonymous = Boolean(currentUserRow?.isAnonymous);
    const effectiveAnonymous = globallyAnonymous || Boolean(isAnonymous);

    const trimmedTitle = questionTitle?.trim() ?? "";
    const trimmedText = questionText?.trim() ?? "";

    if (!trimmedTitle) {
      return jsonResponse({ error: "Question title is required" }, 400, origin);
    }

    if (trimmedTitle.length > 70) {
      return jsonResponse(
        { error: "Question title must be 70 characters or fewer" },
        400,
        origin
      );
    }

    if (!trimmedText) {
      return jsonResponse({ error: "Question details are required" }, 400, origin);
    }

    const normalizedSelectedDoctorId =
      typeof selectedDoctorUserId === "string" ? selectedDoctorUserId.trim() : "";
    let selectedDoctor:
      | {
          id: string;
          email: string;
          name: string | null;
          specialty: string | null;
        }
      | null = null;

    if (normalizedSelectedDoctorId) {
      const [doctor] = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          specialty: doctorProfiles.specialty,
        })
        .from(users)
        .leftJoin(doctorProfiles, eq(users.id, doctorProfiles.userId))
        .where(eq(users.id, normalizedSelectedDoctorId))
        .limit(1);

      if (!doctor || doctor.role !== "doctor") {
        return jsonResponse({ error: "Selected doctor is invalid" }, 400, origin);
      }

      selectedDoctor = {
        id: doctor.id,
        email: doctor.email,
        name: doctor.name,
        specialty: doctor.specialty,
      };
    }

    const storedQuestionText = `${trimmedTitle}\n\n${trimmedText}`;

    const newQuestion = await db
      .insert(doctorQuestions)
      .values({
        userId: session.user.id,
        doctorUserId: selectedDoctor?.id ?? null,
        questionText: storedQuestionText,
        isAnonymous: effectiveAnonymous,
      })
      .returning();

    if (selectedDoctor) {
      const actorLabel = await getUserDisplayLabel(session.user.id);
      await notifyDoctorQuestionAssigned({
        doctorUserId: selectedDoctor.id,
        actorUserId: session.user.id,
        questionId: newQuestion[0].id,
        questionTitle: trimmedTitle,
        actorLabel,
      });
    }

    return jsonResponse(
      {
        ...newQuestion[0],
        isSpecified: Boolean(selectedDoctor),
        specifiedDoctorName: selectedDoctor
          ? buildDisplayName(selectedDoctor.name, selectedDoctor.email)
          : null,
        specifiedDoctorSpecialty: selectedDoctor?.specialty ?? null,
      },
      201,
      origin
    );
  } catch (error) {
    console.error("Error creating question:", error);
    return jsonResponse({ error: "Failed to create question" }, 500, null);
  }
}
