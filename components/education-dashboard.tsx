"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  EDUCATION_TOPICS,
  type EducationArticle,
  type EducationTopic,
} from "@/lib/education-feed";
import { cn } from "@/lib/utils";
import {
  ExternalLink,
  Loader2,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

type SortMode = "relevance" | "newest";

export function EducationDashboard() {
  const [articles, setArticles] = useState<EducationArticle[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [articleError, setArticleError] = useState("");
  const [activeTopic, setActiveTopic] = useState<EducationTopic>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSource, setSelectedSource] = useState("All sources");
  const [sortMode, setSortMode] = useState<SortMode>("relevance");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  function mergeArticles(existing: EducationArticle[], incoming: EducationArticle[]) {
    const seen = new Set(existing.map((article) => article.url));
    const merged = [...existing];

    for (const article of incoming) {
      if (seen.has(article.url)) continue;
      seen.add(article.url);
      merged.push(article);
    }

    return merged;
  }

  useEffect(() => {
    let isMounted = true;

    async function loadArticles() {
      setIsLoadingArticles(true);
      setArticleError("");
      setPage(1);

      try {
        const params = new URLSearchParams({
          topic: activeTopic,
          query: deferredSearchTerm.trim(),
          page: "1",
        });
        const response = await fetch(`/api/education/articles?${params.toString()}`);
        const data = (await response.json()) as { articles?: EducationArticle[]; hasMore?: boolean; error?: string };
        if (!isMounted) return;

        setArticles(data.articles ?? []);
        setSelectedSource("All sources");
        setHasMore(Boolean(data.hasMore));
        setArticleError(data.error ?? "");
      } catch (error) {
        console.error(error);
        if (!isMounted) return;
        setArticles([]);
        setHasMore(false);
        setArticleError("Unable to load educational articles right now.");
      } finally {
        if (isMounted) setIsLoadingArticles(false);
      }
    }

    loadArticles();
    return () => {
      isMounted = false;
    };
  }, [activeTopic, deferredSearchTerm]);

  async function loadMore() {
    const nextPage = page + 1;
    setIsLoadingMore(true);
    setArticleError("");

    try {
      const params = new URLSearchParams({
        topic: activeTopic,
        query: deferredSearchTerm.trim(),
        page: String(nextPage),
      });
      const response = await fetch(`/api/education/articles?${params.toString()}`);
      const data = (await response.json()) as { articles?: EducationArticle[]; hasMore?: boolean; error?: string };

      setArticles((current) => mergeArticles(current, data.articles ?? []));
      setPage(nextPage);
      setHasMore(Boolean(data.hasMore));
      setArticleError(data.error ?? "");
    } catch (error) {
      console.error(error);
      setArticleError("Unable to load more educational articles right now.");
    } finally {
      setIsLoadingMore(false);
    }
  }

  const sourceOptions = useMemo(() => {
    return ["All sources", ...Array.from(new Set(articles.map((article) => article.sourceName))).sort((a, b) => a.localeCompare(b))];
  }, [articles]);

  const visibleArticles = useMemo(() => {
    const filtered = selectedSource === "All sources"
      ? articles
      : articles.filter((article) => article.sourceName === selectedSource);

    if (sortMode === "newest") {
      return [...filtered].sort((a, b) => {
        const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : -1;
        const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : -1;
        return bTime - aTime;
      });
    }

    return filtered;
  }, [articles, selectedSource, sortMode]);

  function formatPublishedAt(value: string | null) {
    if (!value) return null;
    const timestamp = new Date(value);
    if (Number.isNaN(timestamp.getTime())) return null;
    return timestamp.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[2.25rem] border border-primary/10 bg-[radial-gradient(circle_at_top_left,_rgba(253,186,116,0.18),_transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.97),rgba(255,247,237,0.98))] p-6 shadow-sm md:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-12 top-10 h-44 w-44 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-36 w-36 rounded-full bg-rose-300/20 blur-3xl" />
        <div className="relative space-y-5">
          <div className="space-y-5">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Educational Hub</p>
            <div className="space-y-3">
              <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl xl:text-6xl">
                Search trusted health content
                <span className="bg-gradient-to-r from-amber-600 via-rose-500 to-primary bg-clip-text text-transparent"> across live article sources</span>
              </h1>
              <p className="max-w-3xl text-sm leading-8 text-muted-foreground md:text-base">
                The hub is focused on article discovery with live search and topic filters. Quizzes now live on a separate page so this screen stays dedicated to browsing and reading.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/education/quiz"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
              >
                Open quiz lab
                <Sparkles className="size-4" />
              </Link>
              <Link
                href="#education-feed"
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
              >
                Explore articles
                <Search className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="education-feed" className="rounded-[2rem] border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5 border-b border-border pb-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Article discovery</p>
                <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">Search across trusted health sources</h2>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                  Results are pulled and merged from configured live sources, then filtered and ranked here so the visible cards and the shown count stay in sync.
                </p>
              </div>

              <div className="flex w-full max-w-md items-center gap-2">
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search puberty, birth control, pregnancy..."
                  className="w-full rounded-2xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/40"
                />
                {searchTerm ? (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="rounded-2xl border border-primary/15 px-4 py-3 text-xs font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {EDUCATION_TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setActiveTopic(topic)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition",
                    activeTopic === topic
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/20 hover:text-foreground"
                  )}
                >
                  {topic}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <SlidersHorizontal className="size-4" />
                Refine results
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Source</span>
                  <select
                    value={selectedSource}
                    onChange={(event) => setSelectedSource(event.target.value)}
                    className="rounded-xl border border-primary/15 bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary/40"
                  >
                    {sourceOptions.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Sort</span>
                  <select
                    value={sortMode}
                    onChange={(event) => setSortMode(event.target.value as SortMode)}
                    className="rounded-xl border border-primary/15 bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary/40"
                  >
                    <option value="relevance">Most relevant</option>
                    <option value="newest">Newest first</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6">
            {isLoadingArticles ? (
              <div className="flex min-h-[320px] items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : visibleArticles.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-primary/20 bg-background p-10 text-center">
                <p className="font-heading text-2xl font-bold tracking-tight text-foreground">No matching articles</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {articleError || "Try a broader topic or simplify the search term."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{visibleArticles.length}</span> results for{" "}
                    <span className="font-semibold text-foreground">{activeTopic}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">Opens source site in a new tab</p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {visibleArticles.map((article, index) => (
                    <a
                      key={article.id}
                      href={article.url}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        "rounded-[1.5rem] border border-border bg-background p-5 transition hover:border-primary/20 hover:shadow-sm",
                        index === 0 && "lg:col-span-2 xl:col-span-2 border-primary/15 bg-[linear-gradient(135deg,rgba(255,247,237,0.9),rgba(255,255,255,1))]"
                      )}
                    >
                      {index === 0 ? (
                        <div
                          className="mb-5 min-h-[220px] rounded-[1.25rem] bg-cover bg-center"
                          style={{ backgroundImage: `url(${article.image})` }}
                        />
                      ) : null}
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        {index === 0 ? (
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                            Featured
                          </span>
                        ) : null}
                        <span className="rounded-full bg-secondary/10 px-3 py-1 text-[11px] font-medium text-secondary">
                          {article.sourceName}
                        </span>
                        {formatPublishedAt(article.publishedAt) ? (
                          <span className="rounded-full border border-primary/15 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                            {formatPublishedAt(article.publishedAt)}
                          </span>
                        ) : null}
                      </div>
                      <h3 className={cn("font-heading font-bold tracking-tight text-foreground", index === 0 ? "text-3xl" : "text-xl")}>
                        {article.title}
                      </h3>
                      <p className={cn("mt-3 text-sm text-muted-foreground", index === 0 ? "leading-8" : "leading-7")}>{article.description}</p>
                      {article.tags.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {article.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="rounded-full border border-primary/15 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                        Read on source
                        <ExternalLink className="size-4" />
                      </span>
                    </a>
                  ))}
                </div>

                {hasMore ? (
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Loading more
                        </>
                      ) : (
                        "Load more articles"
                      )}
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
      </section>
    </div>
  );
}
