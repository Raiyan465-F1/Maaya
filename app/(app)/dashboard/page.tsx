import { getServerSession } from "next-auth";
import { desc, eq, inArray, isNull, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import {
  DashboardShell,
  type DashboardAlert,
  type DashboardQuestion,
} from "@/components/dashboard-shell";
import { authOptions } from "@/lib/auth";
import { listUserNotifications } from "@/lib/notifications";
import { db } from "@/src/db";
import { alerts, doctorAnswers, doctorQuestions, users, symptomLogs, cycleLogs, userCycleOnboarding } from "@/src/schema";

function buildDisplayName(name: string | null, email: string) {
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
}

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
    ? session.user.role === "admin"
      ? await db
          .select()
          .from(doctorQuestions)
          .orderBy(desc(doctorQuestions.createdAt))
      : await db
          .select()
          .from(doctorQuestions)
          .where(
            or(
              isNull(doctorQuestions.doctorUserId),
              eq(doctorQuestions.doctorUserId, session.user.id)
            )
          )
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
      ...allRelevantQuestions
        .map((question) => question.doctorUserId)
        .filter((doctorUserId): doctorUserId is string => Boolean(doctorUserId)),
      ...answers.map((answer) => answer.doctorUserId),
    ])
  );

  const relatedUsers =
    userIds.length > 0
      ? await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
          })
          .from(users)
          .where(inArray(users.id, userIds))
      : [];

  const feedbackAlertsRaw = await listUserNotifications({
    userId: session.user.id,
    limit: 20,
    types: ["doctor_response"],
  });

  const displayNameByUserId = new Map(
    relatedUsers.map((user) => [user.id, buildDisplayName(user.name, user.email)])
  );
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
          ? displayNameByUserId.get(answer.doctorUserId) ?? "Doctor"
          : null,
        isSpecified: Boolean(question.doctorUserId),
        specifiedDoctorName: question.doctorUserId
          ? displayNameByUserId.get(question.doctorUserId) ?? null
          : null,
      };
    });

  const feedbackAlerts: DashboardAlert[] = feedbackAlertsRaw.notifications.map((alert) => ({
    id: alert.id,
    title: alert.title,
    message: alert.message,
    linkHref: alert.linkHref,
    isRead: alert.isRead,
    createdAt: alert.createdAt,
    type: alert.type,
  }));

  const latestLogRaw = await db
    .select()
    .from(symptomLogs)
    .where(eq(symptomLogs.userId, session.user.id))
    .orderBy(desc(symptomLogs.createdAt))
    .limit(1);

  const latestLog = latestLogRaw[0] || null;
  const loggedMood = (latestLog?.symptoms as any)?.mood || latestLog?.mood || null;
  
  const cycleLogsRaw = await db
    .select()
    .from(cycleLogs)
    .where(eq(cycleLogs.userId, session.user.id))
    .orderBy(desc(cycleLogs.startDate))
    .limit(1);
    
  let currentPhase = "Menstrual";
  let dayOfCycle = 1;
  let daysUntilNextPeriod = 28;
  
  const onboardingData = await db
    .select()
    .from(userCycleOnboarding)
    .where(eq(userCycleOnboarding.userId, session.user.id))
    .limit(1);
    
  const avgCycleLength = onboardingData.length > 0 && onboardingData[0].averageCycleLength ? onboardingData[0].averageCycleLength : 28;

  let predictedSymptomsText = "No major symptoms predicted.";
  if (cycleLogsRaw.length > 0) {
      const latestCycle = cycleLogsRaw[0];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(latestCycle.startDate);
      start.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - start.getTime();
      dayOfCycle = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (dayOfCycle > 5 && dayOfCycle <= 13) currentPhase = "Follicular";
      else if (dayOfCycle === 14) currentPhase = "Ovulation";
      else if (dayOfCycle > 14) currentPhase = "Luteal";

      const nextPeriodStart = new Date(start.getTime() + avgCycleLength * 24 * 60 * 60 * 1000);
      daysUntilNextPeriod = Math.max(0, Math.ceil((nextPeriodStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

      const SYMPTOMS_PREDICTIONS: Record<string, string> = {
        "Menstrual": "Fatigue, cramps, lower back pain, potential headaches.",
        "Follicular": "Everything is fine! Energy is rising, skin might be clearer.",
        "Ovulation": "High energy, possible mild pelvic twinges (mittelschmerz).",
        "Luteal": "Cravings, bloating, mood swings, potential insomnia or fatigue."
      };
      predictedSymptomsText = SYMPTOMS_PREDICTIONS[currentPhase] || "No major symptoms predicted.";
  }

  return (
    <DashboardShell
      role={session.user.role}
      userEmail={session.user.email}
      personalQuestions={toDashboardQuestions(personalQuestionsRaw)}
      reviewQuestions={toDashboardQuestions(reviewQuestionsRaw)}
      feedbackAlerts={feedbackAlerts}
      todayMood={loggedMood}
      todaySymptoms={predictedSymptomsText}
      currentPhase={currentPhase}
      dayOfCycle={dayOfCycle}
      daysUntilNextPeriod={daysUntilNextPeriod}
    />
  );
}
