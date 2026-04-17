import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/news";
import { ArrowLeft, Calendar, User } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found" };
  return { title: `${article.title} | Maaya` };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="mx-auto w-full max-w-4xl space-y-8 p-4 py-8 md:p-8">
      {/* Back navigation */}
      <Link 
        href="/sti-awareness" 
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to Magazine Hub
      </Link>

      {/* Hero Image Section */}
      <div className="relative aspect-video w-full overflow-hidden rounded-3xl border bg-muted shadow-sm sm:aspect-[21/9]">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-4 text-white md:bottom-10 md:left-10 md:right-10">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl text-shadow-sm">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/90 sm:text-base">
            <div className="flex items-center gap-1.5">
              <User className="size-4" />
              <span>{article.source.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              <span>{new Date(article.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto mt-12 w-full max-w-3xl">
        <p className="mb-8 text-xl font-medium leading-relaxed text-foreground/80">
          {article.description}
        </p>
        
        {/* Custom prose styles without requiring typography plugin */}
        <div 
          className="space-y-6 text-lg leading-relaxed text-muted-foreground [&>p]:mb-6 [&>h3]:mt-10 [&>h3]:mb-4 [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-foreground [&>h3]:tracking-tight [&_i]:text-foreground/80"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
    </article>
  );
}
