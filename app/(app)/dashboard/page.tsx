import { getServerSession } from "next-auth";
import { desc, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import {
  DashboardShell,
  type DashboardAlert,
  type DashboardQuestion,
} from "@/components/dashboard-shell";
import { authOptions } from "@/lib/auth";
import { db } from "@/src/db";
import { alerts, doctorAnswers, doctorQuestions, users } from "@/src/schema";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const isDoctorView =
    session.user.role === "doctor" || session.user.role === "admin";

  const personalQuestionsRaw = await db
    .select()
    .from(doctorQuestions)
    .where(eq(doctorQuestions.userId, session.user.id))
    .orderBy(desc(doctorQuestions.createdAt));

  const reviewQuestionsRaw = isDoctorView
    ? await db
        .select()
        .from(doctorQuestions)
        .orderBy(desc(doctorQuestions.createdAt))
    : personalQuestionsRaw;

  const allRelevantQuestions = isDoctorView
    ? reviewQuestionsRaw
    : personalQuestionsRaw;

  const questionIds = allRelevantQuestions.map((question) => question.id);
  const answers =
    questionIds.length > 0
      ? await db
          .select()
          .from(doctorAnswers)
          .where(inArray(doctorAnswers.questionId, questionIds))
          .orderBy(desc(doctorAnswers.createdAt))
      : [];

  const latestAnswerByQuestion = new Map<number, (typeof answers)[number]>();
  for (const answer of answers) {
    if (!latestAnswerByQuestion.has(answer.questionId)) {
      latestAnswerByQuestion.set(answer.questionId, answer);
    }
  }

  const userIds = Array.from(
    new Set([
      ...allRelevantQuestions.map((question) => question.userId),
      ...answers.map((answer) => answer.doctorUserId),
    ])
  );

  const relatedUsers =
    userIds.length > 0
      ? await db
          .select({
            id: users.id,
            email: users.email,
          })
          .from(users)
          .where(inArray(users.id, userIds))
      : [];

  const feedbackAlertsRaw = await db
    .select()
    .from(alerts)
    .where(eq(alerts.userId, session.user.id))
    .orderBy(desc(alerts.createdAt));

  const emailByUserId = new Map(relatedUsers.map((user) => [user.id, user.email]));

  const toDashboardQuestions = (
    items: typeof allRelevantQuestions
  ): DashboardQuestion[] =>
    items.map((question) => {
      const answer = latestAnswerByQuestion.get(question.id);
      const askedBy =
        question.isAnonymous && session.user.role !== "user"
          ? "Anonymous user"
          : emailByUserId.get(question.userId) ?? "User";

      return {
        id: question.id,
        questionText: question.questionText,
        isAnonymous: question.isAnonymous ?? false,
        createdAt: question.createdAt.toISOString(),
        askedBy,
        replied: Boolean(answer),
        answerText: answer?.answerText ?? null,
        answeredAt: answer?.createdAt ? answer.createdAt.toISOString() : null,
        answeredBy: answer?.doctorUserId
          ? emailByUserId.get(answer.doctorUserId) ?? "Doctor"
          : null,
      };
    });

  const feedbackAlerts: DashboardAlert[] = feedbackAlertsRaw.map((alert) => ({
    id: alert.id,
    title: alert.title,
    message: alert.message,
    isRead: alert.isRead ?? false,
    createdAt: alert.createdAt.toISOString(),
    type: alert.type,
  }));

  return (
    <DashboardShell
      role={session.user.role}
      userEmail={session.user.email}
      personalQuestions={toDashboardQuestions(personalQuestionsRaw)}
      reviewQuestions={toDashboardQuestions(reviewQuestionsRaw)}
      feedbackAlerts={feedbackAlerts}
    />
  );
}
