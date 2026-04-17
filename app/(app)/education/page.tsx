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
      <div className="mb-10 flex flex-col items-start justify-between gap-6 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-400 p-8 text-white shadow-md sm:flex-row sm:items-center">
        <div>
          <h2 className="mb-2 text-2xl font-bold tracking-tight">Quiz of the Day! 🧠</h2>
          <p className="text-sm text-pink-50 max-w-lg leading-relaxed">
            Test your knowledge on reproductive health and body positivity. Check back daily to challenge yourself!
          </p>
        </div>
        <button className="whitespace-nowrap rounded-full bg-white px-6 py-3 text-sm font-semibold text-pink-600 shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0">
          Start Quiz
        </button>
      </div>
      
      <EducationDashboard initialArticles={initialArticles} />
    </>
  );
}
