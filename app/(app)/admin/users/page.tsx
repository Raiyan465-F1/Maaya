"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import type { ModerationSnapshot, ModerationUserRecord } from "@/lib/moderation-types";
import { cn } from "@/lib/utils";

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function badgeClass(status: string | null | undefined) {
  switch (status) {
    case "active":
      return "border-emerald-500/20 bg-emerald-50 text-emerald-700";
    case "pending":
    case "suspended":
      return "border-amber-500/20 bg-amber-50 text-amber-700";
    case "banned":
      return "border-rose-500/20 bg-rose-50 text-rose-700";
    default:
      return "border-border bg-muted/40 text-muted-foreground";
  }
}

function actionButtonClass(active?: boolean, destructive?: boolean) {
  if (active) {
    return "border-primary bg-primary text-primary-foreground";
  }

  if (destructive) {
    return "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100";
  }

  return "border-border bg-background text-foreground hover:border-primary/30 hover:text-primary";
}

async function readJsonResponse<T>(response: Response) {
  const text = await response.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text) as T & { error?: string };
  } catch {
    return null;
  }
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/10 via-card to-card p-5">
      <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">{label}</p>
      <p className="mt-3 font-mono text-4xl leading-none font-semibold text-foreground">{value}</p>
    </div>
  );
}

function UserCard({
  user,
  busy,
  onStatusChange,
}: {
  user: ModerationUserRecord;
  busy: boolean;
  onStatusChange: (userId: string, status: "active" | "suspended" | "banned") => void;
}) {
  const displayName = user.name?.trim() || user.email;
  const statusOptions: Array<"active" | "suspended" | "banned"> = ["active", "suspended", "banned"];

  return (
    <div id={`user-${user.id}`} className="min-w-0 scroll-mt-24 rounded-2xl border border-primary/10 bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="break-words font-heading text-lg font-semibold text-foreground">{displayName}</h2>
          <p className="break-all text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-primary/15 bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-primary capitalize">
            {user.role}
          </span>
          <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize", badgeClass(user.accountStatus))}>
            {user.accountStatus ?? "pending"}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">Posts</p>
          <p className="mt-1 font-mono text-2xl text-foreground">{user.postCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">Anon posts</p>
          <p className="mt-1 font-mono text-2xl text-foreground">{user.anonymousPostCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">Comments</p>
          <p className="mt-1 font-mono text-2xl text-foreground">{user.commentCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">Pending reports</p>
          <p className="mt-1 font-mono text-2xl text-foreground">{user.pendingReports}</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">Reviewed reports</p>
          <p className="mt-1 font-mono text-2xl text-foreground">{user.reviewedReports}</p>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">Joined {formatDateTime(user.createdAt)}</p>

      {user.role === "admin" ? (
        <div className="mt-4 rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          Admin accounts are visible here for context, but their status is intentionally locked.
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <button
              key={status}
              type="button"
              disabled={busy}
              onClick={() => onStatusChange(user.id, status)}
              className={cn(
                "rounded-xl border px-3.5 py-2 text-sm font-medium capitalize transition disabled:cursor-not-allowed disabled:opacity-50",
                actionButtonClass(user.accountStatus === status, status === "banned"),
              )}
            >
              {status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const [snapshot, setSnapshot] = useState<ModerationSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState<"all" | "flagged" | "restricted">("flagged");

  async function fetchSnapshot() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/moderation", { cache: "no-store" });
      const data = await readJsonResponse<ModerationSnapshot>(response);

      if (!response.ok || !data) {
        setError(data?.error || "Unable to load user accounts right now.");
        return;
      }

      setSnapshot(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "admin") return;
    void fetchSnapshot();
  }, [session?.user?.role, status]);

  async function updateUserStatus(userId: string, accountStatus: "active" | "suspended" | "banned") {
    setBusyKey(`user-${userId}`);
    setError(null);

    try {
      const response = await fetch(`/api/admin/moderation/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountStatus }),
      });
      const data = await readJsonResponse<ModerationSnapshot>(response);

      if (!response.ok || !data) {
        setError(data?.error || "Unable to update the user account.");
        return;
      }

      setSnapshot(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusyKey(null);
    }
  }

  const users = snapshot?.users ?? [];

  const summary = useMemo(() => ({
    flaggedUsers: users.filter((user) => user.pendingReports > 0).length,
    suspendedUsers: users.filter((user) => user.accountStatus === "suspended").length,
    bannedUsers: users.filter((user) => user.accountStatus === "banned").length,
    totalUsers: users.length,
  }), [users]);

  const filteredUsers = useMemo(() => {
    if (userFilter === "all") return users;
    if (userFilter === "restricted") {
      return users.filter((user) => user.accountStatus === "suspended" || user.accountStatus === "banned");
    }

    return users.filter((user) => user.pendingReports > 0 || user.accountStatus === "suspended" || user.accountStatus === "banned");
  }, [userFilter, users]);

  if (status === "authenticated" && session?.user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="mb-2 font-heading text-xl font-semibold text-foreground">Access denied</p>
        <p className="text-sm text-muted-foreground">Only admins can access account management tools.</p>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-widest text-accent uppercase">Admin</p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground">
            User{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text italic text-transparent">
              accounts
            </span>
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Review flagged users, inspect activity totals, and update account access without crowding the moderation queue.
          </p>
        </div>

        <Link
          href="/admin/moderation"
          className="rounded-xl border border-primary/15 bg-card px-4 py-2.5 text-sm font-medium text-primary transition hover:border-primary/30 hover:bg-primary/5"
        >
          Back to moderation
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Flagged users" value={summary.flaggedUsers} />
        <SummaryCard label="Suspended users" value={summary.suspendedUsers} />
        <SummaryCard label="Banned users" value={summary.bannedUsers} />
        <SummaryCard label="Tracked users" value={summary.totalUsers} />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["flagged", "restricted", "all"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setUserFilter(filter)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-sm font-medium capitalize transition",
                userFilter === filter
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => void fetchSnapshot()}
          disabled={isLoading}
          className="rounded-full border border-border bg-background px-3.5 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {isLoading && !snapshot ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
          Loading user accounts...
        </div>
      ) : null}

      {!isLoading && snapshot && !filteredUsers.length ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
          No users match the current filter.
        </div>
      ) : null}

      <div className="mt-4 space-y-4">
        {filteredUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            busy={busyKey === `user-${user.id}`}
            onStatusChange={(userId, accountStatus) => {
              void updateUserStatus(userId, accountStatus);
            }}
          />
        ))}
      </div>
    </div>
  );
}
