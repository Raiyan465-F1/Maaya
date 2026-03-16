"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DoctorProfileFragment {
  specialty: string | null;
  bio: string | null;
  qualifications: string | null;
  institution: string | null;
  availabilityInfo: string | null;
}

interface UserProfile {
  id: string;
  name: string | null;
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

function ProfileAvatar({
  name,
  email,
  role,
  size = "lg",
}: {
  name: string | null;
  email: string;
  role: "user" | "doctor" | "admin";
  size?: "sm" | "lg";
}) {
  const initial = name ? name[0].toUpperCase() : email ? email[0].toUpperCase() : "?";
  const sizeClasses = size === "lg" ? "w-24 h-24 text-3xl" : "w-10 h-10 text-sm";

  const gradientClasses =
    role === "doctor"
      ? "from-secondary to-primary"
      : role === "admin"
        ? "from-primary via-accent to-secondary"
        : "from-primary to-secondary";

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br font-heading font-bold text-primary-foreground shadow-lg ring-4 ring-card",
        gradientClasses,
        sizeClasses,
      )}
    >
      {initial}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    banned: "bg-destructive/10 text-destructive border-destructive/20",
    suspended: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[status] ?? styles.pending,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "active"
            ? "bg-emerald-500"
            : status === "pending"
              ? "bg-amber-500"
              : "bg-destructive",
        )}
      />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-sm text-foreground", mono && "font-mono tabular-nums")}>{value || "—"}</p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <>
      <div className="relative mb-10">
        <div className="h-40 animate-pulse rounded-3xl bg-muted sm:h-48" />
        <div className="absolute -bottom-10 left-6 sm:left-8">
          <div className="h-24 w-24 animate-pulse rounded-full bg-muted ring-4 ring-card" />
        </div>
      </div>
      <div className="mb-10 space-y-3 pl-1">
        <div className="h-7 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-56 animate-pulse rounded bg-muted" />
        <div className="h-3 w-36 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <div className="h-40 animate-pulse rounded-2xl border border-border bg-card p-6" />
          <div className="h-28 animate-pulse rounded-2xl border border-border bg-card p-6" />
          <div className="h-24 animate-pulse rounded-2xl border border-border bg-card p-6" />
        </div>
        <div className="h-80 animate-pulse rounded-2xl border border-border bg-card p-6" />
      </div>
    </>
  );
}

function RoleBadge({ role }: { role: "user" | "doctor" | "admin" }) {
  const styles = {
    user: "bg-primary/10 text-primary border-primary/20",
    doctor: "bg-secondary/10 text-secondary border-secondary/20",
    admin: "bg-accent/10 text-accent border-accent/20",
  };

  const labels = { user: "User", doctor: "Doctor", admin: "Admin" };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[role],
      )}
    >
      {labels[role]}
    </span>
  );
}

