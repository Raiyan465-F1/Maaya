export default function ForumPage() {
  return (
    <>
      <p className="font-mono text-xs tracking-widest text-primary uppercase mb-3">
        Forum
      </p>
      <h1 className="font-heading text-3xl font-bold text-foreground tracking-tight mb-2">
        Community{" "}
        <span className="italic bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          forum
        </span>
      </h1>
      <p className="text-muted-foreground text-sm leading-relaxed mb-8">
        Discussions, upvotes, and tags will appear here.
      </p>
      <div className="bg-card rounded-2xl border border-border p-8 text-center text-muted-foreground text-sm">
        Coming soon.
      </div>
    </>
  );
}
