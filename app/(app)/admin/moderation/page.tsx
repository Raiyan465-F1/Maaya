"use client";

import { useSession } from "next-auth/react";

export default function ModerationPage() {
  const { data: session } = useSession();

  if (session?.user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="mb-2 font-heading text-xl font-semibold text-foreground">Access denied</p>
        <p className="text-sm text-muted-foreground">Only admins can access moderation tools.</p>
      </div>
    );
  }

  return (
    <>
      <p className="font-mono text-xs tracking-widest text-accent uppercase">Admin</p>
      <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground">
        Content{" "}
        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text italic text-transparent">
          moderation
        </span>
      </h1>
      <p className="mt-1 mb-8 text-sm leading-relaxed text-muted-foreground">
        Review reported content, manage user accounts, and maintain platform safety.
      </p>
      <div className="rounded-2xl border border-dashed border-accent/20 bg-card p-8 text-center text-sm text-muted-foreground">
        Moderation tools are coming soon. Reported posts, comments, and user management will appear
        here.
      </div>
    </>
  );
}
