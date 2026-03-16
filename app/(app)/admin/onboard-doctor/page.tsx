"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function generatePassword(length = 16): string {
  const charset = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => charset[byte % charset.length]).join("");
}

export default function OnboardDoctorPage() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [password, setPassword] = useState(() => generatePassword());
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (session?.user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="mb-2 font-heading text-xl font-semibold text-foreground">Access denied</p>
        <p className="text-sm text-muted-foreground">Only admins can onboard doctors.</p>
      </div>
    );
  }

  function handleRegenerate() {
    setPassword(generatePassword());
    setCopied(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/onboard-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim().toLowerCase(),
          password,
          specialty: specialty.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({ type: "error", text: data.error || "Something went wrong." });
      } else {
        setResult({
          type: "success",
          text: `Doctor account created for ${data.email}. Share the credentials securely.`,
        });
        setName("");
        setEmail("");
        setSpecialty("");
        setPassword(generatePassword());
      }
    } catch {
      setResult({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <p className="font-mono text-xs tracking-widest text-accent uppercase">Admin</p>
      <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground">
        Onboard a{" "}
        <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text italic text-transparent">
          doctor
        </span>
      </h1>
      <p className="mt-1 mb-8 text-sm leading-relaxed text-muted-foreground">
        Create a verified doctor account with a one-time password. Share the credentials with the
        doctor securely — they can change their password after first login.
      </p>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-accent/15 bg-card p-6 shadow-sm"
        >
          <div className="flex flex-col gap-5">
            <div>
              <label htmlFor="doc-name" className="mb-1.5 block text-sm font-medium text-foreground">
                Doctor name <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <input
                id="doc-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Jane Smith"
                className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>

            <div>
              <label htmlFor="doc-email" className="mb-1.5 block text-sm font-medium text-foreground">
                Email <span className="text-destructive">*</span>
              </label>
              <input
                id="doc-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@example.com"
                className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>

            <div>
              <label
                htmlFor="doc-specialty"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Specialty <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <input
                id="doc-specialty"
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="e.g. Gynecology"
                className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>

            {/* Password with generate */}
            <div>
              <label
                htmlFor="doc-password"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                One-time password <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="doc-password"
                  type="text"
                  required
                  readOnly
                  value={password}
                  className="h-11 flex-1 rounded-xl border border-input bg-muted px-3.5 font-mono text-sm text-foreground"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 shrink-0 rounded-xl px-4 text-sm"
                  onClick={handleRegenerate}
                >
                  Generate
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-11 shrink-0 rounded-xl px-4 text-sm",
                    copied && "border-emerald-500/30 text-emerald-600",
                  )}
                  onClick={handleCopy}
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                The doctor should change this after their first login.
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={submitting || !email.trim()}
                className="h-11 w-full rounded-xl bg-gradient-to-r from-primary to-accent px-8 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto"
              >
                {submitting ? "Creating account…" : "Create doctor account"}
              </Button>
            </div>

            {result && (
              <div
                className={cn(
                  "rounded-xl border px-4 py-3 text-sm",
                  result.type === "success"
                    ? "border-emerald-500/20 bg-emerald-50 text-emerald-700"
                    : "border-destructive/20 bg-destructive/5 text-destructive",
                )}
              >
                {result.text}
              </div>
            )}
          </div>
        </form>

        {/* Info panel */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-accent/15 bg-gradient-to-br from-accent/5 via-primary/5 to-card p-6">
            <p className="font-mono text-[10px] tracking-widest text-accent uppercase">How it works</p>
            <h3 className="mt-2 font-heading text-base font-semibold text-foreground">
              Doctor onboarding flow
            </h3>
            <ol className="mt-4 flex flex-col gap-3">
              {[
                "Fill in the doctor's email and generate a password.",
                "Share the credentials with the doctor privately.",
                "The doctor logs in and completes their profile.",
                "They can now answer questions in Doctor's Help.",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/10 font-mono text-xs font-medium text-accent">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-foreground">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-primary/10 bg-card p-5">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Only admins can create doctor accounts. Doctors registered this way are automatically
              verified and marked as active. They will appear in the Doctor Directory and can answer
              patient questions immediately.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
