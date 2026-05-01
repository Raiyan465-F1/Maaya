import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStiResourceBySlug } from "@/lib/sti-content";
import { ArrowLeft, Calendar, ShieldCheck, Sparkles, Stethoscope, User, Activity, AlertTriangle, ArrowRight } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = getStiResourceBySlug(slug);
  if (!resource) return { title: "Resource Not Found" };
  return { title: `${resource.title} | Maaya` };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = getStiResourceBySlug(slug);

  if (!resource) {
    notFound();
  }

  if (resource.kind === "guide") {
    return (
      <article className="mx-auto w-full max-w-[1400px] space-y-8 p-4 py-8 md:p-8">
        <Link
          href="/sti-awareness"
          className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:-translate-x-1 hover:border-emerald-300/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 shadow-sm"
        >
          <ArrowLeft className="size-4" />
          Back to STI Awareness Center
        </Link>

        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-emerald-200/60 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.15),_transparent_50%),linear-gradient(145deg,rgba(240,253,244,0.95),rgba(255,255,255,1))] dark:border-emerald-900/30 dark:bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.15),_transparent_50%),linear-gradient(145deg,rgba(10,20,15,0.95),rgba(0,0,0,1))] p-8 md:p-12 shadow-2xl shadow-emerald-900/5 group">
          <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-emerald-400/20 blur-[100px] group-hover:bg-emerald-400/30 transition-all duration-700" />
          <div className="relative space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-white/80 dark:border-emerald-800/60 dark:bg-black/40 backdrop-blur px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-300 shadow-sm">
                <ShieldCheck className="size-4" />
                {resource.category}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-white/80 dark:bg-black/40 backdrop-blur px-4 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground shadow-sm">
                <Stethoscope className="size-3.5 opacity-70" />
                {resource.reviewStatus}
              </span>
            </div>
            
            <div className="space-y-4 max-w-4xl">
              <h1 className="font-heading text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl leading-[1.1]">{resource.title}</h1>
              <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">{resource.summary}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 max-w-4xl pt-4">
              <div className="rounded-[1.5rem] border border-white/60 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl p-5 shadow-sm transition-all hover:bg-white/80 dark:hover:bg-black/60 hover:-translate-y-1">
                <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 flex items-center gap-2"><User className="w-3.5 h-3.5"/> Reviewed By</p>
                <p className="font-bold text-foreground">{resource.reviewedBy}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/60 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl p-5 shadow-sm transition-all hover:bg-white/80 dark:hover:bg-black/60 hover:-translate-y-1">
                <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 flex items-center gap-2"><Calendar className="w-3.5 h-3.5"/> Updated</p>
                <p className="font-bold text-foreground">
                  {new Date(resource.updatedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-emerald-200/50 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/20 backdrop-blur-xl p-5 shadow-sm transition-all hover:-translate-y-1">
                <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300 flex items-center gap-2"><Sparkles className="w-3.5 h-3.5"/> Key Focus</p>
                <p className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">Symptoms, testing, prevention, and next-step planning.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-8">
            
            {/* Symptoms */}
            <div className="relative overflow-hidden rounded-[2.5rem] border border-border/60 bg-card p-8 shadow-lg">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 shadow-inner">
                  <Activity className="size-6" />
                </div>
                <h2 className="font-heading text-3xl font-extrabold text-foreground">Common Symptom Signals</h2>
              </div>
              
              <ul className="grid gap-4 md:grid-cols-2">
                {resource.symptomSignals.map((signal) => (
                  <li key={signal} className="flex items-start gap-3 rounded-[1.5rem] border border-border/50 bg-background/50 p-5 shadow-sm transition-colors hover:border-rose-200 dark:hover:border-rose-900">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
                      <span className="h-2 w-2 rounded-full bg-current" />
                    </span>
                    <span className="text-sm font-medium leading-relaxed text-foreground/90">{signal}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-6 rounded-[1.5rem] border border-amber-200/80 bg-gradient-to-r from-amber-50 to-amber-100/30 dark:border-amber-900/50 dark:from-amber-950/40 dark:to-background p-6 shadow-sm">
                <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-500 flex items-center gap-2"><AlertTriangle className="size-4" /> Important Reminder</p>
                <p className="text-base font-medium leading-relaxed text-amber-900 dark:text-amber-200">{resource.asymptomaticNote}</p>
              </div>
            </div>

            {/* Testing & Treatment */}
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-[2.5rem] border border-border/60 bg-card p-8 shadow-lg transition-transform hover:-translate-y-1">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400">
                    <Sparkles className="size-5" />
                  </div>
                  <h2 className="font-heading text-2xl font-extrabold text-foreground">Testing Guide</h2>
                </div>
                <ul className="space-y-4">
                  {resource.testingGuide.map((item, i) => (
                    <li key={item} className="flex items-start gap-3 rounded-[1.25rem] border border-border/40 bg-background/50 p-4">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-[0.65rem] font-bold text-cyan-700 dark:text-cyan-300">{i + 1}</div>
                      <span className="text-sm font-medium leading-relaxed text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[2.5rem] border border-border/60 bg-card p-8 shadow-lg transition-transform hover:-translate-y-1">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="size-5" />
                  </div>
                  <h2 className="font-heading text-2xl font-extrabold text-foreground">Treatment Basics</h2>
                </div>
                <ul className="space-y-4">
                  {resource.treatmentBasics.map((item) => (
                    <li key={item} className="flex items-start gap-3 rounded-[1.25rem] border border-border/40 bg-background/50 p-4">
                      <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                      <span className="text-sm font-medium leading-relaxed text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Prevention & Urgent Care */}
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-[2.5rem] border border-border/60 bg-card p-8 shadow-lg">
                <h2 className="mb-6 font-heading text-2xl font-extrabold text-foreground">Prevention Moves</h2>
                <ul className="space-y-4">
                  {resource.preventionMoves.map((item) => (
                    <li key={item} className="flex items-start gap-3 rounded-[1.25rem] border border-border/40 bg-background/50 p-4">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                      <span className="text-sm font-medium leading-relaxed text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="relative overflow-hidden rounded-[2.5rem] border border-amber-200/60 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20 p-8 shadow-lg">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
                <h2 className="mb-6 font-heading text-2xl font-extrabold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="size-6 text-amber-600" />
                  Urgent Care Flags
                </h2>
                <ul className="space-y-4 relative z-10">
                  {resource.urgentCareFlags.map((item) => (
                    <li key={item} className="flex items-start gap-3 rounded-[1.25rem] border border-amber-200/60 bg-amber-100/50 dark:border-amber-900/60 dark:bg-amber-900/30 p-4">
                      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-500" />
                      <span className="text-sm font-bold leading-relaxed text-amber-900 dark:text-amber-200">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          <aside className="space-y-8">
            {/* Myth vs Fact */}
            <div className="grid gap-6">
              <div className="rounded-[2.5rem] border border-rose-200/60 bg-rose-50/50 dark:border-rose-900/40 dark:bg-rose-950/20 p-8 shadow-sm">
                <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-rose-600 flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-200 dark:bg-rose-900 text-xs">✕</span> Myth</p>
                <p className="text-base font-medium leading-relaxed text-foreground/80">{resource.myth}</p>
              </div>
              <div className="rounded-[2.5rem] border border-emerald-200/60 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20 p-8 shadow-sm">
                <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-200 dark:bg-emerald-900 text-xs">✓</span> Fact</p>
                <p className="text-base font-medium leading-relaxed text-foreground/80">{resource.fact}</p>
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-border/60 bg-card p-8 shadow-lg relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 blur-2xl pointer-events-none transition-transform group-hover:scale-150" />
              <div className="mb-6 flex items-center gap-3 relative z-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="size-5" />
                </div>
                <h2 className="font-heading text-2xl font-extrabold text-foreground">Actionable Next Steps</h2>
              </div>
              <ul className="space-y-4 relative z-10">
                {resource.nextSteps.map((step) => (
                  <li key={step} className="flex items-start gap-3 rounded-[1.5rem] border border-border/50 bg-background/50 p-5 transition-colors hover:border-emerald-200 dark:hover:border-emerald-800">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                      →
                    </span>
                    <span className="text-sm font-medium leading-relaxed text-foreground/80">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2.5rem] border border-border/60 bg-card p-8 shadow-lg relative overflow-hidden group">
               <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-cyan-100 dark:bg-cyan-900/30 blur-2xl pointer-events-none transition-transform group-hover:scale-150" />
              <div className="mb-6 flex items-center gap-3 relative z-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400">
                  <Stethoscope className="size-5" />
                </div>
                <h2 className="font-heading text-2xl font-extrabold text-foreground">Questions for a Doctor</h2>
              </div>
              <ul className="space-y-4 relative z-10">
                {resource.doctorQuestions.map((question) => (
                  <li key={question} className="flex items-start gap-3 rounded-[1.5rem] border border-border/50 bg-background/50 p-5 transition-colors hover:border-cyan-200 dark:hover:border-cyan-800">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-[10px] font-bold text-cyan-700 dark:text-cyan-400">
                      ?
                    </span>
                    <span className="text-sm font-medium leading-relaxed text-foreground/80">{question}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2.5rem] border border-emerald-200/50 bg-gradient-to-b from-emerald-50/50 to-emerald-100/20 dark:border-emerald-900/30 dark:from-emerald-950/40 dark:to-background p-8 shadow-lg">
              <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Personal Consultation</p>
              <h3 className="mb-3 font-heading text-xl font-bold text-foreground">When reading is not enough</h3>
              <p className="text-sm leading-relaxed text-muted-foreground mb-6">
                This guide is for educational purposes and is not diagnostic. If your symptoms are severe, highly personal, or confusing, you should speak with a professional.
              </p>
              <Link
                href="/doctors-help"
                className="inline-flex w-full justify-center items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95"
              >
                Ask a Doctor Privately
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </aside>
        </section>
      </article>
    );
  }

  return (
    <article className="mx-auto w-full max-w-[1200px] space-y-12 p-4 py-8 md:p-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-50/50 via-white to-transparent dark:from-cyan-950/20 dark:via-background pointer-events-none -z-10" />
      <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-cyan-400/10 blur-[120px] pointer-events-none -z-10" />

      <Link
        href="/sti-awareness"
        className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:-translate-x-1 hover:border-cyan-300/50 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/30 hover:text-cyan-700 dark:hover:text-cyan-400 shadow-sm"
      >
        <ArrowLeft className="size-4" />
        Back to Research Watch
      </Link>

      <div className="relative aspect-video w-full overflow-hidden rounded-[2.5rem] border border-cyan-100 dark:border-cyan-900/50 shadow-2xl shadow-cyan-900/10 sm:aspect-[21/9] group">
        <Image
          src={resource.image}
          alt={resource.title}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 flex flex-col gap-5 text-white md:bottom-12 md:left-12 md:right-12">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-cyan-500/20 backdrop-blur-md px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-cyan-50 border border-cyan-400/30">
            <Activity className="size-3.5" />
            Research Update
          </span>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl text-shadow-sm max-w-4xl">
            {resource.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-white/90 sm:text-base mt-2">
            <div className="flex items-center gap-2">
              <User className="size-5 text-cyan-300" />
              <span>{resource.source.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-5 text-cyan-300" />
              <span>{new Date(resource.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 w-full max-w-3xl rounded-[2rem] bg-white/60 dark:bg-black/20 backdrop-blur-xl border border-white/50 dark:border-white/10 p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <p className="mb-10 text-2xl font-semibold leading-relaxed text-foreground/90 border-l-4 border-cyan-500 pl-6">
          {resource.description}
        </p>

        <div
          className="prose prose-lg dark:prose-invert prose-p:leading-relaxed prose-p:text-muted-foreground prose-h3:text-3xl prose-h3:font-extrabold prose-h3:tracking-tight prose-h3:mt-12 prose-h3:mb-6 prose-a:text-cyan-600 dark:prose-a:text-cyan-400 max-w-none"
          dangerouslySetInnerHTML={{ __html: resource.content }}
        />
      </div>

      <div className="mx-auto w-full max-w-3xl relative overflow-hidden rounded-[2.5rem] border-2 border-cyan-200/50 bg-gradient-to-b from-cyan-50/80 to-cyan-100/10 dark:border-cyan-900/30 dark:from-cyan-950/30 dark:to-background p-10 shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-200/30 dark:bg-cyan-700/20 rounded-full blur-[40px] pointer-events-none" />
        <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-cyan-100/50 dark:bg-cyan-900/30 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-400">
          <Sparkles className="size-3.5" />
          Clinical Context
        </p>
        <p className="text-base font-medium leading-relaxed text-foreground/80 mb-8 max-w-2xl">
          Research updates provide the latest clinical data, but they aren't meant to replace personalized medical advice. If this information relates to your symptoms, testing confusion, or treatment plans, consider talking to a professional.
        </p>
        <div className="flex flex-wrap gap-4 relative z-10">
          <Link href="/sti-awareness/testing-playbook" className="inline-flex items-center gap-2 rounded-2xl bg-white dark:bg-black px-6 py-3.5 text-sm font-bold text-foreground shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border border-border/50">
            Read the Testing Guide <ArrowRight className="size-4" />
          </Link>
          <Link href="/doctors-help" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/40">
            Ask a Doctor Privately <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
