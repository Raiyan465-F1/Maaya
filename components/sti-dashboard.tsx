"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { StiGuide, StiQuickAction, StiUpdate } from "@/lib/sti-content";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
} from "lucide-react";

const FILTERS = ["All", "Common STI", "Testing", "Prevention"] as const;

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function STIDashboard({
  guides,
  updates,
  quickActions,
}: {
  guides: StiGuide[];
  updates: StiUpdate[];
  quickActions: StiQuickAction[];
}) {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredGuides = useMemo(() => {
    const byFilter = activeFilter === "All" ? guides : guides.filter((guide) => guide.category === activeFilter);
    if (!normalizedSearch) return byFilter;

    return byFilter.filter((guide) => {
      const haystack = [
        guide.title,
        guide.summary,
        guide.category,
        guide.asymptomaticNote,
        ...guide.symptomSignals,
        ...guide.testingGuide,
        ...guide.preventionMoves,
        ...guide.urgentCareFlags,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [activeFilter, guides, normalizedSearch]);

  const featuredGuide = filteredGuides[0];
  const sidebarUpdates = updates.slice(0, 4);
  const updateStrip = updates.slice(0, 3);

  return (
    <div className="mx-auto max-w-none flex-1 space-y-12 px-2 pb-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-emerald-200/50 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.15),_transparent_50%),linear-gradient(145deg,rgba(240,253,244,0.9),rgba(255,255,255,1))] dark:border-emerald-900/30 dark:bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.15),_transparent_50%),linear-gradient(145deg,rgba(10,20,15,0.9),rgba(0,0,0,1))] p-8 md:p-12 shadow-2xl shadow-emerald-900/5 transition-all duration-500 hover:shadow-emerald-900/10 group">
        <div className="pointer-events-none absolute -left-12 -top-12 h-64 w-64 rounded-full bg-emerald-400/20 blur-[80px] group-hover:bg-emerald-400/30 transition-all duration-700" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-cyan-400/20 blur-[100px] group-hover:bg-cyan-400/30 transition-all duration-700" />
        
        <div className="relative grid gap-10 lg:grid-cols-[1.3fr_0.7fr] items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-white/60 dark:border-emerald-700/60 dark:bg-black/40 backdrop-blur-md px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-emerald-800 dark:text-emerald-300 shadow-sm">
              <ShieldCheck className="size-4 animate-pulse" />
              STI Awareness Center
            </div>
            <div className="space-y-4">
              <h1 className="font-heading text-4xl font-extrabold tracking-tight text-foreground md:text-6xl leading-[1.1]">
                Take control with
                <br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent drop-shadow-sm"> confident decisions.</span>
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Your practical hub for symptom checking, testing timelines, and prevention planning. Stop guessing and start taking actionable steps towards your sexual health.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/doctors-help"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95"
              >
                Consult a Doctor
                <ArrowRight className="size-5" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100/50 to-transparent dark:from-emerald-900/20 rounded-[2rem] -m-4 -z-10" />
            <div className="group/card rounded-[1.5rem] border border-white/60 dark:border-white/10 bg-white/60 dark:bg-black/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all hover:bg-white/80 dark:hover:bg-black/60 hover:-translate-y-1">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                <Stethoscope className="size-4" />
                Guidance First
              </div>
              <p className="text-lg font-bold text-foreground">Actionable Steps</p>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">Built for real decisions, offering immediate clarity over endless reading.</p>
            </div>
            <div className="group/card rounded-[1.5rem] border border-white/60 dark:border-white/10 bg-white/60 dark:bg-black/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all hover:bg-white/80 dark:hover:bg-black/60 hover:-translate-y-1">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
                <AlertTriangle className="size-4" />
                Important Notice
              </div>
              <p className="text-lg font-bold text-foreground">Not a Diagnosis</p>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">Persistent, severe, or urgent symptoms always require clinical evaluation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action, i) => (
          <Link
            key={action.title}
            href={action.href}
            className="group relative overflow-hidden rounded-[2rem] border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-emerald-500/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <p className="mb-4 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">{action.eyebrow}</p>
            <h2 className="mb-3 font-heading text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{action.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{action.description}</p>
            <div className="mt-6 flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
              Explore <ArrowRight className="ml-1 size-4" />
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <div className="rounded-[2.5rem] border border-border/60 bg-card p-8 md:p-10 shadow-lg shadow-emerald-900/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/50 dark:bg-emerald-900/10 rounded-full blur-[60px] pointer-events-none" />
            
            <div className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between relative z-10">
              <div>
                <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Knowledge Base</p>
                <h2 className="font-heading text-4xl font-extrabold tracking-tight text-foreground">Explore Conditions</h2>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  Quickly find actionable guides by searching symptoms, testing, or prevention terms. Skip the research feed when you need to know "what's next".
                </p>
              </div>
              <div className="flex w-full max-w-md items-center gap-2">
                <div className="relative w-full group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                     <Sparkles className="w-4 h-4 text-emerald-400 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search symptoms, conditions..."
                    className="w-full rounded-2xl border-2 border-border/50 bg-background/50 pl-11 pr-4 py-3.5 text-sm outline-none transition-all focus:border-emerald-500/50 focus:bg-background focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="rounded-2xl border-2 border-border/50 px-4 py-3.5 text-sm font-semibold text-muted-foreground transition hover:border-emerald-500/30 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 hover:text-foreground active:scale-95"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="mb-10 flex flex-wrap gap-2.5 relative z-10">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "rounded-full border-2 px-5 py-2.5 text-sm font-bold transition-all active:scale-95",
                    activeFilter === filter
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                      : "border-border/50 bg-background/50 text-muted-foreground hover:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-foreground"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>

            {featuredGuide ? (
              <div className="relative z-10">
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <Link
                    href={`/sti-awareness/${featuredGuide.slug}`}
                    className="group relative overflow-hidden rounded-[2rem] border-2 border-emerald-200/50 bg-gradient-to-b from-emerald-50/80 to-white dark:border-emerald-900/30 dark:from-emerald-950/40 dark:to-background p-8 shadow-md transition-all duration-300 hover:border-emerald-400/50 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white dark:bg-black/40 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-800">
                      <Activity className="size-3.5" />
                      Featured Guide
                    </div>
                    <h3 className="font-heading text-3xl font-extrabold tracking-tight text-foreground transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{featuredGuide.title}</h3>
                    <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{featuredGuide.summary}</p>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[1.5rem] bg-white/60 dark:bg-black/30 backdrop-blur border border-white/40 dark:border-white/5 p-5">
                        <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5"/> Watch For</p>
                        <ul className="space-y-2.5 text-sm font-medium text-foreground/80">
                          {featuredGuide.symptomSignals.slice(0, 3).map((signal) => (
                            <li key={signal} className="flex items-start gap-2">
                              <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0" />
                              <span className="leading-snug">{signal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-[1.5rem] bg-white/60 dark:bg-black/30 backdrop-blur border border-white/40 dark:border-white/5 p-5">
                        <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400 flex items-center gap-2"><ArrowRight className="w-3.5 h-3.5"/> Next Steps</p>
                        <ul className="space-y-2.5 text-sm font-medium text-foreground/80">
                          {featuredGuide.nextSteps.slice(0, 3).map((step) => (
                            <li key={step} className="flex items-start gap-2">
                              <span className="mt-1.5 w-1 h-1 rounded-full bg-cyan-400 flex-shrink-0" />
                              <span className="leading-snug">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Link>

                  <div className="rounded-[2rem] border-2 border-amber-200/50 bg-gradient-to-b from-amber-50/50 to-white dark:border-amber-900/30 dark:from-amber-950/20 dark:to-background p-8 shadow-sm">
                    <p className="mb-5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-500 flex items-center gap-2">
                       <AlertTriangle className="w-4 h-4"/> Urgent Care Protocol
                    </p>
                    <div className="space-y-5">
                      <div className="rounded-[1.5rem] border border-amber-200 bg-amber-100/50 dark:border-amber-900/50 dark:bg-amber-900/20 p-5">
                        <p className="font-bold text-amber-900 dark:text-amber-300">Seek Immediate Support</p>
                        <p className="mt-2 text-sm leading-relaxed text-amber-800/80 dark:text-amber-200/70">
                          Go to urgent care for severe pelvic pain, fever, post-assault care, pregnancy with new symptoms, or rapidly worsening discomfort.
                        </p>
                      </div>
                      <div className="rounded-[1.5rem] border border-border/60 bg-background/50 p-5">
                        <p className="font-bold text-foreground">Avoid Self-Diagnosis</p>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          If symptoms are confusing or persistent, don't rely solely on reading. Use Doctor's Help for professional guidance.
                        </p>
                      </div>
                      <Link
                        href="/doctors-help"
                        className="inline-flex items-center gap-2 mt-2 rounded-xl bg-amber-500/10 px-5 py-3 text-sm font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
                      >
                        Ask a doctor privately
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredGuides.slice(1).map((guide) => (
                    <Link
                      key={guide.slug}
                      href={`/sti-awareness/${guide.slug}`}
                      className="group flex flex-col justify-between rounded-[2rem] border-2 border-border/50 bg-background/50 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 hover:shadow-lg"
                    >
                      <div>
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                            {guide.category}
                          </span>
                          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                             <ShieldCheck className="w-3.5 h-3.5 opacity-70"/> {guide.reviewStatus}
                          </span>
                        </div>
                        <h3 className="font-heading text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{guide.title}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">{guide.summary}</p>
                      </div>
                      <div className="mt-5 pt-5 border-t border-border/50">
                        <p className="text-sm font-semibold text-foreground/90 flex items-start gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                          <span className="leading-snug">{guide.asymptomaticNote}</span>
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-[2rem] border-2 border-dashed border-emerald-200/50 bg-emerald-50/20 dark:border-emerald-900/30 dark:bg-emerald-900/10 p-12 text-center relative z-10">
                <p className="font-heading text-3xl font-bold tracking-tight text-foreground">No matching guides found</p>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground max-w-md mx-auto">
                  Try a broader symptom term, remove a filter, or go straight to Doctor's Help if the concern feels urgent or personal.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFilter("All");
                      setSearchQuery("");
                    }}
                    className="rounded-2xl border-2 border-border/50 px-6 py-3 text-sm font-bold text-foreground transition hover:border-emerald-400 hover:text-emerald-600 active:scale-95"
                  >
                    Reset search
                  </button>
                  <Link href="/doctors-help" className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:scale-95">
                    Consult Doctor
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[2.5rem] border border-border/60 bg-card p-8 md:p-10 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">Research Watch</p>
                <h2 className="font-heading text-3xl font-extrabold tracking-tight text-foreground">Featured Updates</h2>
              </div>
              <span className="rounded-full bg-cyan-100 dark:bg-cyan-900/40 px-4 py-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-300">{updateStrip.length} latest</span>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {updateStrip.map((article) => (
                <Link
                  key={article.slug}
                  href={article.url}
                  className="group overflow-hidden rounded-[1.75rem] border-2 border-border/50 bg-background/50 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <div className="absolute inset-0 bg-cyan-900/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">{article.topic}</p>
                    <h3 className="line-clamp-2 font-heading text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-cyan-600 dark:group-hover:text-cyan-400">{article.title}</h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{article.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-8">
          <div className="rounded-[2.5rem] border border-border/60 bg-card p-8 md:p-10 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/40 dark:bg-amber-900/10 rounded-full blur-[40px] pointer-events-none" />
            <h3 className="mb-6 font-heading text-2xl font-extrabold text-foreground relative z-10">How to use this hub</h3>
            <div className="space-y-4 relative z-10">
              <div className="rounded-[1.5rem] border border-border/60 bg-background/50 p-5 transition-colors hover:border-emerald-200 dark:hover:border-emerald-800">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold mb-3">1</div>
                <p className="font-bold text-foreground">Start with the concern</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Symptoms, testing timing, or prevention planning should drive your first click.</p>
              </div>
              <div className="rounded-[1.5rem] border border-border/60 bg-background/50 p-5 transition-colors hover:border-emerald-200 dark:hover:border-emerald-800">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold mb-3">2</div>
                <p className="font-bold text-foreground">Read the guide</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Understand common signs, what silence means, and the right questions to ask.</p>
              </div>
              <div className="rounded-[1.5rem] border border-border/60 bg-background/50 p-5 transition-colors hover:border-emerald-200 dark:hover:border-emerald-800">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold mb-3">3</div>
                <p className="font-bold text-foreground">Escalate when needed</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Use Doctor's Help when symptoms are personal, urgent, or difficult to sort through.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-border/60 bg-card p-8 md:p-10 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-heading text-xl font-extrabold text-foreground">All Research Updates</h3>
              <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">{sidebarUpdates.length} articles</span>
            </div>
            <div className="space-y-4">
              {sidebarUpdates.map((article) => (
                <Link
                  key={article.slug}
                  href={article.url}
                  className="group block rounded-[1.5rem] border-2 border-border/50 bg-background/50 p-5 transition-all hover:border-cyan-300/50 hover:bg-cyan-50/30 dark:hover:bg-cyan-900/10 hover:shadow-md"
                >
                  <p className="mb-2 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">{article.topic}</p>
                  <h4 className="font-bold text-foreground transition-colors group-hover:text-cyan-600 dark:group-hover:text-cyan-400">{article.title}</h4>
                  <p className="mt-2 text-xs font-medium text-muted-foreground opacity-80">{article.readingTime} · {formatDate(article.publishedAt)}</p>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
