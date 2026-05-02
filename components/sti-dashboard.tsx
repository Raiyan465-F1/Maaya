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
  ChevronDown,
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
  const [expandedSti, setExpandedSti] = useState<string | null>(null);

  const commonStis = guides.filter((g) => g.category === "Common STI");
  const preventionGuide = guides.find((g) => g.slug === "safer-sex-playbook");

  const sidebarUpdates = updates.slice(0, 4);
  const mainUpdates = updates.slice(0, 6);

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
            
            <div className="mb-8 relative z-10">
              <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Knowledge Base</p>
              <h2 className="font-heading text-4xl font-extrabold tracking-tight text-foreground">Common Conditions</h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                Review the signs and essential facts for the most common STIs. Remember, many infections can be entirely silent—which is why screening matters even if you feel fine.
              </p>
            </div>

            <div className="space-y-4 relative z-10">
              {commonStis.map((sti) => (
                <div key={sti.slug} className="rounded-[2rem] border-2 border-border/50 bg-background/50 overflow-hidden transition-all duration-300 hover:border-emerald-300/50">
                  <button 
                    type="button"
                    onClick={() => setExpandedSti(expandedSti === sti.slug ? null : sti.slug)}
                    className="flex w-full items-center justify-between p-6 text-left"
                  >
                     <div className="flex items-center gap-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                          <Activity className="size-6" />
                        </div>
                        <div>
                          <h3 className="font-heading text-2xl font-bold tracking-tight text-foreground">{sti.title}</h3>
                          <p className="mt-1 text-sm font-medium text-muted-foreground line-clamp-1">{sti.summary}</p>
                        </div>
                     </div>
                     <div className={cn("transition-transform duration-300", expandedSti === sti.slug ? "rotate-180" : "")}>
                        <ChevronDown className="size-6 text-muted-foreground" />
                     </div>
                  </button>
                  {expandedSti === sti.slug && (
                    <div className="px-6 pb-6 pt-2 border-t border-border/50 bg-white/50 dark:bg-black/20">
                       <div className="grid gap-6 md:grid-cols-2 mt-4">
                          <div>
                             <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5"/> Watch For</p>
                             <ul className="space-y-2.5 text-sm font-medium text-foreground/80">
                              {sti.symptomSignals.map(sig => (
                                <li key={sig} className="flex items-start gap-2">
                                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                                  <span className="leading-snug">{sig}</span>
                                </li>
                              ))}
                             </ul>
                          </div>
                          <div className="flex flex-col justify-between space-y-4">
                             <div className="rounded-[1.5rem] bg-amber-50 dark:bg-amber-950/20 p-5 border border-amber-100 dark:border-amber-900/30">
                                <p className="text-sm font-bold text-amber-900 dark:text-amber-300 mb-1">Important Reminder</p>
                                <p className="text-sm leading-relaxed text-amber-800/80 dark:text-amber-200/70">{sti.asymptomaticNote}</p>
                             </div>
                             <Link href={`/sti-awareness/${sti.slug}`} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/25">
                               Read Full Guide <ArrowRight className="size-4" />
                             </Link>
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-border/60 bg-card p-8 md:p-10 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-pink-600 dark:text-pink-400">Knowledge Hub</p>
                <h2 className="font-heading text-3xl font-extrabold tracking-tight text-foreground">All Research Updates</h2>
              </div>
              <span className="rounded-full bg-pink-100 dark:bg-pink-900/40 px-4 py-1.5 text-xs font-bold text-pink-700 dark:text-pink-300">{mainUpdates.length} articles</span>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {mainUpdates.map((article) => (
                <Link
                  key={article.slug}
                  href={article.url}
                  className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-border/50 bg-card shadow-sm transition-all duration-300 hover:border-cyan-400/50 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <div className="absolute inset-0 bg-cyan-900/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex flex-col flex-1 p-6">
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
          {/* Urgent Care Protocol */}
          <div className="rounded-[2.5rem] border-2 border-amber-200/50 bg-gradient-to-b from-amber-50/50 to-amber-100/10 dark:border-amber-900/30 dark:from-amber-950/20 dark:to-background p-8 md:p-10 shadow-sm relative overflow-hidden group hover:border-amber-300/50 transition-all">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 dark:bg-amber-700/20 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-700" />
             <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-500 shadow-inner">
                  <AlertTriangle className="size-6" />
                </div>
                <h3 className="font-heading text-2xl font-extrabold text-amber-950 dark:text-amber-100">Urgent Care<br/>Protocol</h3>
             </div>
             
             <div className="space-y-4 relative z-10">
                <div className="rounded-[1.5rem] border border-amber-200/60 bg-amber-100/50 dark:border-amber-900/50 dark:bg-amber-900/20 p-5 shadow-sm">
                  <p className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Seek Immediate Support
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-amber-800/80 dark:text-amber-200/70">
                    Go to urgent care for severe pelvic pain, fever, post-assault care, pregnancy with new symptoms, or rapidly worsening discomfort.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-border/60 bg-background/50 p-5 shadow-sm">
                  <p className="font-bold text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" /> Avoid Self-Diagnosis
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    If symptoms are confusing or persistent, don't rely solely on reading. Talk to a clinician.
                  </p>
                </div>
                <Link
                  href="/doctors-help"
                  className="flex items-center justify-center gap-2 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/40 active:scale-95"
                >
                  Consult a Doctor Now
                  <ArrowRight className="size-5" />
                </Link>
             </div>
          </div>

          {/* Safer Sex Playbook (Prevention) */}
          {preventionGuide && (
            <div className="rounded-[2.5rem] border-2 border-cyan-200/50 bg-gradient-to-b from-cyan-50/80 to-cyan-100/10 dark:border-cyan-900/30 dark:from-cyan-950/30 dark:to-background p-8 md:p-10 shadow-sm relative overflow-hidden group hover:border-cyan-300/50 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-200/30 dark:bg-cyan-700/20 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-700" />
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-cyan-100/50 dark:bg-cyan-900/30 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-400 relative z-10">
                <ShieldCheck className="size-3.5" />
                Prevention Plan
              </div>
              <h3 className="mb-3 font-heading text-3xl font-extrabold text-foreground relative z-10">{preventionGuide.title}</h3>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground relative z-10">{preventionGuide.summary}</p>
              
              <ul className="mb-6 space-y-3 relative z-10">
                {preventionGuide.preventionMoves.slice(0, 3).map(move => (
                  <li key={move} className="flex items-start gap-3 rounded-[1.25rem] border border-cyan-100 dark:border-cyan-900/40 bg-white/50 dark:bg-black/20 p-4 text-sm font-medium text-foreground/80 shadow-sm transition-colors hover:border-cyan-300 dark:hover:border-cyan-700">
                    <ShieldCheck className="mt-0.5 size-4 text-cyan-500 shrink-0" />
                    <span className="leading-snug">{move}</span>
                  </li>
                ))}
              </ul>
              
              <Link href={`/sti-awareness/${preventionGuide.slug}`} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/40 active:scale-95 relative z-10">
                Explore Full Playbook <ArrowRight className="size-5" />
              </Link>
            </div>
          )}

          <div className="rounded-[2.5rem] border-2 border-cyan-200/50 bg-gradient-to-br from-cyan-50 to-blue-50 dark:border-cyan-900/50 dark:from-cyan-950/40 dark:to-blue-950/20 p-8 md:p-10 shadow-lg relative overflow-hidden group/container">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-300/20 dark:bg-cyan-700/20 rounded-full blur-[60px] pointer-events-none transition-transform duration-700 group-hover/container:scale-150" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-300/20 dark:bg-blue-700/20 rounded-full blur-[60px] pointer-events-none transition-transform duration-700 group-hover/container:scale-150" />
            
            <div className="mb-6 flex items-center justify-between relative z-10">
              <h3 className="font-heading text-xl font-extrabold text-cyan-950 dark:text-cyan-100">Featured Updates</h3>
              <span className="rounded-full bg-white/60 dark:bg-black/40 backdrop-blur border border-cyan-200 dark:border-cyan-800 px-3 py-1 text-xs font-bold text-cyan-700 dark:text-cyan-300 shadow-sm">{sidebarUpdates.length} latest</span>
            </div>
            
            <div className="space-y-4 relative z-10">
              {sidebarUpdates.map((article) => (
                <Link
                  key={article.slug}
                  href={article.url}
                  className="group block rounded-[1.5rem] border border-white/60 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all duration-300 hover:bg-white/90 dark:hover:bg-black/60 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-cyan-300/50"
                >
                  <p className="mb-2 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">{article.topic}</p>
                  <h4 className="font-bold text-cyan-950 dark:text-cyan-50 transition-colors group-hover:text-cyan-700 dark:group-hover:text-cyan-300">{article.title}</h4>
                  <p className="mt-2 text-xs font-medium text-cyan-800/70 dark:text-cyan-200/60">{article.readingTime} · {formatDate(article.publishedAt)}</p>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
