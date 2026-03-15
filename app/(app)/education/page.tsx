export default function EducationPage() {
  return (
    <>
      <p className="font-mono text-xs tracking-widest text-primary uppercase mb-3">
        Educational Hub
      </p>
      <h1 className="font-heading text-3xl font-bold text-foreground tracking-tight mb-2">
        Learn{" "}
        <span className="italic bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          & explore
        </span>
      </h1>
      <p className="text-muted-foreground text-sm leading-relaxed mb-8">
        Articles, categories, and quizzes will appear here.
      </p>
      <div className="bg-card rounded-2xl border border-border p-8 text-center text-muted-foreground text-sm">
        Coming soon.
      </div>
    </>
  );
}