export default function ProfilePage() {
  const { status: sessionStatus } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [ageGroup, setAgeGroup] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [bio, setBio] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [institution, setInstitution] = useState("");
  const [availabilityInfo, setAvailabilityInfo] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [togglingAnon, setTogglingAnon] = useState(false);

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
      setDisplayName(data.name ?? "");
      setIsAnonymous(data.isAnonymous ?? false);
      setAgeGroup(data.ageGroup ?? "");
      setGender(data.gender ?? "");
      setLocation(data.location ?? "");
      setSpecialty(data.doctorProfile?.specialty ?? "");
      setBio(data.doctorProfile?.bio ?? "");
      setQualifications(data.doctorProfile?.qualifications ?? "");
      setInstitution(data.doctorProfile?.institution ?? "");
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

  async function handleSave() {
    setSaving(true);
    setSaveMsg(null);
    try {
      const body: Record<string, unknown> = {
        name: displayName.trim() || null,
        ageGroup: ageGroup || null,
        gender: gender || null,
        location: location || null,
      };
      if (profile?.role === "doctor") {
        body.specialty = specialty.trim() || null;
        body.bio = bio.trim() || null;
        body.qualifications = qualifications.trim() || null;
        body.institution = institution.trim() || null;
        body.availabilityInfo = availabilityInfo.trim() || null;
      }
      const updated = await patchProfile(body);
      setProfile(updated);
      setDisplayName(updated.name ?? "");
      setSpecialty(updated.doctorProfile?.specialty ?? "");
      setBio(updated.doctorProfile?.bio ?? "");
      setQualifications(updated.doctorProfile?.qualifications ?? "");
      setInstitution(updated.doctorProfile?.institution ?? "");
      setAvailabilityInfo(updated.doctorProfile?.availabilityInfo ?? "");
      setSaveMsg({ type: "success", text: "Profile updated successfully." });
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (err) {
      setSaveMsg({ type: "error", text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

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

  const memberSince = profile
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";

  const hasUnsavedChanges =
    profile &&
    (displayName !== (profile.name ?? "") ||
      ageGroup !== (profile.ageGroup ?? "") ||
      gender !== (profile.gender ?? "") ||
      location !== (profile.location ?? "") ||
      (profile.role === "doctor" &&
        (specialty !== (profile.doctorProfile?.specialty ?? "") ||
          bio !== (profile.doctorProfile?.bio ?? "") ||
          qualifications !== (profile.doctorProfile?.qualifications ?? "") ||
          institution !== (profile.doctorProfile?.institution ?? "") ||
          availabilityInfo !== (profile.doctorProfile?.availabilityInfo ?? ""))));

  if (loading) return <ProfileSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="mb-2 font-heading text-xl font-semibold text-foreground">Couldn&apos;t load profile</p>
        <p className="mb-6 text-sm text-muted-foreground">{error}</p>
        <Button onClick={fetchProfile} className="rounded-xl px-6">
          Try again
        </Button>
      </div>
    );
  }

  if (!profile) return null;

  const isDoctor = profile.role === "doctor";
  const isAdmin = profile.role === "admin";

  const bannerGradient = isDoctor
    ? "from-secondary/15 via-accent/8 to-primary/12"
    : isAdmin
      ? "from-primary/15 via-accent/10 to-secondary/12"
      : "from-primary/15 via-accent/10 to-secondary/15";

  const blobColor1 = isDoctor ? "bg-secondary/12" : "bg-primary/10";
  const blobColor2 = isDoctor ? "bg-primary/10" : "bg-secondary/10";

  return (
    <>
      {/* Hero banner */}
      <div className="relative mb-10">
        <div
          className={cn(
            "relative h-40 overflow-hidden rounded-3xl border border-primary/10 sm:h-48",
            `bg-gradient-to-br ${bannerGradient}`,
          )}
        >
          <div
            aria-hidden
            className={cn("pointer-events-none absolute -top-16 -right-16 h-60 w-60 rounded-full blur-3xl", blobColor1)}
          />
          <div
            aria-hidden
            className={cn("pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full blur-3xl", blobColor2)}
          />
          <div className="absolute top-5 left-6">
            <p
              className={cn(
                "font-mono text-xs tracking-widest uppercase",
                isDoctor ? "text-secondary" : "text-primary",
              )}
            >
              {isDoctor ? "Doctor Profile" : isAdmin ? "Admin Profile" : "Profile"}
            </p>
          </div>
        </div>
        <div className="absolute -bottom-10 left-6 sm:left-8">
          <ProfileAvatar name={profile.name} email={profile.email} role={profile.role} size="lg" />
        </div>
        <div className="absolute top-5 right-6 flex items-center gap-2">
          <StatusBadge status={profile.accountStatus ?? "pending"} />
          <RoleBadge role={profile.role} />
        </div>
      </div>

      {/* Identity row */}
      <div className="mb-10 pl-1">
        <h1 className="font-heading text-2xl font-bold leading-snug tracking-tight text-foreground">
          {profile.name ? (
            <>
              {profile.name.split(" ")[0]}&apos;s{" "}
              <span
                className={cn(
                  "bg-clip-text italic text-transparent",
                  isDoctor
                    ? "bg-gradient-to-r from-secondary to-primary"
                    : "bg-gradient-to-r from-primary to-secondary",
                )}
              >
                {isDoctor ? "practice" : isAdmin ? "dashboard" : "account"}
              </span>
            </>
          ) : (
            <>
              Your{" "}
              <span
                className={cn(
                  "bg-clip-text italic text-transparent",
                  isDoctor
                    ? "bg-gradient-to-r from-secondary to-primary"
                    : "bg-gradient-to-r from-primary to-secondary",
                )}
              >
                {isDoctor ? "practice" : isAdmin ? "dashboard" : "account"}
              </span>
            </>
          )}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
        <p className="mt-1 font-mono text-xs text-muted-foreground/60 tabular-nums">Member since {memberSince}</p>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Left column — info cards */}
        <div className="space-y-6">
          {/* Account details */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-5 font-heading text-base font-semibold tracking-tight text-foreground">Account details</h2>
            <div className="space-y-5">
              <InfoRow label="Name" value={profile.name ?? "Not set"} />
              <InfoRow label="Email" value={profile.email} />
              <div className="grid grid-cols-3 gap-5">
                <InfoRow label="Role" value={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} />
                <InfoRow
                  label="Status"
                  value={
                    (profile.accountStatus ?? "pending").charAt(0).toUpperCase() +
                    (profile.accountStatus ?? "pending").slice(1)
                  }
                />
                <InfoRow label="Member since" value={memberSince} mono />
              </div>
            </div>
          </section>

          {/* Doctor: professional summary card */}
          {isDoctor && (
            <section className="rounded-2xl border border-secondary/20 bg-gradient-to-br from-secondary/5 to-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/12 font-mono text-xs font-medium text-secondary">
                  Dr
                </span>
                <div>
                  <h2 className="font-heading text-base font-semibold tracking-tight text-foreground">
                    Professional profile
                  </h2>
                  <p className="text-xs text-muted-foreground">Visible to users in Doctor&apos;s Help</p>
                </div>
              </div>
              <div className="space-y-4">
                <InfoRow label="Specialty" value={profile.doctorProfile?.specialty ?? "—"} />
                <InfoRow label="Institution" value={profile.doctorProfile?.institution ?? "—"} />
                <InfoRow label="Qualifications" value={profile.doctorProfile?.qualifications ?? "—"} />
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Bio</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {profile.doctorProfile?.bio || "—"}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Availability</p>
                  <p className="whitespace-pre-wrap text-sm text-foreground">
                    {profile.doctorProfile?.availabilityInfo || "—"}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Admin: administration panel */}
          {isAdmin && (
            <section className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 via-primary/5 to-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/12 font-mono text-xs font-medium text-accent">
                  ⚙
                </span>
                <div>
                  <h2 className="font-heading text-base font-semibold tracking-tight text-foreground">
                    Administration
                  </h2>
                  <p className="text-xs text-muted-foreground">System management access</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-accent/10 bg-accent/5 p-4">
                  <p className="text-sm leading-relaxed text-foreground">
                    As an administrator, you manage user roles, content moderation, doctor onboarding, and platform
                    safety. Use the admin tools to oversee community health and maintain platform standards.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-primary/10 bg-card p-3">
                    <p className="font-mono text-[10px] tracking-widest text-primary uppercase">Role</p>
                    <p className="mt-1 font-heading text-sm font-semibold text-foreground">System Admin</p>
                  </div>
                  <div className="rounded-xl border border-primary/10 bg-card p-3">
                    <p className="font-mono text-[10px] tracking-widest text-primary uppercase">Access</p>
                    <p className="mt-1 font-heading text-sm font-semibold text-foreground">Full</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Capabilities</p>
                  <div className="flex flex-wrap gap-2">
                    {["User Management", "Content Moderation", "Doctor Onboarding", "Reports Review", "Article Management"].map(
                      (cap) => (
                        <span
                          key={cap}
                          className="rounded-full border border-accent/15 bg-accent/8 px-3 py-1 text-xs font-medium text-accent"
                        >
                          {cap}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Privacy */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-5 font-heading text-base font-semibold tracking-tight text-foreground">Privacy</h2>
            <div className="flex items-start gap-4">
              <button
                type="button"
                role="switch"
                aria-checked={isAnonymous}
                disabled={togglingAnon}
                onClick={handleToggleAnonymous}
                className={cn(
                  "relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50",
                  isAnonymous ? "border-primary/30 bg-primary" : "border-border bg-input",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 rounded-full bg-card shadow ring-0 transition-transform",
                    isAnonymous ? "translate-x-5" : "translate-x-0.5",
                  )}
                  style={{ marginTop: 2 }}
                />
              </button>
              <div>
                <p className="text-sm font-medium text-foreground">Anonymous posting</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  When enabled, your forum posts and doctor questions appear as anonymous to other users.
                </p>
              </div>
            </div>
            {isAnonymous && (
              <div className="mt-4 rounded-xl border border-primary/10 bg-primary/5 px-4 py-3">
                <p className="text-xs font-medium text-primary">
                  Anonymous mode is on — your identity is hidden in the community.
                </p>
              </div>
            )}
          </section>

          {/* Interests */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-2 font-heading text-base font-semibold tracking-tight text-foreground">Interests</h2>
            <p className="mb-4 text-xs text-muted-foreground">Tags you follow for personalized content recommendations.</p>
            {profile.likedTags && profile.likedTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.likedTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-primary/15 bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-muted-foreground">
                No tags followed yet. These will appear as you interact with the forum and articles.
              </p>
            )}
          </section>
        </div>

        {/* Right column — editable form */}
        <section
          className={cn(
            "h-fit rounded-2xl border p-6 shadow-sm",
            isDoctor ? "border-secondary/15 bg-card" : isAdmin ? "border-accent/15 bg-card" : "border-primary/15 bg-card",
          )}
        >
          {/* Name field — common to all roles */}
          <h2 className="mb-1 font-heading text-base font-semibold tracking-tight text-foreground">
            {isDoctor ? "Your details" : isAdmin ? "Admin details" : "Personal details"}
          </h2>
          <p className="mb-6 text-xs leading-relaxed text-muted-foreground">
            {isDoctor
              ? "Keep your professional and personal information up to date."
              : isAdmin
                ? "Manage your admin account information."
                : "Help us personalize your experience. All fields are optional and only visible to you."}
          </p>

          <div className="space-y-5">
            <div>
              <label htmlFor="profile-name" className="mb-1.5 block text-sm font-medium text-foreground">
                Display name
              </label>
              <input
                id="profile-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>

            {/* Doctor professional fields */}
            {isDoctor && (
              <>
                <div className="border-t border-secondary/10 pt-5">
                  <p
                    className={cn(
                      "mb-4 font-mono text-xs tracking-widest uppercase",
                      "text-secondary",
                    )}
                  >
                    Professional information
                  </p>
                </div>

                <div>
                  <label htmlFor="profile-specialty" className="mb-1.5 block text-sm font-medium text-foreground">
                    Specialty
                  </label>
                  <input
                    id="profile-specialty"
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g. Gynecology, Reproductive Health"
                    className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-foreground transition-colors placeholder:text-muted-foreground focus:border-secondary/50 focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  />
                </div>

                <div>
                  <label htmlFor="profile-institution" className="mb-1.5 block text-sm font-medium text-foreground">
                    Institution / Hospital
                  </label>
                  <input
                    id="profile-institution"
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Dhaka Medical College Hospital"
                    className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-foreground transition-colors placeholder:text-muted-foreground focus:border-secondary/50 focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  />
                </div>

                <div>
                  <label htmlFor="profile-qualifications" className="mb-1.5 block text-sm font-medium text-foreground">
                    Qualifications
                  </label>
                  <textarea
                    id="profile-qualifications"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    placeholder="e.g. MBBS, FCPS (Obs & Gynae)"
                    rows={2}
                    className="w-full resize-none rounded-xl border border-input bg-background px-3.5 py-3 text-foreground transition-colors placeholder:text-muted-foreground focus:border-secondary/50 focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  />
                </div>

                <div>
                  <label htmlFor="profile-bio" className="mb-1.5 block text-sm font-medium text-foreground">
                    Bio
                  </label>
                  <textarea
                    id="profile-bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell users about your experience and approach..."
                    rows={4}
                    className="w-full resize-none rounded-xl border border-input bg-background px-3.5 py-3 text-foreground transition-colors placeholder:text-muted-foreground focus:border-secondary/50 focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  />
                </div>

                <div>
                  <label htmlFor="profile-availability" className="mb-1.5 block text-sm font-medium text-foreground">
                    Availability
                  </label>
                  <textarea
                    id="profile-availability"
                    value={availabilityInfo}
                    onChange={(e) => setAvailabilityInfo(e.target.value)}
                    placeholder="e.g. Weekdays 9–5, or timezone and hours"
                    rows={2}
                    className="w-full resize-none rounded-xl border border-input bg-background px-3.5 py-3 text-foreground transition-colors placeholder:text-muted-foreground focus:border-secondary/50 focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  />
                </div>

                <div className="border-t border-secondary/10 pt-5">
                  <p className="mb-4 font-mono text-xs tracking-widest text-secondary uppercase">Personal information</p>
                </div>
              </>
            )}

            <div>
              <label htmlFor="profile-age" className="mb-1.5 block text-sm font-medium text-foreground">
                Age group
              </label>
              <select
                id="profile-age"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-input bg-background px-3.5 text-foreground transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/50"
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
              <label htmlFor="profile-gender" className="mb-1.5 block text-sm font-medium text-foreground">
                Gender
              </label>
              <select
                id="profile-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-input bg-background px-3.5 text-foreground transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/50"
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
              <label htmlFor="profile-location" className="mb-1.5 block text-sm font-medium text-foreground">
                Location
              </label>
              <input
                id="profile-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Country or region (optional)"
                className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>

            <div className="pt-2">
              <Button
                type="button"
                disabled={saving || !hasUnsavedChanges}
                onClick={handleSave}
                className={cn(
                  "h-11 w-full rounded-xl px-8 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto",
                  isDoctor
                    ? "bg-gradient-to-r from-secondary to-primary"
                    : "bg-gradient-to-r from-primary to-accent",
                )}
              >
                {saving ? "Saving…" : "Save changes"}
              </Button>

              {saveMsg && (
                <p
                  className={cn(
                    "mt-3 text-xs font-medium",
                    saveMsg.type === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
                  )}
                >
                  {saveMsg.text}
                </p>
              )}

              {hasUnsavedChanges && !saveMsg && (
                <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">You have unsaved changes.</p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Session */}
      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-1 font-heading text-base font-semibold tracking-tight text-foreground">Session</h2>
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{profile.email}</span>
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="h-10 rounded-xl px-5 text-sm"
        >
          Sign out
        </Button>
      </section>

      {/* Danger zone */}
      <section className="mt-4 rounded-2xl border border-destructive/15 bg-card p-6">
        <h2 className="mb-1 font-heading text-base font-semibold tracking-tight text-destructive">Danger zone</h2>
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          These actions are irreversible. Proceed with caution.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" disabled variant="destructive" className="h-10 rounded-xl px-5 text-sm">
            Delete account
          </Button>
          <Button
            type="button"
            disabled
            variant="outline"
            className="h-10 rounded-xl border-destructive/30 px-5 text-sm text-destructive hover:bg-destructive/5"
          >
            Export my data
          </Button>
        </div>
      </section>
    </>
  );
}
