"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

function BrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary/8 via-background to-secondary/8 border-r border-primary/10 px-14 py-12 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-secondary/15 blur-3xl" />

      <div className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 mb-16">
          <span className="font-heading text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">
            MAAYA
          </span>
        </Link>

        <blockquote className="font-heading text-[2.6rem] font-normal italic text-foreground leading-[1.15] tracking-tight mb-8">
          Your health,<br />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            your story,
          </span>
          <br />your space.
        </blockquote>

        <p className="text-muted-foreground text-base leading-relaxed mb-12 max-w-xs">
          A safe, supportive platform for reproductive health education, cycle tracking,
          and community support.
        </p>

        <div className="flex flex-col gap-3.5">
          {[
            "100% anonymous posting option",
            "Verified doctor Q&A",
            "Private cycle and symptom tracking",
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
          <p className="font-mono text-2xl font-medium text-primary tabular-nums">100%</p>
          <p className="text-xs text-muted-foreground mt-0.5">Free to join</p>
        </div>
        <div>
          <p className="font-mono text-2xl font-medium text-secondary tabular-nums">Safe</p>
          <p className="text-xs text-muted-foreground mt-0.5">Private and secure</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const justRegistered = searchParams.get("registered") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    if (result?.ok) {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <BrandPanel />

      <div className="relative flex flex-col min-h-screen overflow-hidden">
        <div className="lg:hidden flex items-center justify-between px-6 h-16 border-b border-primary/15 bg-card/80 backdrop-blur-md">
          <Link href="/" className="font-heading text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">
            MAAYA
          </Link>
          <Link href="/register" className="text-sm font-medium text-primary hover:underline">
            Register
          </Link>
        </div>

        <div aria-hidden className="pointer-events-none absolute top-0 right-0 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />

        <div className="flex flex-1 items-center justify-center px-8 py-16 relative z-10">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 mb-4">
                Welcome back
              </span>
              <h1 className="font-heading text-3xl font-bold text-foreground tracking-tight leading-snug">
                Log in to <span className="italic bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">MAAYA</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Your health journey continues here.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {justRegistered && (
                <div className="rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-2.5 text-sm text-primary">
                  Account created. Please log in.
                </div>
              )}
              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-foreground mb-1.5">
                  Email
                </label>
                <input
                  id="login-email"
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
                <label htmlFor="login-password" className="block text-sm font-medium text-foreground mb-1.5">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="........"
                  className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary/50 transition-colors"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl hover:opacity-90 transition-opacity shadow-sm disabled:opacity-70"
              >
                {isLoading ? "Signing in..." : "Log in"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account? <Link href="/register" className="font-medium text-primary hover:underline">Register</Link>
            </p>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Are you a doctor? <Link href="/register/doctor" className="font-medium text-primary hover:underline">Create a doctor account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
