import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStiResourceBySlug } from "@/lib/sti-content";
import { ArrowLeft, Calendar, ShieldCheck, Sparkles, Stethoscope, User } from "lucide-react";

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
      <article className="mx-auto w-full max-w-6xl space-y-8 p-4 py-8 md:p-8">
        <Link
          href="/sti-awareness"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          Back to STI Awareness Center
        </Link>

        <section className="relative overflow-hidden rounded-[2rem] border border-emerald-200/60 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_35%),linear-gradient(135deg,rgba(236,253,245,0.96),rgba(255,255,255,0.98))] p-6 shadow-sm md:p-8">
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-300/25 blur-3xl" />
          <div className="relative space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                <ShieldCheck className="size-3.5" />
                {resource.category}
              </span>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-muted-foreground">{resource.reviewStatus}</span>
            </div>
            <div className="space-y-3">
              <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">{resource.title}</h1>
              <p className="max-w-3xl text-base leading-8 text-muted-foreground">{resource.summary}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/80 bg-white/80 p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Reviewed by</p>
                <p className="font-semibold text-foreground">{resource.reviewedBy}</p>
              </div>
              <div className="rounded-3xl border border-white/80 bg-white/80 p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Updated</p>
                <p className="font-semibold text-foreground">
                  {new Date(resource.updatedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="rounded-3xl border border-white/80 bg-white/80 p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Use this page for</p>
                <p className="font-semibold text-foreground">Symptoms, testing, prevention, and next-step planning</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 font-heading text-2xl font-bold text-foreground">Common symptom signals</h2>
              <ul className="grid gap-3 md:grid-cols-2">
                {resource.symptomSignals.map((signal) => (
                  <li key={signal} className="rounded-2xl border border-border bg-background p-4 text-sm leading-6 text-foreground">
                    {signal}
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Important reminder</p>
                <p className="text-sm leading-7 text-foreground">{resource.asymptomaticNote}</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-4 font-heading text-2xl font-bold text-foreground">Testing guide</h2>
                <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
                  {resource.testingGuide.map((item) => (
                    <li key={item} className="rounded-2xl border border-border bg-background p-4">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-4 font-heading text-2xl font-bold text-foreground">Treatment basics</h2>
                <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
                  {resource.treatmentBasics.map((item) => (
                    <li key={item} className="rounded-2xl border border-border bg-background p-4">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-4 font-heading text-2xl font-bold text-foreground">Prevention moves</h2>
                <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
                  {resource.preventionMoves.map((item) => (
                    <li key={item} className="rounded-2xl border border-border bg-background p-4">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-4 font-heading text-2xl font-bold text-foreground">Urgent care flags</h2>
                <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
                  {resource.urgentCareFlags.map((item) => (
                    <li key={item} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-foreground">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 shadow-sm">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-rose-600">Myth</p>
                <p className="text-sm leading-7 text-foreground">{resource.myth}</p>
              </div>
              <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Fact</p>
                <p className="text-sm leading-7 text-foreground">{resource.fact}</p>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                <h2 className="font-heading text-2xl font-bold text-foreground">What to do next</h2>
              </div>
              <ul className="space-y-3">
                {resource.nextSteps.map((step) => (
                  <li key={step} className="rounded-2xl border border-border bg-background p-4 text-sm leading-7 text-muted-foreground">
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Stethoscope className="size-5 text-primary" />
                <h2 className="font-heading text-2xl font-bold text-foreground">Questions for a doctor</h2>
              </div>
              <ul className="space-y-3">
                {resource.doctorQuestions.map((question) => (
                  <li key={question} className="rounded-2xl border border-border bg-background p-4 text-sm leading-7 text-muted-foreground">
                    {question}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2rem] border border-primary/15 bg-primary/5 p-6 shadow-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">When reading is not enough</p>
              <p className="text-sm leading-7 text-muted-foreground">
                This page is educational, not diagnostic. If your symptoms are severe, personal, or emotionally difficult to interpret, use Doctor&apos;s Help for context that is specific to you.
              </p>
              <Link
                href="/doctors-help"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                Ask a doctor
                <ArrowLeft className="size-4 rotate-180" />
              </Link>
            </div>
          </aside>
        </section>
      </article>
    );
  }

  return (
    <article className="mx-auto w-full max-w-4xl space-y-8 p-4 py-8 md:p-8">
      <Link
        href="/sti-awareness"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to STI Awareness Center
      </Link>

      <div className="relative aspect-video w-full overflow-hidden rounded-3xl border bg-muted shadow-sm sm:aspect-[21/9]">
        <Image
          src={resource.image}
          alt={resource.title}
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-4 text-white md:bottom-10 md:left-10 md:right-10">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl text-shadow-sm">
            {resource.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/90 sm:text-base">
            <div className="flex items-center gap-1.5">
              <User className="size-4" />
              <span>{resource.source.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              <span>{new Date(resource.publishedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 w-full max-w-3xl">
        <p className="mb-8 text-xl font-medium leading-relaxed text-foreground/80">
          {resource.description}
        </p>

        <div
          className="space-y-6 text-lg leading-relaxed text-muted-foreground [&>p]:mb-6 [&>h3]:mt-10 [&>h3]:mb-4 [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-foreground [&>h3]:tracking-tight [&_i]:text-foreground/80"
          dangerouslySetInnerHTML={{ __html: resource.content }}
        />
      </div>

      <div className="mx-auto w-full max-w-3xl rounded-[2rem] border border-primary/15 bg-primary/5 p-6 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Context</p>
        <p className="text-sm leading-7 text-muted-foreground">
          Research updates stay here for users who want them, but they are no longer the main STI experience. If this update relates to symptoms, testing confusion, or treatment questions, move into a guide or ask a doctor for personal advice.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/sti-awareness/testing-playbook" className="text-sm font-semibold text-primary hover:underline">
            Read the testing guide
          </Link>
          <Link href="/doctors-help" className="text-sm font-semibold text-primary hover:underline">
            Ask Doctor&apos;s Help
          </Link>
        </div>
      </div>
    </article>
  );
}
