"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ─── Mock data — will be replaced with API fetch later ─────── */
const MOCK_USER = {
  email: "user@example.com",
  role: "user" as const,
  accountStatus: "active" as const,
  isAnonymous: false,
  likedTags: ["menstrual-health", "wellness"],
  ageGroup: "",
  gender: "",
  location: "",
  createdAt: new Date().toISOString(),
};

/* ─── Avatar from initials ───────────────────────────────────── */
function ProfileAvatar({ email, size = "lg" }: { email: string; size?: "sm" | "lg" }) {
  const initial = email ? email[0].toUpperCase() : "?";
  const sizeClasses = size === "lg"
    ? "w-24 h-24 text-3xl"
    : "w-10 h-10 text-sm";

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-heading font-bold shadow-lg ring-4 ring-card",
        sizeClasses
      )}
    >
      {initial}
    </div>
  );
}

/* ─── Status badge ───────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    banned: "bg-destructive/10 text-destructive border-destructive/20",
    suspended: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
      styles[status] ?? styles.pending
    )}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        status === "active" ? "bg-emerald-500" : status === "pending" ? "bg-amber-500" : "bg-destructive"
      )} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/* ─── Info row used in the details grid ──────────────────────── */
function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={cn(
        "text-sm text-foreground",
        mono && "font-mono tabular-nums"
      )}>
        {value || "—"}
      </p>
    </div>
  );
}

/* ─── Profile page ───────────────────────────────────────────── */
export default function ProfilePage() {
  const [isAnonymous, setIsAnonymous] = useState(MOCK_USER.isAnonymous);
  const [ageGroup, setAgeGroup] = useState(MOCK_USER.ageGroup);
  const [gender, setGender] = useState(MOCK_USER.gender);
  const [location, setLocation] = useState(MOCK_USER.location);

  const memberSince = new Date(MOCK_USER.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      {/* ── Hero banner with avatar ─────────────────────────── */}
      <div className="relative mb-10">
        {/* Gradient banner */}
        <div className="h-40 sm:h-48 rounded-3xl bg-gradient-to-br from-primary/15 via-accent/10 to-secondary/15 border border-primary/10 overflow-hidden relative">
          {/* Subtle decorative shapes */}
          <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 w-60 h-60 rounded-full bg-primary/10 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-secondary/10 blur-3xl" />

          {/* Section label inside banner */}
          <div className="absolute top-5 left-6">
            <p className="font-mono text-xs tracking-widest text-primary uppercase">
              Profile
            </p>
          </div>
        </div>

        {/* Avatar — overlaps banner bottom */}
        <div className="absolute -bottom-10 left-6 sm:left-8">
          <ProfileAvatar email={MOCK_USER.email} size="lg" />
        </div>

        {/* Role pill — top-right of banner */}
        <div className="absolute top-5 right-6 flex items-center gap-2">
          <StatusBadge status={MOCK_USER.accountStatus} />
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 capitalize">
            {MOCK_USER.role}
          </span>
        </div>
      </div>

      {/* ── Name / email row below avatar ────────────────────── */}
      <div className="mb-10 pl-1">
        <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight leading-snug">
          Your{" "}
          <span className="italic bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            account
          </span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{MOCK_USER.email}</p>
        <p className="font-mono text-xs text-muted-foreground/60 mt-1 tabular-nums">
          Member since {memberSince}
        </p>
      </div>

      {/* ── Content grid: 2-col on lg ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">

        {/* ── Left column: account info + privacy ──────────── */}
        <div className="space-y-6">
          {/* Account details card */}
          <section className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-heading text-base font-semibold text-foreground tracking-tight mb-5">
              Account details
            </h2>
            <div className="grid grid-cols-2 gap-5">
              <InfoRow label="Email" value={MOCK_USER.email} />
              <InfoRow label="Role" value={MOCK_USER.role.charAt(0).toUpperCase() + MOCK_USER.role.slice(1)} />
              <InfoRow label="Status" value={MOCK_USER.accountStatus.charAt(0).toUpperCase() + MOCK_USER.accountStatus.slice(1)} />
              <InfoRow label="Member since" value={memberSince} mono />
            </div>
          </section>

          {/* Privacy card */}
          <section className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-heading text-base font-semibold text-foreground tracking-tight mb-5">
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
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  When enabled, your forum posts and doctor questions appear as anonymous to other users.
                </p>
              </div>
            </div>

            {isAnonymous && (
              <div className="mt-4 px-4 py-3 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-xs text-primary font-medium">
                  Anonymous mode is on — your identity is hidden in the community.
                </p>
              </div>
            )}
          </section>

          {/* Liked tags card */}
          <section className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-heading text-base font-semibold text-foreground tracking-tight mb-2">
              Interests
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Tags you follow for personalized content recommendations.
            </p>
            {MOCK_USER.likedTags && MOCK_USER.likedTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {MOCK_USER.likedTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1.5 rounded-full bg-primary/8 text-primary border border-primary/15 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No tags followed yet.</p>
            )}
          </section>
        </div>

        {/* ── Right column: editable profile fields ────────── */}
        <section className="bg-card rounded-2xl border border-primary/15 shadow-sm p-6 h-fit">
          <h2 className="font-heading text-base font-semibold text-foreground tracking-tight mb-1">
            Personal details
          </h2>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            Help us personalize your experience. All fields are optional and only visible to you.
          </p>

          <div className="space-y-5">
            <div>
              <label htmlFor="profile-age" className="block text-sm font-medium text-foreground mb-1.5">
                Age group
              </label>
              <select
                id="profile-age"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary/50 transition-colors appearance-none"
              >
                <option value="">Select age group</option>
                <option value="13-17">13 – 17</option>
                <option value="18-24">18 – 24</option>
                <option value="25-34">25 – 34</option>
                <option value="35-44">35 – 44</option>
                <option value="45-54">45 – 54</option>
                <option value="55+">55+</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label htmlFor="profile-gender" className="block text-sm font-medium text-foreground mb-1.5">
                Gender
              </label>
              <select
                id="profile-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary/50 transition-colors appearance-none"
              >
                <option value="">Select gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
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

            <div className="pt-2">
              <Button
                type="button"
                disabled
                className="w-full sm:w-auto h-11 px-8 text-sm font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60"
              >
                Save changes
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                API integration coming soon — your changes won&apos;t persist yet.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ── Danger zone ─────────────────────────────────────── */}
      <section className="mt-8 bg-card rounded-2xl border border-destructive/15 p-6">
        <h2 className="font-heading text-base font-semibold text-destructive tracking-tight mb-1">
          Danger zone
        </h2>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          These actions are irreversible. Proceed with caution.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            disabled
            variant="destructive"
            className="h-10 px-5 text-sm rounded-xl"
          >
            Delete account
          </Button>
          <Button
            type="button"
            disabled
            variant="outline"
            className="h-10 px-5 text-sm rounded-xl text-destructive border-destructive/30 hover:bg-destructive/5"
          >
            Export my data
          </Button>
        </div>
      </section>
    </>
  );
}
