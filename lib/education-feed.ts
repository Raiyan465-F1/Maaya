export type EducationTopic =
  | "All"
  | "Puberty"
  | "Contraception"
  | "Reproductive Health"
  | "Consent"
  | "Pregnancy";

export type EducationArticle = {
  id: string;
  title: string;
  description: string;
  url: string;
  sourceName: string;
  sourceType: "official-api" | "newsapi" | "gnews";
  image: string;
  topic: EducationTopic;
  tags: string[];
  publishedAt: string | null;
};

type ProviderResult = {
  articles: EducationArticle[];
  hasMore: boolean;
};

export const EDUCATION_TOPICS: EducationTopic[] = [
  "All",
  "Puberty",
  "Contraception",
  "Reproductive Health",
  "Consent",
  "Pregnancy",
];

const TOPIC_IMAGES: Record<EducationTopic, string[]> = {
  All: [
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&q=80",
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&q=80",
  ],
  Puberty: [
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&q=80",
    "https://images.unsplash.com/photo-1594882645126-14020914d58d?w=1200&q=80",
  ],
  Contraception: [
    "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200&q=80",
    "https://images.unsplash.com/photo-1628102491629-778571d893a3?w=1200&q=80",
  ],
  "Reproductive Health": [
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80",
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=80",
  ],
  Consent: [
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=80",
    "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80",
  ],
  Pregnancy: [
    "https://images.unsplash.com/photo-1555243896-c709bfa0b564?w=1200&q=80",
    "https://images.unsplash.com/photo-1519802772250-a50a0afcb676?w=1200&q=80",
  ],
};

const TOPIC_TERMS: Record<EducationTopic, string> = {
  All: '"puberty" OR "birth control" OR "sexual health" OR "pregnancy" OR "reproductive health"',
  Puberty: '"puberty" OR "teen development"',
  Contraception: '"birth control" OR contraception OR condoms',
  "Reproductive Health": '"reproductive health" OR "menstrual health" OR periods',
  Consent: '"healthy relationships" OR consent OR "sexual health"',
  Pregnancy: '"pregnancy" OR prenatal',
};

const TOPIC_SEED_TERMS: Record<EducationTopic, string[]> = {
  All: ["puberty", "birth control", "menstrual health", "pregnancy", "sexual health"],
  Puberty: ["puberty", "teen development"],
  Contraception: ["birth control", "contraception", "condoms"],
  "Reproductive Health": ["reproductive health", "menstrual health", "periods"],
  Consent: ["healthy relationships", "consent", "sexual health"],
  Pregnancy: ["pregnancy", "prenatal care"],
};

const TOPIC_KEYWORDS: Record<EducationTopic, string[]> = {
  All: ["puberty", "birth control", "menstrual", "pregnancy", "sexual health", "reproductive"],
  Puberty: ["puberty", "adolescent", "teen", "development"],
  Contraception: ["birth control", "contraception", "condom", "emergency contraception", "family planning"],
  "Reproductive Health": ["reproductive", "menstrual", "period", "ovulation", "fertility"],
  Consent: ["consent", "relationship", "communication", "sexual health", "boundaries"],
  Pregnancy: ["pregnancy", "prenatal", "labor", "birth", "maternal"],
};

const NEWSAPI_DOMAINS: Record<EducationTopic, string[]> = {
  All: ["cdc.gov", "nih.gov", "womenshealth.gov", "who.int", "acog.org", "plannedparenthood.org", "mayoclinic.org", "nhs.uk"],
  Puberty: ["nih.gov", "who.int", "healthychildren.org", "mayoclinic.org", "nhs.uk"],
  Contraception: ["cdc.gov", "womenshealth.gov", "who.int", "acog.org", "plannedparenthood.org", "nhs.uk"],
  "Reproductive Health": ["cdc.gov", "nih.gov", "womenshealth.gov", "who.int", "acog.org", "mayoclinic.org", "nhs.uk"],
  Consent: ["healthychildren.org", "womenshealth.gov", "who.int", "plannedparenthood.org", "nhs.uk"],
  Pregnancy: ["cdc.gov", "nih.gov", "womenshealth.gov", "who.int", "acog.org", "mayoclinic.org", "nhs.uk"],
};

