export default function DoctorsHelpPage() {
  return (
    <>
      <p className="font-mono text-xs tracking-widest text-secondary uppercase mb-3">
        Doctor&apos;s Help
      </p>
      <h1 className="font-heading text-3xl font-bold text-foreground tracking-tight mb-2">
        Ask{" "}
        <span className="italic bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
          verified doctors
        </span>
      </h1>
      <p className="text-muted-foreground text-sm leading-relaxed mb-8">
        Q&A and doctor directory will appear here.
      </p>
      <div className="bg-card rounded-2xl border border-border p-8 text-center text-muted-foreground text-sm">
        Coming soon.
      </div>
    </>
  );
}
