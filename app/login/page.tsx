"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/* ─── Auth nav (minimal, matches landing) ──────────────────── */
function AuthNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-primary/15 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            MAAYA
          </span>
          <span className="hidden sm:inline text-xs text-muted-foreground font-medium tracking-wide">
            Smart Women&apos;s Health
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-200"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─── Login form (no API integration yet) ───────────────────── */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // API integration in a later session
    console.log("Login submitted", { email, password });
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />

      <main className="relative min-h-screen flex items-center justify-center px-6 pt-16 overflow-hidden">
        {/* Decorative blobs (same as landing) */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full bg-secondary/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/10 blur-3xl"
        />

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-card/95 backdrop-blur-sm rounded-3xl border border-primary/15 shadow-xl p-8">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-primary/10 text-primary border border-primary/20 mb-4">
                Welcome back
              </span>
              <h1 className="text-2xl font-bold text-foreground">
                Log in to{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  MAAYA
                </span>
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Your health, your story, your space.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:border-primary/50 transition-colors"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:border-primary/50 transition-colors"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl hover:opacity-90 transition-opacity shadow-sm"
              >
                Log in
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-primary hover:underline"
              >
                Register
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            User type is determined by the platform — just sign in with your
            email and password.
          </p>
        </div>
      </main>
    </div>
  );
}