const GNEWS_SITES: Record<EducationTopic, string[]> = {
  All: ["cdc.gov", "nih.gov", "womenshealth.gov", "who.int", "acog.org", "plannedparenthood.org", "mayoclinic.org", "nhs.uk"],
  Puberty: ["nih.gov", "healthychildren.org", "who.int", "mayoclinic.org", "nhs.uk"],
  Contraception: ["womenshealth.gov", "acog.org", "who.int", "cdc.gov", "plannedparenthood.org", "nhs.uk"],
  "Reproductive Health": ["womenshealth.gov", "nih.gov", "who.int", "cdc.gov", "acog.org", "mayoclinic.org", "nhs.uk"],
  Consent: ["womenshealth.gov", "healthychildren.org", "who.int", "plannedparenthood.org", "nhs.uk"],
  Pregnancy: ["cdc.gov", "womenshealth.gov", "nih.gov", "who.int", "acog.org", "mayoclinic.org", "nhs.uk"],
};

const MEDLINE_PAGE_SIZE = 8;
const NEWSAPI_PAGE_SIZE = 20;
const GNEWS_PAGE_SIZE = 20;

function randomImage(topic: EducationTopic, index = 0) {
  const pool = TOPIC_IMAGES[topic] ?? TOPIC_IMAGES.All;
  return pool[index % pool.length];
}

function normalizeUrl(url: string) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return url;
  }
}

function decodeXmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#160;/g, " ");
}

function stripMarkup(value: string) {
  return decodeXmlEntities(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactSummary(value: string) {
  const cleaned = stripMarkup(value);
  if (cleaned.length <= 220) return cleaned;
  return `${cleaned.slice(0, 217).trim()}...`;
}

function buildSearchTerms(topic: EducationTopic, query: string) {
  const trimmed = query.trim();
  if (trimmed) {
    return [trimmed];
  }

  return TOPIC_SEED_TERMS[topic];
}

function extractDocumentContents(xml: string, name: string) {
  const regex = new RegExp(`<content[^>]*name="${name}"[^>]*>([\\s\\S]*?)<\\/content>`, "gi");
  return Array.from(xml.matchAll(regex)).map((match) => stripMarkup(match[1] ?? "")).filter(Boolean);
}

function parseMedlinePlusDocuments(xml: string, topic: EducationTopic): EducationArticle[] {
  const documents = Array.from(xml.matchAll(/<document\b([^>]*)>([\s\S]*?)<\/document>/gi));

  return documents.map(([_, attrs, body], index) => {
    const url = attrs.match(/url="([^"]+)"/i)?.[1] ?? "#";
    const title = extractDocumentContents(body, "title")[0] ?? "Health topic";
    const description =
      compactSummary(extractDocumentContents(body, "snippet")[0] ?? extractDocumentContents(body, "FullSummary")[0] ?? "");
    const organization = extractDocumentContents(body, "organizationName")[0] ?? "National Library of Medicine";
    const tags = [
      ...extractDocumentContents(body, "groupName"),
      ...extractDocumentContents(body, "altTitle").slice(0, 3),
    ];

    return {
      id: `medlineplus-${index}-${url}`,
      title,
      description,
      url,
      sourceName: organization,
      sourceType: "official-api" as const,
      image: randomImage(topic, index),
      topic,
      tags,
      publishedAt: null,
    };
  });
}

function scoreArticle(article: EducationArticle, topic: EducationTopic, query: string) {
  const haystack = `${article.title} ${article.description} ${article.tags.join(" ")}`.toLowerCase();
  const queryTerms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);

  let score = 0;

  for (const term of queryTerms) {
    if (article.title.toLowerCase().includes(term)) score += 5;
    else if (haystack.includes(term)) score += 3;
  }

  if (topic !== "All") {
    for (const keyword of TOPIC_KEYWORDS[topic]) {
      if (haystack.includes(keyword.toLowerCase())) score += 2;
    }
  }

  return score;
}

async function fetchMedlinePlusArticlesByTerm(topic: EducationTopic, term: string, page: number): Promise<EducationArticle[]> {
  const url = new URL("https://wsearch.nlm.nih.gov/ws/query");
  url.searchParams.set("db", "healthTopics");
  url.searchParams.set("term", term);
  url.searchParams.set("retmax", String(MEDLINE_PAGE_SIZE));
  url.searchParams.set("retstart", String((page - 1) * MEDLINE_PAGE_SIZE));
  url.searchParams.set("rettype", "brief");
  url.searchParams.set("tool", "maaya");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/xml,text/xml",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`MedlinePlus request failed with ${response.status}`);
  }

  const xml = await response.text();
  return parseMedlinePlusDocuments(xml, topic);
}

async function fetchMedlinePlusArticles(topic: EducationTopic, query: string, page: number): Promise<ProviderResult> {
  const terms = buildSearchTerms(topic, query);
  const settled = await Promise.allSettled(terms.map((term) => fetchMedlinePlusArticlesByTerm(topic, term, page)));
  const merged = settled.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
  const seen = new Set<string>();
  const unique = merged.filter((article) => {
    if (seen.has(article.url)) return false;
    seen.add(article.url);
    return true;
  });

  return {
    articles: unique.sort((a, b) => scoreArticle(b, topic, query) - scoreArticle(a, topic, query)),
    hasMore: settled.some((result) => result.status === "fulfilled" && result.value.length === MEDLINE_PAGE_SIZE),
  };
}

