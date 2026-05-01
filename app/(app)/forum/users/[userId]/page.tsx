import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/src/db";
import { forumPosts } from "@/src/schema/forum";
import { users } from "@/src/schema/users";
import { ArrowLeft, MessageSquare, User } from "lucide-react";

export default async function ForumUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    notFound();
  }

  const posts = await db
    .select({
      id: forumPosts.id,
      title: forumPosts.title,
      content: forumPosts.content,
      tags: forumPosts.tags,
      isAnonymous: forumPosts.isAnonymous,
      createdAt: forumPosts.createdAt,
    })
    .from(forumPosts)
    .where(and(eq(forumPosts.authorId, userId), eq(forumPosts.isAnonymous, false)))
    .orderBy(desc(forumPosts.createdAt));

  const initials = user.email.slice(0, 2).toUpperCase();

  return (
    <section className="mx-auto max-w-[84rem] space-y-10 px-4 py-12 pb-32 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-[3rem] border border-violet-200/60 bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,0.15),_transparent_50%),linear-gradient(145deg,rgba(245,243,255,0.95),rgba(255,255,255,1))] dark:border-violet-900/30 dark:bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,0.15),_transparent_50%),linear-gradient(145deg,rgba(15,10,20,0.95),rgba(0,0,0,1))] shadow-2xl shadow-violet-900/5 p-8 sm:p-12">
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-violet-400/20 blur-[100px]" />
        
        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[2rem] bg-violet-600 font-heading text-3xl font-bold text-white shadow-lg shadow-violet-600/20">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs font-bold tracking-[0.22em] text-violet-600 dark:text-violet-400 uppercase">Forum Contributor</p>
            <h1 className="mt-3 truncate font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">{user.email}</h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-muted-foreground/80">
              Sharing experiences and building community knowledge through thoughtful discussions.
            </p>
            
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 rounded-2xl bg-white/80 backdrop-blur-sm border border-violet-100 px-5 py-3 text-sm font-bold text-violet-700 shadow-sm">
                <MessageSquare className="size-4" />
                {posts.length} {posts.length === 1 ? "Discussion" : "Discussions"}
              </div>
              <Link
                href="/forum"
                className="flex items-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/25 transition-all hover:bg-violet-700 hover:-translate-y-0.5"
              >
                <ArrowLeft className="size-4" />
                Back to forum
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <h2 className="font-heading text-2xl font-bold text-foreground">Recent Activity</h2>
          <div className="h-px flex-1 bg-violet-100/60 dark:bg-violet-900/20" />
        </div>

        {posts.length ? (
          <div className="grid gap-8">
            {posts.map((post) => (
              <article key={post.id} className="group relative overflow-hidden rounded-[2.5rem] border border-border/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] hover:border-violet-200">
                <div className="h-1.5 w-full bg-gradient-to-r from-violet-400 to-indigo-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="p-8">
                  <div className="flex flex-wrap items-center gap-3">
                    {(post.tags ?? []).slice(0, 5).map((tag) => (
                      <span key={tag} className="rounded-full bg-violet-50 px-3.5 py-1.5 text-xs font-bold text-violet-600 border border-violet-100/50">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="mt-5 font-heading text-2xl font-bold text-foreground leading-snug group-hover:text-violet-700 transition-colors">{post.title}</h3>
                  <p className="mt-4 line-clamp-3 whitespace-pre-wrap break-words text-base font-medium leading-relaxed text-muted-foreground/90">
                    {post.content}
                  </p>
                  <div className="mt-8 flex items-center justify-between border-t border-violet-50 pt-6">
                    <p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-wider">
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <Link href={`/forum?post=${post.id}`} className="text-sm font-bold text-violet-600 hover:underline">
                      View discussion →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-violet-100 bg-violet-50/20 px-8 py-24 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm text-violet-200 mb-6">
               <MessageSquare className="size-10" />
            </div>
            <p className="font-heading text-3xl font-extrabold text-foreground">No public activity</p>
            <p className="mt-3 max-w-md text-base font-medium text-muted-foreground/80">
              This user hasn't started any public discussions yet.
            </p>
            <Link href="/forum" className="mt-8 font-bold text-violet-600 hover:underline">
               Explore the forum
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

