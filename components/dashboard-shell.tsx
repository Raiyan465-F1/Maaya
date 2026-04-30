"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export type DashboardQuestion = {
  id: number;
  questionText: string;
  isAnonymous: boolean;
  createdAt: string;
  askedBy: string;
  replied: boolean;
  answerText: string | null;
  answeredAt: string | null;
  answeredBy: string | null;
  isSpecified: boolean;
  specifiedDoctorName: string | null;
};

export type DashboardAlert = {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: string;
};

import { CycleRingWidget, HealthMetricsGrid, SmartInsightsCarousel } from "./dashboard-widgets";

type DashboardShellProps = {
  role: "user" | "doctor" | "admin";
  userEmail: string;
  personalQuestions: DashboardQuestion[];
  reviewQuestions: DashboardQuestion[];
  feedbackAlerts: DashboardAlert[];
};

type DashboardSection = {
  id: string;
  label: string;
  description: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function StatusBadge({ replied }: { replied: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
        replied
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {replied ? "Replied" : "Reply pending"}
    </span>
  );
}

function CycleDetailsTab() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SmartInsightsCarousel />
      <CycleRingWidget />
      <div className="mt-4">
        <h3 className="font-heading text-xl font-bold text-foreground mb-4 pl-2">Today's Logs</h3>
        <HealthMetricsGrid />
      </div>
    </div>
  );
}

function AssignmentBadge({
  isSpecified,
  specifiedDoctorName,
}: Pick<DashboardQuestion, "isSpecified" | "specifiedDoctorName">) {
  if (!isSpecified) return null;

  return (
    <span className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
      {specifiedDoctorName ? `Specified: ${specifiedDoctorName}` : "Specified"}
    </span>
  );
}

function QuickAccessMenu({
  sections,
  activeSection,
  onSelect,
}: {
  sections: DashboardSection[];
  activeSection: string;
  onSelect: (sectionId: string) => void;
}) {
  return (
    <aside className="h-fit rounded-[32px] border-0 bg-white/60 dark:bg-black/20 p-6 shadow-sm backdrop-blur-xl lg:sticky lg:top-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary/70 font-bold ml-2">
        Quick Access
      </p>
      <nav className="mt-4 space-y-1">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            className={`block w-full rounded-2xl px-4 py-3.5 text-left transition-all duration-300 ${
              activeSection === section.id
                ? "bg-white dark:bg-white/10 shadow-sm text-primary font-bold scale-[1.02]"
                : "bg-transparent text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5 hover:text-foreground"
            }`}
          >
            <p className="text-sm">{section.label}</p>
          </button>
        ))}
      </nav>
    </aside>
  );
}

function Header({
  role,
  userEmail,
}: {
  role: DashboardShellProps["role"];
  userEmail: string;
}) {
  const router = useRouter();

  const description =
    role === "doctor" || role === "admin"
      ? "You have the regular member experience here, plus doctor tools for replying to pending posts."
      : "Submit questions for doctors and track which ones are still waiting for a reply.";

  return (
    <header className="rounded-[32px] border-0 bg-white/60 dark:bg-black/20 backdrop-blur-xl p-8 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-primary/70">
            Dashboard
          </p>
          <h1 className="mt-2 font-heading text-4xl font-black tracking-tight text-foreground">
            Maaya Health Hub
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground font-medium tracking-wide">
            Welcome back, <span className="font-bold text-foreground">{userEmail}</span>.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center rounded-xl border border-primary/20 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
          >
            Home
          </button>
        </div>
      </div>
    </header>
  );
}

