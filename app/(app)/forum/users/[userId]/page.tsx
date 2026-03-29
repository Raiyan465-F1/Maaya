import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/src/db";
import { forumPosts } from "@/src/schema/forum";
import { users } from "@/src/schema/users";

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

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-primary/15 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm">
        <p className="font-mono text-xs tracking-[0.22em] text-primary uppercase">Forum profile</p>
        <h1 className="mt-3 font-heading text-4xl font-semibold leading-tight text-foreground">{user.email}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Forum discussions posted by this user.
        </p>
        <div className="mt-5 flex items-center gap-3 text-sm">
          <span className="rounded-full border border-primary/15 bg-white/70 px-4 py-2 font-mono text-foreground">
            {posts.length} discussion{posts.length === 1 ? "" : "s"}
          </span>
          <Link
            href="/forum"
            className="rounded-full border border-primary/15 px-4 py-2 font-medium text-muted-foreground transition hover:text-foreground"
          >
            Back to forum
          </Link>
        </div>
      </div>

      {posts.length ? (
        <div className="space-y-5">
          {posts.map((post) => (
            <article key={post.id} className="rounded-[2rem] border border-primary/15 bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                {post.isAnonymous ? (
                  <span className="rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-primary">
                    Posted anonymously
                  </span>
                ) : null}
                {(post.tags ?? []).slice(0, 5).map((tag) => (
                  <span key={tag} className="rounded-full bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
                    #{tag}
                  </span>
                ))}
              </div>
              <h2 className="mt-4 font-heading text-2xl font-semibold text-foreground">{post.title}</h2>
              <p className="mt-3 whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm leading-7 text-foreground/85">
                {post.content}
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-primary/20 bg-card/60 px-6 py-16 text-center shadow-sm">
          <p className="font-heading text-3xl text-foreground">No discussions yet</p>
          <p className="mt-3 text-sm text-muted-foreground">This user has no public forum discussions yet.</p>
        </div>
      )}
    </section>
  );
}
