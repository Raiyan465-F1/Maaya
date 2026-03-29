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