function FeedbackFeed({ alerts }: { alerts: DashboardAlert[] }) {
  return (
    <section
      id="feedback-messages"
      className="scroll-mt-8 rounded-3xl border border-border bg-card p-8 shadow-sm"
    >
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Feedback messages
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            When a doctor replies to one of your posts, the feedback message will appear here.
          </p>
        </div>
        <p className="font-mono text-sm text-muted-foreground">{alerts.length} total</p>
      </div>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-5 py-10 text-sm text-muted-foreground">
            No feedback messages yet.
          </div>
        ) : null}

        {alerts.map((alert) => (
          <article key={alert.id} className="rounded-2xl border border-border/80 bg-background p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {alert.type.replace("_", " ")}
                </p>
                <h3 className="mt-2 text-base font-semibold text-foreground">{alert.title}</h3>
              </div>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${alert.isRead ? "bg-slate-100 text-slate-600" : "bg-primary/10 text-primary"}`}>
                {alert.isRead ? "Seen" : "New"}
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-foreground">{alert.message}</p>
            <p className="mt-3 text-xs text-muted-foreground">{formatDate(alert.createdAt)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function UserComposer() {
  const router = useRouter();
  const [questionText, setQuestionText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, startSubmitting] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startSubmitting(async () => {
      const response = await fetch("/api/doctor-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionText,
          isAnonymous,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        setError(data?.error ?? "Unable to submit your question.");
        return;
      }

      setQuestionText("");
      setIsAnonymous(true);
      router.refresh();
    });
  }

  return (
    <section
      id="ask-a-doctor"
      className="scroll-mt-8 rounded-3xl border border-border bg-card p-8 shadow-sm"
    >
      <h2 className="font-heading text-2xl font-semibold text-foreground">
        Ask a doctor
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        New posts will show <span className="font-medium text-foreground">Reply pending</span> until a doctor responds.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="question" className="mb-2 block text-sm font-medium text-foreground">
            Your post
          </label>
          <textarea
            id="question"
            value={questionText}
            onChange={(event) => setQuestionText(event.target.value)}
            required
            minLength={10}
            placeholder="Describe the changes or concerns you want a doctor to review."
            className="min-h-36 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-ring/40"
          />
        </div>

        <label className="flex items-center gap-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(event) => setIsAnonymous(event.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          Post anonymously
        </label>

        {error ? (
          <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : "Submit post"}
        </button>
      </form>
    </section>
  );
}

function UserPosts({ questions }: { questions: DashboardQuestion[] }) {
  return (
    <section
      id="your-posts"
      className="scroll-mt-8 rounded-3xl border border-border bg-card p-8 shadow-sm"
    >
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Your posts
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Once a doctor replies, the post no longer shows as pending.
          </p>
        </div>
        <p className="font-mono text-sm text-muted-foreground">{questions.length} total</p>
      </div>

      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-5 py-10 text-sm text-muted-foreground">
            No posts yet. Your first one will appear here.
          </div>
        ) : null}

        {questions.map((question) => (
          <article key={question.id} className="rounded-2xl border border-border/80 bg-background p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {question.isAnonymous ? "Anonymous" : "Visible profile"}
                  </p>
                  <AssignmentBadge
                    isSpecified={question.isSpecified}
                    specifiedDoctorName={question.specifiedDoctorName}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(question.createdAt)}
                </p>
              </div>
              <StatusBadge replied={question.replied} />
            </div>

            <p className="mt-4 text-sm leading-7 text-foreground">{question.questionText}</p>

            {question.answerText ? (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700">
                  Reply from {question.answeredBy ?? "Doctor"}
                </p>
                <p className="mt-2 text-sm leading-7 text-foreground">{question.answerText}</p>
                {question.answeredAt ? (
                  <p className="mt-3 text-xs text-emerald-700/80">
                    {formatDate(question.answeredAt)}
                  </p>
                ) : null}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function DoctorPending({ questions }: { questions: DashboardQuestion[] }) {
  const router = useRouter();
  const [draftReplies, setDraftReplies] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, startSubmitting] = useTransition();

  function submitReply(questionId: number) {
    const answerText = draftReplies[questionId]?.trim() ?? "";
    if (!answerText) {
      setError("Please write a reply before sending.");
      return;
    }

    setError(null);

    startSubmitting(async () => {
      const response = await fetch(`/api/doctor-questions/${questionId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answerText }),
      });

      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        setError(data?.error ?? "Unable to submit reply.");
        return;
      }

      setDraftReplies((current) => {
        const next = { ...current };
        delete next[questionId];
        return next;
      });
      router.refresh();
    });
  }

  return (
    <section
      id="reply-pending"
      className="scroll-mt-8 rounded-3xl border border-border bg-card p-8 shadow-sm"
    >
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Reply pending
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Replying here removes the post from the pending state for the user.
          </p>
        </div>
        <p className="font-mono text-sm text-muted-foreground">{questions.length} waiting</p>
      </div>

      {error ? (
        <p className="mb-5 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="space-y-5">
        {questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-5 py-10 text-sm text-muted-foreground">
            No posts are waiting for a doctor reply right now.
          </div>
        ) : null}

        {questions.map((question) => (
          <article key={question.id} className="rounded-2xl border border-border/80 bg-background p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {question.askedBy}
                  </p>
                  <AssignmentBadge
                    isSpecified={question.isSpecified}
                    specifiedDoctorName={question.specifiedDoctorName}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(question.createdAt)}
                </p>
              </div>
              <StatusBadge replied={false} />
            </div>

            <p className="mt-4 text-sm leading-7 text-foreground">{question.questionText}</p>

            <div className="mt-5 space-y-3">
              <label htmlFor={`reply-${question.id}`} className="block text-sm font-medium text-foreground">
                Your reply
              </label>
              <textarea
                id={`reply-${question.id}`}
                value={draftReplies[question.id] ?? ""}
                onChange={(event) =>
                  setDraftReplies((current) => ({
                    ...current,
                    [question.id]: event.target.value,
                  }))
                }
                placeholder="Share guidance for this user."
                className="min-h-28 w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-ring/40"
              />
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => submitReply(question.id)}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isSubmitting ? "Sending..." : "Send reply"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DoctorAnswered({ questions }: { questions: DashboardQuestion[] }) {
  return (
    <section
      id="replied-posts"
      className="scroll-mt-8 rounded-3xl border border-border bg-card p-8 shadow-sm"
    >
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Replied posts
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            These posts already have replies and no longer appear as pending.
          </p>
        </div>
        <p className="font-mono text-sm text-muted-foreground">{questions.length} answered</p>
      </div>

      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-5 py-10 text-sm text-muted-foreground">
            Answered posts will appear here.
          </div>
        ) : null}

        {questions.map((question) => (
          <article key={question.id} className="rounded-2xl border border-border/80 bg-background p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {question.askedBy}
                  </p>
                  <AssignmentBadge
                    isSpecified={question.isSpecified}
                    specifiedDoctorName={question.specifiedDoctorName}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(question.createdAt)}
                </p>
              </div>
              <StatusBadge replied />
            </div>

            <p className="mt-4 text-sm leading-7 text-foreground">{question.questionText}</p>

            {question.answerText ? (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700">
                  Replied by {question.answeredBy ?? "Doctor"}
                </p>
                <p className="mt-2 text-sm leading-7 text-foreground">{question.answerText}</p>
                {question.answeredAt ? (
                  <p className="mt-3 text-xs text-emerald-700/80">
                    {formatDate(question.answeredAt)}
                  </p>
                ) : null}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export function DashboardShell({
  role,
  userEmail,
  personalQuestions,
  reviewQuestions,
  feedbackAlerts,
}: DashboardShellProps) {
  const pending = reviewQuestions.filter((question) => !question.replied);
  const answered = reviewQuestions.filter((question) => question.replied);
  const canReply = role === "doctor" || role === "admin";
  const sections: DashboardSection[] = [
    {
      id: "cycle-details",
      label: "Cycle Details",
      description: "Your health overview",
    },
    {
      id: "feedback-messages",
      label: "Notifications & Feedback",
      description: "Read doctor responses.",
    },
    {
      id: "ask-a-doctor",
      label: "Doctor Help",
      description: "Create a new post.",
    },
    {
      id: "your-posts",
      label: "Your Posts",
      description: "Review your post history.",
    },
    ...(canReply
      ? [
          {
            id: "reply-pending",
            label: "Reply Pending",
            description: "Open posts that still need a doctor reply.",
          },
          {
            id: "replied-posts",
            label: "Replied Posts",
            description: "Previously answered posts for reference.",
          },
        ]
      : []),
  ];
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? "cycle-details");

  const activePanel = (() => {
    switch (activeSection) {
      case "cycle-details":
        return <CycleDetailsTab />;
      case "feedback-messages":
        return <FeedbackFeed alerts={feedbackAlerts} />;
      case "ask-a-doctor":
        return <UserComposer />;
      case "your-posts":
        return <UserPosts questions={personalQuestions} />;
      case "reply-pending":
        return canReply ? <DoctorPending questions={pending} /> : null;
      case "replied-posts":
        return canReply ? <DoctorAnswered questions={answered} /> : null;
      default:
        return <CycleDetailsTab />;
    }
  })();

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-background px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
        <Header role={role} userEmail={userEmail} />
        <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] items-start">
          <QuickAccessMenu
            sections={sections}
            activeSection={activeSection}
            onSelect={setActiveSection}
          />
          <div className="w-full max-w-full overflow-x-hidden pb-10">{activePanel}</div>
        </div>
      </div>
    </main>
  );
}
