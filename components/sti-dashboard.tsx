"use client";

import { useState } from "react";
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

export function STIDashboard({ articles }: { articles: Article[] }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredArticles = filterArticles(articles, activeCategory);
  
  const featuredArticle = filteredArticles.length > 0 ? filteredArticles[0] : null;
  const regularArticles = filteredArticles.length > 1 ? filteredArticles.slice(1) : [];

  return (
    <>
      {/* Categories / Badges row */}
      <div className="flex flex-wrap items-center gap-3 py-2">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.title;
          return (
            <button
              key={cat.title}
              onClick={() => setActiveCategory(cat.title)}
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
      </div>

      <hr className="border-border" />

      {filteredArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
          <Newspaper className="mb-4 size-10 text-muted-foreground opacity-50" />
          <p className="mb-2 text-lg font-medium">No articles found</p>
          <p className="text-sm text-muted-foreground">
            We couldn't track down any recent health articles for "{activeCategory}".
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Featured Large Article */}
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
                      {featuredArticle.title}
                    </h2>
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between p-6">
                  <p className="line-clamp-3 text-muted-foreground text-base sm:text-lg">
                    {featuredArticle.description}
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

          {/* Regular Articles side block & wrap taking remaining grid spots */}
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
                    <h3 className="line-clamp-2 text-xl font-bold leading-tight tracking-tight group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {article.description}
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
