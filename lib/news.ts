"use server";

import Parser from "rss-parser";

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: { name: string };
}

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
    ]
  }
});

const FEEDS: Record<string, string[]> = {
  "All": [
    "https://www.sciencedaily.com/rss/mind_brain/child_development.xml",
    "https://www.sciencedaily.com/rss/health_medicine/sexual_health.xml",
    "https://www.sciencedaily.com/rss/health_medicine/womens_health.xml",
    "https://www.sciencedaily.com/rss/health_medicine/pregnancy_and_childbirth.xml"
  ],
  "Puberty": [
    "https://www.sciencedaily.com/rss/mind_brain/child_development.xml"
  ],
  "Contraception": [
    "https://www.sciencedaily.com/rss/health_medicine/sexual_health.xml",
    "https://www.sciencedaily.com/rss/health_medicine/birth_control.xml"
  ],
  "Reproductive Health": [
    "https://www.sciencedaily.com/rss/health_medicine/womens_health.xml",
  ],
  "Consent": [
    "https://www.sciencedaily.com/rss/mind_brain/psychology.xml"
  ],
  "Pregnancy": [
    "https://www.sciencedaily.com/rss/health_medicine/pregnancy_and_childbirth.xml"
  ],
  "default": [
    "https://www.sciencedaily.com/rss/top/health.xml"
  ]
};

function extractImage(item: any): string {
  if (item.media && item.media.$ && item.media.$.url) {
    return item.media.$.url;
  }
  const contentMap = [item.contentEncoded, item.description, item.content].join(" ");
  const imgMatch = contentMap.match(/<img[^>]+src="([^">]+)"/);
  return imgMatch ? imgMatch[1] : "";
}

const FALLBACK_IMAGES: Record<string, string[]> = {
  "All": [
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80"
  ],
  "Puberty": [
    "https://images.unsplash.com/photo-1594882645126-14020914d58d?w=800&q=80",
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80",
  ],
  "Contraception": [
    "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80",
    "https://images.unsplash.com/photo-1628102491629-778571d893a3?w=800&q=80",
  ],
  "Reproductive Health": [
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
  ],
  "Consent": [
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80",
    "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80",
  ],
  "Pregnancy": [
    "https://images.unsplash.com/photo-1555243896-c709bfa0b564?w=800&q=80",
    "https://images.unsplash.com/photo-1519802772250-a50a0afcb676?w=800&q=80",
  ],
  "default": [
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80"
  ]
};

function getRandomFallback(category: string): string {
  const options = FALLBACK_IMAGES[category] || FALLBACK_IMAGES["default"];
  return options[Math.floor(Math.random() * options.length)];
}

export async function fetchNewsByCategory(category: string): Promise<NewsArticle[]> {
  try {
    const feedUrls = FEEDS[category] || FEEDS["default"];
    let articles: NewsArticle[] = [];

    // Fetch all RSS URLs concurrently for maximum speed
    const fetchedFeeds = await Promise.allSettled(
      feedUrls.map(url => parser.parseURL(url))
    );

    for (const result of fetchedFeeds) {
      if (result.status === "fulfilled") {
        const feed = result.value;
        const parsedItems = feed.items.map(item => {
          let desc = (item as any).contentSnippet || (item as any).description || "";
          desc = desc.replace(/<[^>]*>?/gm, '').substring(0, 160) + "...";
          
          let image = extractImage(item);
          if (!image) {
            image = getRandomFallback(category);
          }

          return {
            title: item.title || "Medical Update",
            description: desc,
            url: item.link || "#",
            urlToImage: image,
            publishedAt: item.pubDate || new Date().toISOString(),
            source: { name: feed.title || "Health News" }
          };
        });

        articles = [...articles, ...parsedItems];
      }
    }

    if (articles.length === 0 && category !== "default") {
      return fetchNewsByCategory("default");
    }

    articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return articles.slice(0, 15);
  } catch (error) {
    console.error('Master RSS feed failure:', error);
    return [];
  }
import { REAL_ARTICLES } from "./real";

export interface Source {
  name: string;
  url: string;
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: Source;
}

export async function fetchNewsArticles(): Promise<Article[]> {
  // Simulate network delay for realistic loading skeleton states
  await new Promise((resolve) => setTimeout(resolve, 300));
  return REAL_ARTICLES;
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return REAL_ARTICLES.find((article) => article.slug === slug);
}
