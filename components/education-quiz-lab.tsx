"use client";

import { useEffect, useMemo, useState } from "react";
import type { EducationTrack } from "@/lib/education-content";
import { cn } from "@/lib/utils";
import { BookOpen, CheckCircle2 } from "lucide-react";

type ProgressState = {
  currentModuleId?: string;
  completedModuleIds: string[];
  quizScores: Record<string, number>;
};

const STORAGE_KEY = "maaya.education.progress.v1";

function readProgress() {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, ProgressState>;
  } catch {
    return {};
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function EducationQuizLab({ tracks }: { tracks: EducationTrack[] }) {
  const [progress, setProgress] = useState<Record<string, ProgressState>>({});
  const [activeTrackSlug, setActiveTrackSlug] = useState(tracks[0]?.slug ?? "");
  const [activeModuleId, setActiveModuleId] = useState(tracks[0]?.modules[0]?.id ?? "");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    const saved = readProgress();
    setProgress(saved);
    const continuingTrack = tracks.find((track) => (saved[track.slug]?.completedModuleIds.length ?? 0) > 0) ?? tracks[0];
    if (!continuingTrack) return;
    setActiveTrackSlug(continuingTrack.slug);
    setActiveModuleId(saved[continuingTrack.slug]?.currentModuleId ?? continuingTrack.modules[0]?.id ?? "");
  }, [tracks]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const activeTrack = useMemo(
    () => tracks.find((track) => track.slug === activeTrackSlug) ?? tracks[0],
    [activeTrackSlug, tracks]
  );

  const activeModule = useMemo(() => {
    if (!activeTrack) return undefined;
    return activeTrack.modules.find((module) => module.id === activeModuleId) ?? activeTrack.modules[0];
  }, [activeModuleId, activeTrack]);

  if (!activeTrack || !activeModule) return null;

  const currentModule = activeModule;

  const activeTrackProgress = progress[activeTrack.slug];
  const completedCount = activeTrackProgress?.completedModuleIds.length ?? 0;
  const totalCompleted = tracks.reduce((count, track) => count + (progress[track.slug]?.completedModuleIds.length ?? 0), 0);
  const progressPercent = Math.round((completedCount / activeTrack.modules.length) * 100);
  const quizScore = activeTrackProgress?.quizScores?.[currentModule.id];
  const hasAnsweredEveryQuestion = currentModule.quiz.every((question) => selectedAnswers[question.id] !== undefined);

  function openTrack(track: EducationTrack) {
    setActiveTrackSlug(track.slug);
    const nextModuleId =
      progress[track.slug]?.currentModuleId && track.modules.some((module) => module.id === progress[track.slug]?.currentModuleId)
        ? progress[track.slug]?.currentModuleId
        : track.modules[0]?.id;
    setActiveModuleId(nextModuleId ?? "");
    setSelectedAnswers({});
  }

  function openModule(moduleId: string) {
    setActiveModuleId(moduleId);
    setSelectedAnswers({});
    setProgress((current) => ({
      ...current,
      [activeTrack.slug]: {
        currentModuleId: moduleId,
        completedModuleIds: current[activeTrack.slug]?.completedModuleIds ?? [],
        quizScores: current[activeTrack.slug]?.quizScores ?? {},
      },
    }));
  }

  function completeModule() {
    const score = currentModule.quiz.reduce((count, question) => {
      return count + (selectedAnswers[question.id] === question.correctIndex ? 1 : 0);
    }, 0);

    const currentProgress = progress[activeTrack.slug];
    const completedModuleIds = Array.from(new Set([...(currentProgress?.completedModuleIds ?? []), currentModule.id]));

    setProgress((current) => ({
      ...current,
      [activeTrack.slug]: {
        currentModuleId: currentModule.id,
        completedModuleIds,
        quizScores: {
          ...(current[activeTrack.slug]?.quizScores ?? {}),
          [currentModule.id]: score,
        },
      },
    }));
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-primary/10 bg-[radial-gradient(circle_at_top_left,_rgba(253,186,116,0.18),_transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.97),rgba(255,247,237,0.98))] p-6 shadow-sm md:p-8 lg:p-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Education Quiz Lab</p>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">Guided tracks and knowledge checks</h1>
            <p className="mt-3 max-w-3xl text-sm leading-8 text-muted-foreground">
              The quiz experience lives here now as a separate learning page, so the main education hub can stay focused on live article discovery.
            </p>
          </div>
          <div className="rounded-2xl border border-primary/10 bg-white/80 px-4 py-3 text-sm shadow-sm">
            <p className="font-semibold text-foreground">{totalCompleted} modules completed</p>
            <p className="text-muted-foreground">{activeTrack.title} is {progressPercent}% done</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        {tracks.map((track) => {
          const done = progress[track.slug]?.completedModuleIds.length ?? 0;
          const isActive = activeTrack.slug === track.slug;

          return (
            <button
              key={track.slug}
              type="button"
              onClick={() => openTrack(track)}
              className={cn(
                "rounded-[1.5rem] border p-5 text-left transition",
                isActive
                  ? "border-primary/40 bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/20 hover:shadow-sm"
              )}
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{track.audienceLevel}</p>
              <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">{track.title}</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{track.strapline}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{done}/{track.modules.length} done</span>
                <span>{track.estimatedMinutes} min</span>
              </div>
            </button>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <aside className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 font-heading text-xl font-bold text-foreground">Track outline</h3>
          <div className="space-y-3">
            {activeTrack.modules.map((module, index) => {
              const isCurrent = module.id === activeModule.id;
              const isComplete = activeTrackProgress?.completedModuleIds.includes(module.id);
              return (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => openModule(module.id)}
                  className={cn(
                    "w-full rounded-3xl border p-4 text-left transition",
                    isCurrent ? "border-primary/40 bg-primary/5" : "border-border bg-background hover:border-primary/20"
                  )}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Module {index + 1}</span>
                    {isComplete ? <CheckCircle2 className="size-4 text-emerald-600" /> : null}
                  </div>
                  <p className="font-semibold text-foreground">{module.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{module.minutes} min</p>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="space-y-6 rounded-[1.75rem] border border-border bg-card p-5 shadow-sm">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{activeTrack.title}</p>
            <h3 className="font-heading text-3xl font-bold tracking-tight text-foreground">{currentModule.title}</h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{currentModule.summary}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {currentModule.objectives.map((objective) => (
              <div key={objective} className="rounded-2xl border border-border bg-background p-4 text-sm leading-6 text-foreground">
                {objective}
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {currentModule.sections.map((section) => (
              <article key={section.title} className="rounded-3xl border border-border bg-background p-5">
                <h4 className="mb-2 text-lg font-semibold text-foreground">{section.title}</h4>
                <p className="text-sm leading-7 text-muted-foreground">{section.body}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-rose-600">Myth</p>
              <p className="text-sm leading-7 text-foreground">{currentModule.myth}</p>
            </div>
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Fact</p>
              <p className="text-sm leading-7 text-foreground">{currentModule.fact}</p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-primary/15 bg-background p-5">
            <div className="mb-5 flex items-center gap-2">
              <BookOpen className="size-5 text-primary" />
              <h4 className="font-heading text-xl font-bold text-foreground">Knowledge check</h4>
            </div>
            <div className="space-y-5">
              {currentModule.quiz.map((question, index) => (
                <div key={question.id} className="rounded-3xl border border-border bg-card p-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Question {index + 1}</p>
                  <p className="mb-4 text-base font-medium text-foreground">{question.prompt}</p>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => {
                      const isSelected = selectedAnswers[question.id] === optionIndex;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setSelectedAnswers((current) => ({
                              ...current,
                              [question.id]: optionIndex,
                            }))
                          }
                          className={cn(
                            "w-full rounded-2xl border px-4 py-3 text-left text-sm transition",
                            isSelected
                              ? "border-primary bg-primary/5 text-foreground"
                              : "border-border bg-background text-muted-foreground hover:border-primary/20 hover:text-foreground"
                          )}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  {selectedAnswers[question.id] !== undefined ? (
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">{question.explanation}</p>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={completeModule}
                disabled={!hasAnsweredEveryQuestion}
                className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition disabled:cursor-not-allowed disabled:opacity-45"
              >
                Save module progress
              </button>
              <p className="text-sm text-muted-foreground">
                {quizScore !== undefined ? (
                  <>
                    Last score: <span className="font-semibold text-foreground">{quizScore}/{currentModule.quiz.length}</span>
                  </>
                ) : (
                  "Answer every question to store the module score."
                )}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-primary/10 bg-primary/5 p-5">
            <p className="text-sm leading-7 text-muted-foreground">
              Reviewed by <span className="font-semibold text-foreground">{activeTrack.reviewedBy}</span> and updated on{" "}
              <span className="font-semibold text-foreground">{formatDate(activeTrack.updatedAt)}</span>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
