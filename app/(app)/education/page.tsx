import { fetchNewsByCategory } from "@/lib/news";
import { EducationDashboard } from "@/components/education-dashboard";

export default async function EducationPage() {
  const initialArticles = await fetchNewsByCategory("All");

  return (
    <>
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">
        Educational Hub
      </p>
      <h1 className="mb-2 font-heading text-3xl font-bold tracking-tight text-foreground">
        Learn{" "}
        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent italic">
          & discover
        </span>
      </h1>
      <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
        Explore curated, trusted medical content covering puberty, contraception, reproductive health, and more.
      </p>

      <EducationDashboard initialArticles={initialArticles} />
    </>
  );
}
