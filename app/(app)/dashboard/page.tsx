import Link from "next/link";

const spotlightCards = [
  {
    href: "/forum",
    eyebrow: "Community",
    title: "Forum discussions",
    description:
      "Ask questions, share updates, post photos or videos by link, and keep conversations going with replies and upvotes.",
    cta: "Open forum",
  },
  {
    href: "/doctors-help",
    eyebrow: "Experts",
    title: "Doctor's Help",
    description:
      "Browse verified professionals and reach out when you want advice that should come from a clinician.",
    cta: "See doctors",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-primary/15 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm">
        <p className="font-mono text-xs tracking-widest text-primary uppercase mb-3">
          Personal Dashboard
        </p>
        <h1 className="font-heading text-3xl font-bold text-foreground tracking-tight mb-2">
          Your{" "}
          <span className="italic bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            dashboard
          </span>
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          This is now your launch point for the community forum and Doctor&apos;s Help. Use the forum to post
          questions, share media, comment, reply, and follow discussions from other members.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {spotlightCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-[2rem] border border-border bg-card p-6 shadow-sm transition-transform hover:-translate-y-1"
          >
            <p className="font-mono text-xs tracking-widest text-primary uppercase">{card.eyebrow}</p>
            <h2 className="mt-3 font-heading text-2xl font-semibold text-foreground">{card.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{card.description}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              {card.cta}
              <span aria-hidden>→</span>
            </span>
          </Link>
        ))}
      </section>

      <section className="rounded-[2rem] border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
        Reminders, saved content, and cycle insights can still live here next, but the forum is ready to use now.
      </section>
    </div>
  );
}
