"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { NewsArticle, fetchNewsByCategory } from "@/lib/news";
import { Loader2 } from "lucide-react";

const CATEGORIES = [
  "All",
  "Puberty",
  "Contraception",
  "Reproductive Health",
  "Consent",
  "Pregnancy",
];

function highlightMatch(text: string, query: string): ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-sm bg-primary/20 text-foreground">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function EducationDashboard({ initialArticles = [] }: { initialArticles?: NewsArticle[] }) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [articles, setArticles] = useState<NewsArticle[]>(initialArticles || []);
  const [isLoading, setIsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [likedTags, setLikedTags] = useState<string[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (activeCategory === CATEGORIES[0] && Array.isArray(initialArticles) && initialArticles.length > 0) {
      setArticles(initialArticles);
      return;
    }

    async function loadData() {
      setIsLoading(true);
      try {
        const data = await fetchNewsByCategory(activeCategory);
        if (isMounted) setArticles(data || []);
      } catch (err) {
        console.error(err);
        if (isMounted) setArticles([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [activeCategory, initialArticles]);

  useEffect(() => {
    setSearchQuery("");
  }, [activeCategory]);

  useEffect(() => {
    let isMounted = true;
    async function loadProfileLikedTags() {
      setProfileLoading(true);
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) return;
        const data = (await res.json()) as { likedTags?: unknown };
        const tags = Array.isArray(data.likedTags)
          ? (data.likedTags.filter((t): t is string => typeof t === "string" && Boolean(t.trim()))).map((t) =>
              t.trim().toLowerCase()
            )
          : [];
        if (isMounted) setLikedTags(tags);
      } catch {
        // best-effort
      } finally {
        if (isMounted) setProfileLoading(false);
      }
    }

    loadProfileLikedTags();
    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredArticles = useMemo(() => {
    if (!normalizedSearch) return articles;
    return articles.filter((a) => {
      const haystack = `${a.title} ${a.description} ${a.source?.name ?? ""}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [articles, normalizedSearch]);

  const recommendedArticles = useMemo(() => {
    if (!likedTags.length) return filteredArticles;

    const scoreOf = (a: NewsArticle) => {
      const title = a.title.toLowerCase();
      const description = a.description.toLowerCase();
      const source = (a.source?.name ?? "").toLowerCase();

      let score = 0;
      for (const tag of likedTags) {
        if (!tag) continue;
        if (title.includes(tag)) score += 3;
        else if (description.includes(tag)) score += 2;
        else if (source.includes(tag)) score += 1;
      }
      return score;
    };

    return [...filteredArticles].sort((a, b) => {
      const sa = scoreOf(a);
      const sb = scoreOf(b);
      if (sb !== sa) return sb - sa;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }, [filteredArticles, likedTags]);

  const topStory = recommendedArticles.length > 0 ? recommendedArticles[0] : null;
  const popularArticles = recommendedArticles.length > 1 ? recommendedArticles.slice(1, 6) : [];
  const moreArticles = recommendedArticles.length > 6 ? recommendedArticles.slice(6) : [];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div className="flex flex-col gap-10 font-sans mt-4">
      {/* Categories + Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-4 mb-2">
        <div className="flex flex-wrap items-center gap-3">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-primary/15 bg-card text-foreground hover:border-primary/30 hover:text-primary"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="flex w-full sm:w-auto items-center gap-3">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles…"
            className="w-full sm:w-[260px] rounded-xl border border-primary/15 bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary/40"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="rounded-xl border border-primary/15 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {/* Result count */}
      {!isLoading && articles.length > 0 && (
        <div className="-mt-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing {recommendedArticles.length} of {articles.length} articles
          </span>
          {normalizedSearch && (
            <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
              &ldquo;{searchQuery.trim()}&rdquo;
            </span>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : recommendedArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/20 p-12 text-center">
          <p className="mb-2 font-heading text-lg font-semibold text-foreground">
            {normalizedSearch ? "No matching articles" : "No articles found"}
          </p>
          <p className="text-sm text-muted-foreground">
            {normalizedSearch
              ? "Try a different search term or clear the filter."
              : `We couldn't track down any recent health articles for "${activeCategory}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Main Left Pane */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="mb-6 flex items-center">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground pr-4 whitespace-nowrap">
                Top Articles
              </h2>
              <div className="h-[2px] flex-1 bg-primary/30"></div>
            </div>

            {topStory && (
              <a
                href={topStory.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-4 mb-10"
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-card">
                  {topStory.urlToImage ? (
                    <img
                      src={topStory.urlToImage}
                      alt={topStory.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-start px-1 mt-2">
                  <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/20">
                    {activeCategory === "All" ? topStory.source.name : activeCategory}
                  </span>
                  <h3 className="mb-3 font-heading text-3xl font-bold leading-tight tracking-tight text-foreground group-hover:underline">
                    {highlightMatch(topStory.title, normalizedSearch)}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Editorial Team
                  </p>
                </div>
              </a>
            )}

            {moreArticles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10 pt-8 border-t border-border">
                {moreArticles.map((article, idx) => (
                  <a key={article.url + idx} href={article.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-4">
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border bg-card">
                       {article.urlToImage ? <img src={article.urlToImage} alt={article.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : null}
                    </div>
                    <div>
                      <span className="mb-2 font-mono text-[10px] font-medium tracking-widest text-primary uppercase block">{article.source.name}</span>
                      <h4 className="font-heading font-bold text-lg leading-snug text-foreground group-hover:underline line-clamp-3">
                        {highlightMatch(article.title, normalizedSearch)}
                      </h4>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Right Pane */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex flex-1 items-center">
                <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground pr-4 whitespace-nowrap">
                  {likedTags.length ? "For you" : "Popular"}
                </h2>
                <div className="h-[2px] flex-1 bg-secondary/30"></div>
              </div>
            </div>

            <div className="flex flex-col pt-2">
              {likedTags.length && !profileLoading ? (
                <p className="mb-3 text-sm text-muted-foreground">
                  Ranked by your liked tags ({likedTags.slice(0, 3).map((t) => `#${t}`).join(", ")}
                  {likedTags.length > 3 ? "…" : ""}).
                </p>
              ) : null}

              {popularArticles.map((article, idx) => (
                <a
                  key={article.url + idx}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-5 py-6 border-b border-border last:border-b-0"
                >
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <span className="mb-2 inline-flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-widest text-secondary uppercase">
                         {article.source.name || "News"}
                      </span>
                      <h3 className="mb-3 text-base font-semibold leading-snug text-foreground group-hover:underline line-clamp-3">
                        {highlightMatch(article.title, normalizedSearch)}
                      </h3>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 font-mono text-[11px] font-medium text-muted-foreground tracking-wide tabular-nums">
                      {formatDate(article.publishedAt)}
                    </div>
                  </div>

                  {article.urlToImage ? (
                    <div className="w-[110px] h-[110px] shrink-0 overflow-hidden rounded-xl border border-border bg-card mt-1">
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  ) : (
                    <div className="w-[110px] h-[110px] shrink-0 rounded-xl border border-border bg-card mt-1" />
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
