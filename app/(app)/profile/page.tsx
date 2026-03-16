"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ─── Types matching the API response ────────────────────────── */
interface DoctorProfileFragment {
  specialty: string | null;
  availabilityInfo: string | null;
}

interface UserProfile {
  id: string;
  email: string;
  role: "user" | "doctor" | "admin";
  accountStatus: "pending" | "active" | "banned" | "suspended" | null;
  isAnonymous: boolean | null;
  likedTags: string[] | null;
  ageGroup: string | null;
  gender: string | null;
  location: string | null;
  createdAt: string;
  updatedAt: string;
  doctorProfile?: DoctorProfileFragment | null;
}

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

/* ─── Info row ───────────────────────────────────────────────── */
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

/* ─── Loading skeleton ───────────────────────────────────────── */
function ProfileSkeleton() {
  return (
    <>
      <div className="relative mb-10">
        <div className="h-40 sm:h-48 rounded-3xl bg-muted animate-pulse" />
        <div className="absolute -bottom-10 left-6 sm:left-8">
          <div className="w-24 h-24 rounded-full bg-muted animate-pulse ring-4 ring-card" />
        </div>
      </div>
      <div className="mb-10 pl-1 space-y-3">
        <div className="h-7 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="h-4 w-56 bg-muted rounded animate-pulse" />
        <div className="h-3 w-36 bg-muted rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6 h-40 animate-pulse" />
          <div className="bg-card rounded-2xl border border-border p-6 h-28 animate-pulse" />
          <div className="bg-card rounded-2xl border border-border p-6 h-24 animate-pulse" />
        </div>
        <div className="bg-card rounded-2xl border border-border p-6 h-80 animate-pulse" />
      </div>
    </>
  );
}

