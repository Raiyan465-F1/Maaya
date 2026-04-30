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
    <div className="mx-auto max-w-none flex-1 space-y-10 px-1 pb-2">
      <section className="relative overflow-hidden rounded-[2rem] border border-emerald-200/50 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_35%),linear-gradient(135deg,rgba(236,253,245,0.96),rgba(255,255,255,0.98))] p-6 shadow-sm md:p-8">
        <div className="pointer-events-none absolute -left-8 top-10 h-32 w-32 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-cyan-300/25 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
              <ShieldCheck className="size-3.5" />
              STI Awareness Center
            </div>
            <div className="space-y-3">
              <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                Practical guidance for
                <span className="bg-gradient-to-r from-emerald-700 via-primary to-cyan-600 bg-clip-text text-transparent"> symptoms, testing, and next steps</span>
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
                This area should help a user decide what to do, not just read headlines. Start with symptoms, testing timing, or prevention planning. Research updates still exist, but they are intentionally secondary.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/doctors-help"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
              >
                Ask Doctor&apos;s Help
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/sti-awareness/testing-playbook"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-white/70 px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
              >
                Start with testing
                <Sparkles className="size-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Stethoscope className="size-4 text-emerald-700" />
                Key difference
              </div>
              <p className="text-lg font-semibold text-foreground">Guidance first</p>
              <p className="text-sm text-muted-foreground">Built for real decisions, not just reading.</p>
            </div>
            <div className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <AlertTriangle className="size-4 text-amber-600" />
                Important
              </div>
              <p className="text-lg font-semibold text-foreground">Not diagnostic</p>
              <p className="text-sm text-muted-foreground">Persistent, severe, or urgent symptoms still need clinical care.</p>
            </div>
            <div className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Syringe className="size-4 text-cyan-700" />
                Research watch
              </div>
              <p className="text-lg font-semibold text-foreground">{updates.length} tracked updates</p>
              <p className="text-sm text-muted-foreground">Still available when users want deeper context.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="rounded-[1.65rem] border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{action.eyebrow}</p>
            <h2 className="mb-2 font-heading text-xl font-bold tracking-tight text-foreground">{action.title}</h2>
            <p className="text-sm leading-7 text-muted-foreground">{action.description}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-border bg-card p-7 shadow-sm md:p-8">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Find a guide</p>
                <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">Search by condition or concern</h2>
                <p className="mt-3 max-w-3xl text-sm leading-8 text-muted-foreground">
                  Search symptoms, testing, or prevention terms. This section is designed to answer “what should I do next?” faster than a research feed.
                </p>
              </div>
              <div className="flex w-full max-w-md items-center gap-2">
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search symptoms, testing, prevention..."
                  className="w-full rounded-2xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/40"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="rounded-2xl border border-primary/15 px-3 py-3 text-xs font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mb-5 flex flex-wrap gap-3">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition",
                    activeFilter === filter
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/20 hover:text-foreground"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>

            {featuredGuide ? (
              <>
                <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
                  <Link
                    href={`/sti-awareness/${featuredGuide.slug}`}
                    className="overflow-hidden rounded-[1.85rem] border border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,0.9),rgba(255,255,255,1))] p-7 shadow-sm transition hover:border-emerald-300"
                  >
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                      <Activity className="size-3.5" />
                      Featured guide
                    </div>
                    <h3 className="font-heading text-3xl font-bold tracking-tight text-foreground">{featuredGuide.title}</h3>
                    <p className="mt-3 max-w-2xl text-sm leading-8 text-muted-foreground">{featuredGuide.summary}</p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-3xl border border-white/80 bg-white/75 p-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Watch for</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {featuredGuide.symptomSignals.slice(0, 3).map((signal) => (
                            <li key={signal}>{signal}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-3xl border border-white/80 bg-white/75 p-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Next step</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {featuredGuide.nextSteps.slice(0, 3).map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Link>

                  <div className="rounded-[1.85rem] border border-border bg-background p-6">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Need care fast</p>
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <p className="font-semibold text-foreground">Urgent support</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          Seek medical care promptly for severe pelvic pain, fever, assault, pregnancy with new symptoms, or rapidly worsening discomfort.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border p-4">
                        <p className="font-semibold text-foreground">Do not rely on one article</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          If symptoms are significant or the timing of testing is confusing, use Doctor&apos;s Help instead of trying to self-diagnose from general reading.
                        </p>
                      </div>
                      <Link
                        href="/doctors-help"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                      >
                        Ask a doctor privately
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredGuides.map((guide) => (
                    <Link
                      key={guide.slug}
                      href={`/sti-awareness/${guide.slug}`}
                      className="rounded-[1.65rem] border border-border bg-background p-6 transition hover:border-primary/20 hover:shadow-sm"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                          {guide.category}
                        </span>
                        <span className="text-xs text-muted-foreground">{guide.reviewStatus}</span>
                      </div>
                      <h3 className="font-heading text-xl font-bold tracking-tight text-foreground">{guide.title}</h3>
                      <p className="mt-3 text-sm leading-8 text-muted-foreground">{guide.summary}</p>
                      <p className="mt-4 text-sm font-medium leading-7 text-foreground">{guide.asymptomaticNote}</p>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-primary/25 bg-background p-10 text-center">
                <p className="font-heading text-2xl font-bold tracking-tight text-foreground">No matching guides</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Try a broader symptom term, remove a filter, or go straight to Doctor&apos;s Help if the concern feels urgent or personal.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFilter("All");
                      setSearchQuery("");
                    }}
                    className="rounded-full border border-primary/20 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
                  >
                    Reset search
                  </button>
                  <Link href="/doctors-help" className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background">
                    Ask Doctor&apos;s Help
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-7 shadow-sm md:p-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Research watch</p>
                <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Updates, kept secondary</h2>
              </div>
              <span className="text-sm text-muted-foreground">{updateStrip.length} featured</span>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {updateStrip.map((article) => (
                <Link
                  key={article.slug}
                  href={article.url}
                  className="overflow-hidden rounded-[1.5rem] border border-border bg-background transition hover:border-primary/20 hover:shadow-sm"
                >
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">{article.topic}</p>
                    <h3 className="line-clamp-2 font-heading text-lg font-bold tracking-tight text-foreground">{article.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{article.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-border bg-card p-7 shadow-sm md:p-8">
            <h3 className="mb-4 font-heading text-xl font-bold text-foreground">How this page should be used</h3>
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="font-semibold text-foreground">1. Start with the concern</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Symptoms, testing timing, or prevention planning should drive the first click.</p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="font-semibold text-foreground">2. Read the guide</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Use the guide to understand common signs, what silence means, and which questions to ask.</p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="font-semibold text-foreground">3. Escalate when needed</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Use Doctor&apos;s Help when symptoms are personal, urgent, or emotionally difficult to sort through alone.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-7 shadow-sm md:p-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-xl font-bold text-foreground">Latest research updates</h3>
              <span className="text-sm text-muted-foreground">{sidebarUpdates.length} items</span>
            </div>
            <div className="space-y-4">
              {sidebarUpdates.map((article) => (
                <Link
                  key={article.slug}
                  href={article.url}
                  className="block rounded-3xl border border-border bg-background p-4 transition hover:border-primary/20 hover:shadow-sm"
                >
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">{article.topic}</p>
                  <h4 className="font-semibold text-foreground">{article.title}</h4>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{article.readingTime} · {formatDate(article.publishedAt)}</p>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
