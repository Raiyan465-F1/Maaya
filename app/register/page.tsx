"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const MIN_PASSWORD_LENGTH = 8;

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
            href="/login"
            className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-200"
          >
            Log in
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─── Register form (no API integration yet) ───────────────── */
export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // API integration in a later session
    console.log("Register submitted", { email, password });
  }

  const passwordValid = password.length >= MIN_PASSWORD_LENGTH;
  const passwordsMatch =
    password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

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
                Join MAAYA
              </span>
              <h1 className="text-2xl font-bold text-foreground">
                Create your{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  account
                </span>
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Only general users register here. Doctors are onboarded by admin.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="register-email"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Email
                </label>
                <input
                  id="register-email"
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
                  htmlFor="register-password"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:border-primary/50 transition-colors"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                />
                <p
                  className={`mt-1 text-xs ${
                    password.length > 0 && !passwordValid
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  At least {MIN_PASSWORD_LENGTH} characters
                </p>
              </div>
              <div>
                <label
                  htmlFor="register-confirm"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Confirm password
                </label>
                <input
                  id="register-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:border-primary/50 transition-colors"
                  required
                />
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="mt-1 text-xs text-destructive">
                    Passwords do not match
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl hover:opacity-90 transition-opacity shadow-sm"
              >
                Register
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
