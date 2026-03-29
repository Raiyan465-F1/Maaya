import Image from "next/image";
import Link from "next/link";
import { fetchNewsArticles, type Article } from "@/lib/news";
import { Newspaper, ArrowUpRight, ShieldCheck, Activity, BookOpen } from "lucide-react";

export const metadata = {
  title: "STI Awareness Hub | Maaya",
  description: "Magazine-style hub for the latest updates, research, and preventive measures regarding Sexually Transmitted Infections.",
};

export default async function STIAwarenessPage() {
  const articles = await fetchNewsArticles();

  if (!articles || articles.length === 0) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <Newspaper className="size-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">No Articles Found</h2>
        <p className="text-muted-foreground text-sm">Please check your API key or network connection.</p>
      </div>
    );
  }

  // Define the featured article as the first one
  const featuredArticle = articles[0];
  const regularArticles = articles.slice(1);

  return (
    <div className="mx-auto max-w-7xl flex-1 space-y-8 p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-6 text-primary" />
          <h1 className="text-3xl font-heading font-extrabold tracking-tight md:text-5xl">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">STI</span> Awareness Hub
          </h1>
        </div>
        <p className="max-w-3xl text-lg text-muted-foreground">
          Stay informed with the latest global research, prevention strategies, and medical breakthroughs in sexual health.
        </p>
      </div>

      {/* Decorative Categories / Badges row */}
      <div className="flex flex-wrap items-center gap-3 py-2">
        <Badge icon={<Activity className="size-4" />} title="New Research" />
        <Badge icon={<ShieldCheck className="size-4" />} title="Prevention" />
        <Badge icon={<BookOpen className="size-4" />} title="Education" />
        <Badge icon={<Newspaper className="size-4" />} title="Global Trends" />
      </div>

      <hr className="border-border" />

      {/* Magazine Layout */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Featured Large Article */}
        <div className="md:col-span-2 lg:col-span-2 flex flex-col group overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
          <Link href={featuredArticle.url} className="flex flex-col h-full">
            <div className="relative aspect-video w-full overflow-hidden sm:aspect-[21/9]">
              <Image
                src={featuredArticle.image}
                alt={featuredArticle.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized // Since URLs can be external (Unsplash/GNews) and not whitelisted
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 text-white">
                <span className="inline-flex w-fit items-center rounded-full bg-primary/90 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm">
                  Featured
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
                  <div className="size-6 rounded-full bg-secondary text-[10px] flex items-center justify-center font-bold text-white">
                    {featuredArticle.source.name[0]}
                  </div>
                  {featuredArticle.source.name}
                </div>
                <span>{new Date(featuredArticle.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Link>
        </div>

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
    </div>
  );
}

// Simple Badge component
function Badge({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex cursor-pointer items-center gap-1.5 rounded-full border bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary hover:bg-secondary/20 transition-colors">
      {icon}
      {title}
    </div>
  );
}
