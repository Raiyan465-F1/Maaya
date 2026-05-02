"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const MIN_PASSWORD_LENGTH = 8;

function DoctorBrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary/8 via-background to-accent/10 border-r border-primary/10 px-14 py-12 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 rounded-full bg-primary/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-accent/15 blur-3xl" />

      <div className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 mb-16">
          <span className="font-heading text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">
            MAAYA
          </span>
        </Link>

        <blockquote className="font-heading text-[2.6rem] font-normal italic text-foreground leading-[1.15] tracking-tight mb-8">
          Bring your expertise<br />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            to women&apos;s health
          </span>
          <br />support.
        </blockquote>

        <p className="text-muted-foreground text-base leading-relaxed mb-12 max-w-xs">
          Create a doctor account so you can review individual posts, answer users directly, and clear pending replies from the dashboard.
        </p>

        <div className="flex flex-col gap-3.5">
          {[
            "Read individual user posts",
            "Reply from the doctor dashboard",
            "Use a protected doctor access code",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-primary/12 flex items-center justify-center flex-shrink-0">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l2.5 2.5L9 1" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-sm text-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex gap-10">
        <div>
          <p className="font-mono text-2xl font-medium text-primary tabular-nums">Doctor</p>
          <p className="text-xs text-muted-foreground mt-0.5">Account view</p>
        </div>
        <div>
          <p className="font-mono text-2xl font-medium text-accent tabular-nums">Live</p>
          <p className="text-xs text-muted-foreground mt-0.5">Reply workflow</p>
        </div>
      </div>
    </div>
  );
}

export default function DoctorRegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [doctorAccessCode, setDoctorAccessCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "redirecting">("idle");
  const isBusy = submitState !== "idle";

  const passwordValid = password.length >= MIN_PASSWORD_LENGTH;
  const passwordsMatch =
    password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!passwordValid || !passwordsMatch) return;
    setSubmitState("submitting");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          role: "doctor",
          doctorAccessCode,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError((data.error as string) || "Doctor registration failed. Please try again.");
        setSubmitState("idle");
        return;
      }

      setSubmitState("redirecting");
      router.replace("/login?registered=1");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitState("idle");
    }
  }

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <DoctorBrandPanel />

      <div className="relative flex flex-col min-h-screen overflow-hidden">
        <div className="lg:hidden flex items-center justify-between px-6 h-16 border-b border-primary/15 bg-card/80 backdrop-blur-md">
          <Link href="/" className="font-heading text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">
            MAAYA
          </Link>
          <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            Log in
          </Link>
        </div>

        <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />

        <div className="flex flex-1 items-center justify-center px-8 py-16 relative z-10">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 mb-4">
                Doctor access
              </span>
              <h1 className="font-heading text-3xl font-bold text-foreground tracking-tight leading-snug">
                Create your <span className="italic bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">doctor account</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Use the shared doctor registration code to unlock the doctor dashboard in practice.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="doctor-email" className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <input
                  id="doctor-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@example.com"
                  disabled={isBusy}
                  className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary/50 transition-colors"
                  required
                />
              </div>

              <div>
                <label htmlFor="doctor-code" className="block text-sm font-medium text-foreground mb-1.5">Doctor access code</label>
                <input
                  id="doctor-code"
                  type="password"
                  autoComplete="off"
                  value={doctorAccessCode}
                  onChange={(e) => setDoctorAccessCode(e.target.value)}
                  placeholder="Enter the shared registration code"
                  disabled={isBusy}
                  className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary/50 transition-colors"
                  required
                />
              </div>

              <div>
                <label htmlFor="doctor-password" className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <input
                  id="doctor-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="........"
                  disabled={isBusy}
                  className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary/50 transition-colors"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                />
                <p className={`mt-1.5 text-xs ${password.length > 0 && !passwordValid ? "text-destructive" : "text-muted-foreground"}`}>
                  At least {MIN_PASSWORD_LENGTH} characters
                </p>
              </div>

              <div>
                <label htmlFor="doctor-confirm" className="block text-sm font-medium text-foreground mb-1.5">Confirm password</label>
                <input
                  id="doctor-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="........"
                  disabled={isBusy}
                  className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary/50 transition-colors"
                  required
                />
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="mt-1.5 text-xs text-destructive">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isBusy || !passwordValid || !passwordsMatch || doctorAccessCode.trim().length === 0}
                className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl hover:opacity-90 transition-opacity shadow-sm disabled:opacity-70"
              >
                {isBusy ? (
                  <span className="inline-flex items-center gap-2">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    {submitState === "redirecting" ? "Opening login..." : "Creating doctor account..."}
                  </span>
                ) : (
                  "Create doctor account"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Need a regular account instead? <Link href="/register" className="font-medium text-primary hover:underline">Register as a user</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
