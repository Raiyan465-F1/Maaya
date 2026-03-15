"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ─── Section label + heading pattern per design ────────────── */
function SectionHeader({
  label,
  title,
  titleItalic,
  subtitle,
}: {
  label: string;
  title: string;
  titleItalic: string;
  subtitle: string;
}) {
  return (
    <div className="mb-8">
      <p className="font-mono text-xs tracking-widest text-primary uppercase mb-3">
        {label}
      </p>
      <h1 className="font-heading text-3xl font-bold text-foreground tracking-tight leading-snug mb-2">
        {title}{" "}
        <span className="italic bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {titleItalic}
        </span>
      </h1>
      <p className="text-muted-foreground text-sm leading-relaxed">{subtitle}</p>
    </div>
  );
}

export default function ProfilePage() {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [ageGroup, setAgeGroup] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");

  return (
    <>
      <SectionHeader
        label="Profile"
        title="Your"
        titleItalic="account"
        subtitle="Customize your profile and privacy preferences. Only you see this information."
      />

      <div className="space-y-8">
        {/* Account info — read-only feel */}
        <section className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-heading text-lg font-semibold text-foreground tracking-tight mb-4">
            Account
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <div className="h-11 px-3.5 rounded-xl border border-input bg-muted/50 text-muted-foreground flex items-center text-sm">
                (Your email will appear here)
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Role
              </label>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                User
              </span>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-heading text-lg font-semibold text-foreground tracking-tight mb-4">
            Privacy
          </h2>
          <div className="flex items-start gap-4">
            <button
              type="button"
              role="switch"
              aria-checked={isAnonymous}
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={cn(
                "relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                isAnonymous ? "bg-primary border-primary/30" : "bg-input border-border"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 rounded-full bg-card shadow ring-0 transition-transform",
                  isAnonymous ? "translate-x-5" : "translate-x-0.5"
                )}
                style={{ marginTop: 2 }}
              />
            </button>
            <div>
              <p className="text-sm font-medium text-foreground">Anonymous posting</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                When enabled, your forum posts and some activity can appear as anonymous.
              </p>
            </div>
          </div>
        </section>

        {/* Optional profile fields */}
        <section className="bg-card rounded-2xl border border-primary/15 shadow-sm p-6">
          <h2 className="font-heading text-lg font-semibold text-foreground tracking-tight mb-1">
            Optional details
          </h2>
          <p className="text-xs text-muted-foreground mb-5">
            Help us personalize your experience. All fields are optional.
          </p>
          <div className="space-y-5">
            <div>
              <label htmlFor="profile-age" className="block text-sm font-medium text-foreground mb-1.5">
                Age group
              </label>
              <input
                id="profile-age"
                type="text"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                placeholder="e.g. 25–34"
                className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="profile-gender" className="block text-sm font-medium text-foreground mb-1.5">
                Gender
              </label>
              <input
                id="profile-gender"
                type="text"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                placeholder="Optional"
                className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="profile-location" className="block text-sm font-medium text-foreground mb-1.5">
                Location
              </label>
              <input
                id="profile-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Country or region (optional)"
                className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary/50 transition-colors"
              />
            </div>
            <Button
              type="button"
              disabled
              className="w-full sm:w-auto h-11 px-6 text-base font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl hover:opacity-90 transition-opacity shadow-sm disabled:opacity-70"
            >
              Save changes
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
