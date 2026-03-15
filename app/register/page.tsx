"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const MIN_PASSWORD_LENGTH = 8;

/* ─── Left brand panel ────────────────────────────────────── */
function BrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-secondary/8 via-background to-primary/8 border-r border-primary/10 px-14 py-12 relative overflow-hidden">
      {/* Decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-secondary/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-primary/15 blur-3xl" />

      {/* Top: Logo */}
      <div className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 mb-16">
          <span className="font-heading text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">
            MAAYA
          </span>
        </Link>

        {/* Large italic quote — different from login */}
        <blockquote className="font-heading text-[2.6rem] font-normal italic text-foreground leading-[1.15] tracking-tight mb-8">
          Breaking the silence<br />
          <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            around women&apos;s
          </span>
          <br />health.
        </blockquote>

        <p className="text-muted-foreground text-base leading-relaxed mb-12 max-w-xs">
          Join thousands of women accessing reproductive health education, community, and
          expert guidance — all in one safe space.
        </p>

        <div className="flex flex-col gap-3.5">
          {[
            "Always free — no premium tiers",
            "Anonymous by default in the forum",
            "Admin-verified doctors only",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-secondary/12 flex items-center justify-center flex-shrink-0">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l2.5 2.5L9 1" stroke="var(--color-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-sm text-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: Mono stats */}
      <div className="relative z-10 flex gap-10">
        <div>
          <p className="font-mono text-2xl font-medium text-secondary tabular-nums">Open</p>
          <p className="text-xs text-muted-foreground mt-0.5">Community forum</p>
        </div>
        <div>
          <p className="font-mono text-2xl font-medium text-primary tabular-nums">22+</p>
          <p className="text-xs text-muted-foreground mt-0.5">Core features</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Register page ───────────────────────────────────────── */
export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!passwordValid || !passwordsMatch) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError((data.error as string) || "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      router.push("/login?registered=1");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  const passwordValid = password.length >= MIN_PASSWORD_LENGTH;
  const passwordsMatch =
    password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <BrandPanel />

      {/* Right: form */}
      <div className="relative flex flex-col min-h-screen overflow-hidden">
        {/* Mobile-only top bar */}
        <div className="lg:hidden flex items-center justify-between px-6 h-16 border-b border-primary/15 bg-card/80 backdrop-blur-md">
          <Link href="/" className="font-heading text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">
            MAAYA
          </Link>
          <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            Log in
          </Link>
        </div>

        {/* Subtle blob — form side */}
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 w-72 h-72 rounded-full bg-secondary/10 blur-3xl" />

        <div className="flex flex-1 items-center justify-center px-8 py-16 relative z-10">
          <div className="w-full max-w-sm">

            {/* Form header */}
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20 mb-4">
                Join MAAYA
              </span>
              <h1 className="font-heading text-3xl font-bold text-foreground tracking-tight leading-snug">
                Create your{" "}
                <span className="italic bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                  account
                </span>
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Only general users register here. Doctors are onboarded by admin.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-foreground mb-1.5">
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary/50 transition-colors"
                  required
                />
              </div>

              <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-foreground mb-1.5">
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary/50 transition-colors"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                />
                <p
                  className={`mt-1.5 text-xs ${
                    password.length > 0 && !passwordValid
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  At least {MIN_PASSWORD_LENGTH} characters
                </p>
              </div>

              <div>
                <label htmlFor="register-confirm" className="block text-sm font-medium text-foreground mb-1.5">
                  Confirm password
                </label>
                <input
                  id="register-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary/50 transition-colors"
                  required
                />
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="mt-1.5 text-xs text-destructive">
                    Passwords do not match
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || !passwordValid || !passwordsMatch}
                className="w-full h-11 text-base font-semibold bg-gradient-to-r from-secondary to-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity shadow-sm disabled:opacity-70"
              >
                {isLoading ? "Creating account…" : "Register"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