/* ─── Profile page ───────────────────────────────────────────── */
export default function ProfilePage() {
  const { status: sessionStatus } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [ageGroup, setAgeGroup] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [availabilityInfo, setAvailabilityInfo] = useState("");

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [togglingAnon, setTogglingAnon] = useState(false);

  /* ── Fetch profile ───────────────────────────────────────── */
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/profile");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to load profile (${res.status})`);
      }
      const data: UserProfile = await res.json();
      setProfile(data);
      setIsAnonymous(data.isAnonymous ?? false);
      setAgeGroup(data.ageGroup ?? "");
      setGender(data.gender ?? "");
      setLocation(data.location ?? "");
      setSpecialty(data.doctorProfile?.specialty ?? "");
      setAvailabilityInfo(data.doctorProfile?.availabilityInfo ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchProfile();
    } else if (sessionStatus === "unauthenticated") {
      setLoading(false);
      setError("You must be logged in to view your profile.");
    }
  }, [sessionStatus, fetchProfile]);

  /* ── PATCH helper ────────────────────────────────────────── */
  async function patchProfile(body: Record<string, unknown>) {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Update failed");
    return data as UserProfile;
  }

  /* ── Save personal details (and doctor profile when applicable) ── */
  /* ── Save personal details (and doctor profile when applicable) ── */
  async function handleSave() {
    setSaving(true);
    setSaveMsg(null);
    try {
      const body: Record<string, unknown> = {
        ageGroup: ageGroup || null,
        gender: gender || null,
        location: location || null,
      };
      if (profile?.role === "doctor") {
        body.specialty = specialty.trim() || null;
        body.availabilityInfo = availabilityInfo.trim() || null;
      }
      const updated = await patchProfile(body);
      setProfile(updated);
      setSpecialty(updated.doctorProfile?.specialty ?? "");
      setAvailabilityInfo(updated.doctorProfile?.availabilityInfo ?? "");
      setSaveMsg({ type: "success", text: "Profile updated successfully." });
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (err) {
      setSaveMsg({ type: "error", text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  /* ── Toggle anonymous ────────────────────────────────────── */
  async function handleToggleAnonymous() {
    const newValue = !isAnonymous;
    setIsAnonymous(newValue);
    setTogglingAnon(true);
    try {
      const updated = await patchProfile({ isAnonymous: newValue });
      setProfile(updated);
    } catch {
      setIsAnonymous(!newValue);
    } finally {
      setTogglingAnon(false);
    }
  }

  /* ── Derived values ──────────────────────────────────────── */
  const memberSince = profile
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";

  const hasUnsavedChanges =
    profile &&
    (ageGroup !== (profile.ageGroup ?? "") ||
      gender !== (profile.gender ?? "") ||
      location !== (profile.location ?? "") ||
      (profile.role === "doctor" &&
        (specialty !== (profile.doctorProfile?.specialty ?? "") ||
          availabilityInfo !== (profile.doctorProfile?.availabilityInfo ?? ""))));

  /* ── Render ──────────────────────────────────────────────── */
  if (loading) return <ProfileSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-heading text-xl font-semibold text-foreground mb-2">
          Couldn&apos;t load profile
        </p>
        <p className="text-sm text-muted-foreground mb-6">{error}</p>
        <Button onClick={fetchProfile} className="rounded-xl px-6">
          Try again
        </Button>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <>
      {/* ── Hero banner with avatar ─────────────────────────── */}
      <div className="relative mb-10">
        <div className="h-40 sm:h-48 rounded-3xl bg-gradient-to-br from-primary/15 via-accent/10 to-secondary/15 border border-primary/10 overflow-hidden relative">
          <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 w-60 h-60 rounded-full bg-primary/10 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute top-5 left-6">
            <p className="font-mono text-xs tracking-widest text-primary uppercase">Profile</p>
          </div>
        </div>
        <div className="absolute -bottom-10 left-6 sm:left-8">
          <ProfileAvatar email={profile.email} size="lg" />
        </div>
        <div className="absolute top-5 right-6 flex items-center gap-2">
          <StatusBadge status={profile.accountStatus ?? "pending"} />
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 capitalize">
            {profile.role}
          </span>
        </div>
      </div>

      {/* ── Identity row ─────────────────────────────────────── */}
      <div className="mb-10 pl-1">
        <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight leading-snug">
          Your{" "}
          <span className="italic bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            account
          </span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{profile.email}</p>
        <p className="font-mono text-xs text-muted-foreground/60 mt-1 tabular-nums">
          Member since {memberSince}
        </p>
      </div>

      {/* ── Content grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Account details */}
          <section className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-heading text-base font-semibold text-foreground tracking-tight mb-5">
              Account details
            </h2>
            <div className="space-y-5">
              <InfoRow label="Email" value={profile.email} />
              <div className="grid grid-cols-3 gap-5">
                <InfoRow label="Role" value={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} />
                <InfoRow label="Status" value={(profile.accountStatus ?? "pending").charAt(0).toUpperCase() + (profile.accountStatus ?? "pending").slice(1)} />
                <InfoRow label="Member since" value={memberSince} mono />
              </div>
            </div>
          </section>

          {/* Admin callout */}
          {profile.role === "admin" && (
            <section className="bg-primary/5 rounded-2xl border border-primary/15 p-5">
              <p className="font-mono text-xs tracking-widest text-primary uppercase mb-2">
                Admin access
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                You have admin access. Doctors are onboarded by admins; use the admin area to manage roles and verification.
              </p>
            </section>
          )}

          {/* Doctor: read-only professional summary in left column */}
          {profile.role === "doctor" && (
            <section className="bg-card rounded-2xl border border-secondary/20 p-6">
              <h2 className="font-heading text-base font-semibold text-foreground tracking-tight mb-2">
                Professional profile
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Visible to users in Doctor&apos;s Help. Edit below.
              </p>
              <div className="space-y-3">
                <InfoRow
                  label="Specialty"
                  value={profile.doctorProfile?.specialty ?? "—"}
                />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Availability</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {profile.doctorProfile?.availabilityInfo || "—"}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Privacy */}
          <section className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-heading text-base font-semibold text-foreground tracking-tight mb-5">
              Privacy
            </h2>
            <div className="flex items-start gap-4">
              <button
                type="button"
                role="switch"
                aria-checked={isAnonymous}
                disabled={togglingAnon}
                onClick={handleToggleAnonymous}
                className={cn(
                  "relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50",
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

          {/* Interests */}
          <section className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-heading text-base font-semibold text-foreground tracking-tight mb-2">
              Interests
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Tags you follow for personalized content recommendations.
            </p>
            {profile.likedTags && profile.likedTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.likedTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1.5 rounded-full bg-primary/8 text-primary border border-primary/15 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No tags followed yet. These will appear as you interact with the forum and articles.
              </p>
            )}
          </section>
        </div>

        {/* Right column — editable */}
        <section className="bg-card rounded-2xl border border-primary/15 shadow-sm p-6 h-fit">
          {profile.role === "doctor" && (
            <>
              <h2 className="font-heading text-base font-semibold text-foreground tracking-tight mb-1">
                Professional profile
              </h2>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Shown to users in Doctor&apos;s Help. Keeps your listing up to date.
              </p>
              <div className="space-y-5 mb-8">
                <div>
                  <label htmlFor="profile-specialty" className="block text-sm font-medium text-foreground mb-1.5">
                    Specialty
                  </label>
                  <input
                    id="profile-specialty"
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g. Gynecology, Reproductive Health"
                    className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="profile-availability" className="block text-sm font-medium text-foreground mb-1.5">
                    Availability
                  </label>
                  <textarea
                    id="profile-availability"
                    value={availabilityInfo}
                    onChange={(e) => setAvailabilityInfo(e.target.value)}
                    placeholder="e.g. Weekdays 9–5, or timezone and hours"
                    rows={3}
                    className="w-full px-3.5 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary/50 transition-colors resize-none"
                  />
                </div>
              </div>
            </>
          )}

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
                disabled={saving || !hasUnsavedChanges}
                onClick={handleSave}
                className="w-full sm:w-auto h-11 px-8 text-sm font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save changes"}
              </Button>

              {saveMsg && (
                <p className={cn(
                  "text-xs mt-3 font-medium",
                  saveMsg.type === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                )}>
                  {saveMsg.text}
                </p>
              )}

              {hasUnsavedChanges && !saveMsg && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">
                  You have unsaved changes.
                </p>
              )}
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
          <Button type="button" disabled variant="destructive" className="h-10 px-5 text-sm rounded-xl">
            Delete account
          </Button>
          <Button type="button" disabled variant="outline" className="h-10 px-5 text-sm rounded-xl text-destructive border-destructive/30 hover:bg-destructive/5">
            Export my data
          </Button>
        </div>
      </section>
    </>
  );
}
