export default function CycleTrackingPage() {
  return (
    <>
      <p className="font-mono text-xs tracking-widest text-primary uppercase mb-3">
        Cycle Tracking
      </p>
      <h1 className="font-heading text-3xl font-bold text-foreground tracking-tight mb-2">
        Your{" "}
        <span className="italic bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          cycle
        </span>
      </h1>
      <p className="text-muted-foreground text-sm leading-relaxed mb-8">
        Calendar, analysis, and insights will appear here.
      </p>
      <div className="bg-card rounded-2xl border border-border p-8 text-center text-muted-foreground text-sm">
        Coming soon.
      </div>
    </>
  );
}
