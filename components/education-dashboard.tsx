"use client";

import { useState, useEffect } from "react";
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

export function EducationDashboard({ initialArticles = [] }: { initialArticles?: NewsArticle[] }) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [articles, setArticles] = useState<NewsArticle[]>(initialArticles || []);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    // We already have initial data for the first category on mount
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

  // Derived sections
  const topStory = articles.length > 0 ? articles[0] : null;
  const popularArticles = articles.length > 1 ? articles.slice(1, 6) : [];
  const moreArticles = articles.length > 6 ? articles.slice(6) : [];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div className="flex flex-col gap-10 font-sans mt-4">
      {/* Categories Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-4 mb-2">
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`text-xs sm:text-sm font-bold uppercase tracking-widest transition-colors ${
                isActive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-700 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
          <p className="mb-2 text-lg font-medium">No articles found</p>
          <p className="text-sm text-zinc-500">
            We couldn't track down any recent health articles for "{activeCategory}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Main Left Pane - Top Stories */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="mb-6 flex items-center">
              <h2 className="text-2xl font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 pr-4 whitespace-nowrap">
                Top Articles
              </h2>
              <div className="h-[2px] flex-1 bg-emerald-500 opacity-70"></div>
            </div>

            {topStory && (
              <a
                href={topStory.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-4 mb-10"
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900">
                  {topStory.urlToImage ? (
                    <img
                      src={topStory.urlToImage}
                      alt={topStory.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-400">
                      No Image
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-start px-1 mt-2">
                  <span className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    {activeCategory === "All" ? topStory.source.name : activeCategory}
                  </span>
                  <h3 className="mb-3 text-3xl font-extrabold leading-tight text-zinc-900 group-hover:underline dark:text-zinc-50">
                    {topStory.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 font-medium pt-1">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      {"Editorial Team"}
                    </span>
                  </div>
                </div>
              </a>
            )}

            {/* Additional articles grid underneath the top story if there are plenty */}
            {moreArticles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                {moreArticles.map((article, idx) => (
                  <a key={article.url + idx} href={article.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-4">
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded bg-zinc-100 dark:bg-zinc-900">
                       {article.urlToImage ? <img src={article.urlToImage} alt={article.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : null}
                    </div>
                    <div>
                      <span className="mb-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">{article.source.name}</span>
                      <h4 className="font-bold text-lg leading-snug text-zinc-900 dark:text-zinc-100 group-hover:underline line-clamp-3">{article.title}</h4>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Right Pane - Most Popular / Latest */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex flex-1 items-center">
                <h2 className="text-2xl font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 pr-4 whitespace-nowrap">
                  Popular
                </h2>
                <div className="h-[2px] flex-1 bg-emerald-500 opacity-70"></div>
              </div>
            </div>

            <div className="flex flex-col pt-2">
              {popularArticles.map((article, idx) => (
                <a
                  key={article.url + idx}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-5 py-6 border-b border-zinc-200 dark:border-zinc-800 last:border-b-0"
                >
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <span className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 opacity-90">
                         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                         {article.source.name || "News"}
                      </span>
                      <h3 className="mb-3 text-base font-bold leading-snug text-zinc-900 group-hover:underline dark:text-zinc-100 line-clamp-3">
                        {article.title}
                      </h3>
                    </div>
                    {/* Timestamp with calendar icon */}
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 tracking-wide uppercase">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      {formatDate(article.publishedAt)}
                    </div>
                  </div>
                  
                  {article.urlToImage ? (
                    <div className="w-[110px] h-[110px] shrink-0 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-900 mt-1">
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  ) : (
                    <div className="w-[110px] h-[110px] shrink-0 rounded bg-zinc-100 dark:bg-zinc-800 mt-1" />
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

