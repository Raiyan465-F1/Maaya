"use client";

import { useState, useEffect, useRef } from "react";
import { NewsArticle, fetchNewsByCategory } from "@/lib/news";
import { ArticleCard } from "./article-card";
import { Loader2, Filter, ChevronDown } from "lucide-react";

const CATEGORIES = [
  "All",
  "Puberty",
  "Contraception",
  "Reproductive Health",
  "Consent",
  "Pregnancy",
  "STIs",
];

export function EducationDashboard({ initialArticles = [] }: { initialArticles?: NewsArticle[] }) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [articles, setArticles] = useState<NewsArticle[]>(initialArticles || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    // We already have initial data for the first category on mount
    if (activeCategory === CATEGORIES[0] && Array.isArray(initialArticles) && initialArticles.length > 0) return;

    async function loadData() {
      setIsLoading(true);
      try {
        const data = await fetchNewsByCategory(activeCategory);
        if (isMounted) setArticles(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [activeCategory, initialArticles]);

  return (
    <div className="flex flex-col gap-8">
      {/* Header & Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">
          {activeCategory === "All" ? "Latest Medical News" : activeCategory}
        </h2>

        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 hover:text-pink-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <Filter className="h-4 w-4" />
            <span>Filter</span>
            <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 top-full z-10 mt-2 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-xl animate-in fade-in slide-in-from-top-2 dark:border-zinc-800 dark:bg-zinc-950">
              {CATEGORIES.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => {
                      setActiveCategory(category);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-pink-50 font-medium text-pink-600 dark:bg-pink-950/50 dark:text-pink-400"
                        : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900/50"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
            <span className="sr-only">Loading articles...</span>
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, idx) => (
              <ArticleCard key={article.url + idx} article={article} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
            <p className="mb-2 text-lg font-medium text-zinc-900 dark:text-zinc-100">
              No articles found
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              We couldn't track down any recent health articles for "{activeCategory}".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
