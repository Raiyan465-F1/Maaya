"use client";

import { useState, useMemo, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { type Article } from "@/lib/news";
import { Newspaper, ArrowUpRight, ShieldCheck, Activity, BookOpen, Layers } from "lucide-react";

const CATEGORIES = [
  { title: "All", icon: <Layers className="size-4" /> },
  { title: "New Research", icon: <Activity className="size-4" /> },
  { title: "Prevention", icon: <ShieldCheck className="size-4" /> },
  { title: "Education", icon: <BookOpen className="size-4" /> },
  { title: "Global Trends", icon: <Newspaper className="size-4" /> },
];

function filterArticles(articles: Article[], category: string) {
  if (category === "All") return articles;

  return articles.filter(a => {
    const text = (a.title + " " + a.description + " " + a.content).toLowerCase();
    if (category === "New Research") return text.includes("research") || text.includes("trial") || text.includes("study") || text.includes("vaccine") || text.includes("new");
    if (category === "Prevention") return text.includes("prevent") || text.includes("prep") || text.includes("screening") || text.includes("prophylaxis") || text.includes("vaccine");
    if (category === "Education") return text.includes("guidelines") || text.includes("stigma") || text.includes("care") || text.includes("awareness") || text.includes("telemedicine");
    if (category === "Global Trends") return text.includes("global") || text.includes("surge") || text.includes("world") || text.includes("trends");
    return true;
  });
}

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

export function STIDashboard({ articles }: { articles: Article[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const categoryFiltered = useMemo(
    () => filterArticles(articles, activeCategory),
    [articles, activeCategory]
  );

  const filteredArticles = useMemo(() => {
    if (!normalizedSearch) return categoryFiltered;
    return categoryFiltered.filter((a) => {
      const haystack = `${a.title} ${a.description} ${a.source?.name ?? ""}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [categoryFiltered, normalizedSearch]);

  const featuredArticle = filteredArticles.length > 0 ? filteredArticles[0] : null;
  const regularArticles = filteredArticles.length > 1 ? filteredArticles.slice(1) : [];

  return (
    <>
      {/* Categories + search */}
      <div className="flex flex-wrap items-center gap-3 py-2">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.title;
          return (
            <button
              key={cat.title}
              onClick={() => { setActiveCategory(cat.title); setSearchQuery(""); }}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-secondary/10 text-secondary hover:bg-secondary/20 border-transparent"
              }`}
            >
              {cat.icon}
              {cat.title}
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles…"
            className="w-full sm:w-[240px] rounded-xl border border-primary/15 bg-background px-4 py-2 text-sm outline-none transition focus:border-primary/40"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="rounded-xl border border-primary/15 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {/* Result count */}
      {categoryFiltered.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing {filteredArticles.length} of {categoryFiltered.length} articles
          </span>
          {normalizedSearch && (
            <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
              &ldquo;{searchQuery.trim()}&rdquo;
            </span>
          )}
        </div>
      )}

      <hr className="border-border" />

      {filteredArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/20 p-12 text-center">
          <Newspaper className="mb-4 size-10 text-muted-foreground opacity-50" />
          <p className="mb-2 font-heading text-lg font-semibold text-foreground">
            {normalizedSearch ? "No matching articles" : "No articles found"}
          </p>
          <p className="text-sm text-muted-foreground">
            {normalizedSearch
              ? "Try a different search term or clear the filter."
              : `We couldn't find any articles for "${activeCategory}".`}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredArticle && (
            <div className="md:col-span-2 lg:col-span-2 flex flex-col group overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
              <Link href={featuredArticle.url} className="flex flex-col h-full">
                <div className="relative aspect-video w-full overflow-hidden sm:aspect-[21/9]">
                  <Image
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 text-white">
                    <span className="inline-flex w-fit items-center rounded-full bg-primary/90 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm">
                      {activeCategory === "All" ? "Featured" : activeCategory}
                    </span>
                    <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
                      {highlightMatch(featuredArticle.title, normalizedSearch)}
                    </h2>
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between p-6">
                  <p className="line-clamp-3 text-muted-foreground text-base sm:text-lg">
                    {highlightMatch(featuredArticle.description, normalizedSearch)}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <div className="size-6 rounded-full bg-secondary text-[10px] flex items-center justify-center font-bold text-white uppercase">
                        {featuredArticle.source.name[0]}
                      </div>
                      {featuredArticle.source.name}
                    </div>
                    <span>{new Date(featuredArticle.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {regularArticles.map((article, idx) => (
            <div key={idx} className="group flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all">
              <Link href={article.url} className="flex flex-col h-full">
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div className="space-y-3">
                    <h3 className="line-clamp-2 font-heading text-xl font-bold leading-tight tracking-tight group-hover:text-primary transition-colors">
                      {highlightMatch(article.title, normalizedSearch)}
                    </h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {highlightMatch(article.description, normalizedSearch)}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      {article.source.name}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-primary font-medium opacity-0 transition-opacity group-hover:opacity-100">
                      Read <ArrowUpRight className="size-3" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
