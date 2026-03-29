import { fetchNewsArticles } from "@/lib/news";
import { Newspaper, ShieldCheck } from "lucide-react";
import { STIDashboard } from "@/components/sti-dashboard";

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

      <STIDashboard articles={articles} />
    </div>
  );
}