async function fetchNewsApiArticles(topic: EducationTopic, query: string, page: number): Promise<ProviderResult> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return { articles: [], hasMore: false };

  const q = query.trim() || TOPIC_TERMS[topic];
  const url = new URL("https://newsapi.org/v2/everything");
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("q", q);
  url.searchParams.set("domains", NEWSAPI_DOMAINS[topic].join(","));
  url.searchParams.set("language", "en");
  url.searchParams.set("searchIn", "title,description");
  url.searchParams.set("sortBy", "relevancy");
  url.searchParams.set("pageSize", String(NEWSAPI_PAGE_SIZE));
  url.searchParams.set("page", String(page));

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) return { articles: [], hasMore: false };

  const data = (await response.json()) as {
    totalResults?: number;
    articles?: Array<{
      title?: string;
      description?: string;
      url?: string;
      urlToImage?: string;
      publishedAt?: string;
      source?: { name?: string };
    }>;
  };

  const articles = (data.articles ?? [])
    .filter((article) => article.title && article.description && article.url)
    .map((article, index) => ({
      id: `newsapi-${index}-${article.url}`,
      title: article.title ?? "Article",
      description: article.description ?? "",
      url: article.url ?? "#",
      sourceName: article.source?.name ?? "Official source",
      sourceType: "newsapi" as const,
      image: article.urlToImage || randomImage(topic, index),
      topic,
      tags: [],
      publishedAt: article.publishedAt ?? null,
    }));

  return {
    articles,
    hasMore: Number(data.totalResults ?? 0) > page * NEWSAPI_PAGE_SIZE,
  };
}

async function fetchGNewsArticles(topic: EducationTopic, query: string, page: number): Promise<ProviderResult> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) return { articles: [], hasMore: false };

  const q = query.trim() || TOPIC_TERMS[topic];
  const url = new URL("https://gnews.io/api/v4/search");
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("q", q);
  url.searchParams.set("lang", "en");
  url.searchParams.set("max", String(GNEWS_PAGE_SIZE));
  url.searchParams.set("in", "title,description,content");
  url.searchParams.set("site", GNEWS_SITES[topic].join(","));
  url.searchParams.set("sortby", "relevance");
  url.searchParams.set("page", String(page));

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) return { articles: [], hasMore: false };

  const data = (await response.json()) as {
    totalArticles?: number;
    articles?: Array<{
      title?: string;
      description?: string;
      url?: string;
      image?: string;
      publishedAt?: string;
      source?: { name?: string; url?: string };
    }>;
  };

  const articles = (data.articles ?? [])
    .filter((article) => article.title && article.description && article.url)
    .map((article, index) => ({
      id: `gnews-${index}-${article.url}`,
      title: article.title ?? "Article",
      description: article.description ?? "",
      url: article.url ?? "#",
      sourceName: article.source?.name ?? "Health source",
      sourceType: "gnews" as const,
      image: article.image || randomImage(topic, index),
      topic,
      tags: [],
      publishedAt: article.publishedAt ?? null,
    }));

  return {
    articles,
    hasMore: Number(data.totalArticles ?? 0) > page * GNEWS_PAGE_SIZE,
  };
}

export async function searchEducationArticles(topic: EducationTopic, query: string, page = 1) {
  const [medlinePlus, newsApi, gnews] = await Promise.allSettled([
    fetchMedlinePlusArticles(topic, query, page),
    fetchNewsApiArticles(topic, query, page),
    fetchGNewsArticles(topic, query, page),
  ]);

  const merged = [
    ...(medlinePlus.status === "fulfilled" ? medlinePlus.value.articles : []),
    ...(newsApi.status === "fulfilled" ? newsApi.value.articles : []),
    ...(gnews.status === "fulfilled" ? gnews.value.articles : []),
  ];

  const seen = new Set<string>();
  const articles = merged.filter((article) => {
    const normalizedUrl = normalizeUrl(article.url);
    if (seen.has(normalizedUrl)) return false;
    seen.add(normalizedUrl);
    return true;
  }).sort((a, b) => scoreArticle(b, topic, query) - scoreArticle(a, topic, query));

  const hasMore =
    (medlinePlus.status === "fulfilled" && medlinePlus.value.hasMore) ||
    (newsApi.status === "fulfilled" && newsApi.value.hasMore) ||
    (gnews.status === "fulfilled" && gnews.value.hasMore);

  return { articles, hasMore };
}
