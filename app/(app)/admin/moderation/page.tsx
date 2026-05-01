"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import type { ModerationReportRecord, ModerationSnapshot } from "@/lib/moderation-types";
import { cn } from "@/lib/utils";

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function excerpt(value: string, limit = 220) {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit).trimEnd()}...`;
}

function badgeClass(status: string | null | undefined) {
  switch (status) {
    case "reviewed":
    case "active":
      return "border-emerald-500/20 bg-emerald-50 text-emerald-700";
    case "hidden":
    case "pending":
    case "suspended":
      return "border-amber-500/20 bg-amber-50 text-amber-700";
    case "removed":
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
  tone,
}: {
  label: string;
  value: number;
  tone: "primary" | "warning" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "from-rose-500/10 via-card to-card text-rose-700"
      : tone === "warning"
        ? "from-amber-500/10 via-card to-card text-amber-700"
        : "from-primary/10 via-card to-card text-primary";

  return (
    <div className={cn("min-w-0 rounded-2xl border border-primary/10 bg-gradient-to-br p-5", toneClass)}>
      <p className="text-xs font-medium tracking-[0.16em] uppercase">{label}</p>
      <p className="mt-3 font-mono text-4xl leading-none font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ReportCard({
  report,
  busy,
  highlighted,
  onReviewToggle,
  onContentStatusChange,
}: {
  report: ModerationReportRecord;
  busy: boolean;
  highlighted?: boolean;
  onReviewToggle: (reportId: number, status: "pending" | "reviewed") => void;
  onContentStatusChange: (report: ModerationReportRecord, status: "active" | "hidden" | "removed") => void;
}) {
  const target = report.target;
  const contentStatus = target?.status ?? null;
  const authorLabel = target?.author?.name?.trim() || target?.author?.email || "Unknown author";
  const reporterLabel = report.reporter?.name?.trim() || report.reporter?.email || "Unknown reporter";

  return (
    <div
      id={`report-${report.id}`}
      className={cn(
        "min-w-0 rounded-2xl border bg-card p-5 shadow-sm",
        highlighted
          ? "border-primary/40 ring-2 ring-primary/20"
          : "border-primary/10",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary/15 bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-primary uppercase">
              {report.targetType}
            </span>
            <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize", badgeClass(report.status))}>
              Report {report.status ?? "pending"}
            </span>
            {contentStatus ? (
              <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize", badgeClass(contentStatus))}>
                Content {contentStatus}
              </span>
            ) : null}
          </div>
          <h3 className="mt-3 break-words font-heading text-lg font-semibold text-foreground">
            {target?.title || target?.postTitle || `Reported ${report.targetType}`}
          </h3>
          <p className="mt-1 break-words text-xs text-muted-foreground">
            Submitted {formatDateTime(report.createdAt)} by {reporterLabel}
          </p>
        </div>
        <p className="max-w-sm break-words rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {report.reason}
        </p>
      </div>

      {target ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)]">
          <div className="min-w-0 rounded-2xl border border-border bg-muted/25 p-4">
            <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">Content</p>
            <p className="mt-2 break-words whitespace-pre-wrap text-sm leading-6 text-foreground/90">
              {excerpt(target.content)}
            </p>
            {report.targetType === "comment" && target.postTitle ? (
              <p className="mt-3 break-words text-xs text-muted-foreground">Discussion: {target.postTitle}</p>
            ) : null}
          </div>

          <div className="min-w-0 rounded-2xl border border-border bg-background p-4">
            <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">Author</p>
            <p className="mt-2 break-words text-sm font-medium text-foreground">{authorLabel}</p>
            <p className="break-all text-xs text-muted-foreground">{target.author?.email ?? "Anonymous owner unavailable"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {target.isAnonymous ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                  Anonymous post
                </span>
              ) : null}
              {target.author?.role ? (
                <span className="rounded-full border border-primary/15 bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-primary capitalize">
                  {target.author.role}
                </span>
              ) : null}
              {target.author?.accountStatus ? (
                <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize", badgeClass(target.author.accountStatus))}>
                  {target.author.accountStatus}
                </span>
              ) : null}
            </div>
            {target.author?.id ? (
              <Link
                href={`/admin/users#user-${target.author.id}`}
                className="mt-4 inline-flex rounded-xl border border-primary/15 px-3.5 py-2 text-sm font-medium text-primary transition hover:border-primary/30 hover:bg-primary/5"
              >
                Manage account
              </Link>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
          The reported content is no longer available in the database, but the report history is preserved.
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => onReviewToggle(report.id, report.status === "reviewed" ? "pending" : "reviewed")}
          className={cn(
            "rounded-xl border px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
            actionButtonClass(report.status === "reviewed"),
          )}
        >
          {report.status === "reviewed" ? "Reopen report" : "Mark reviewed"}
        </button>
        {target ? (
          <>
            <button
              type="button"
              disabled={busy || contentStatus === "active"}
              onClick={() => onContentStatusChange(report, "active")}
              className={cn(
                "rounded-xl border px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
                actionButtonClass(contentStatus === "active"),
              )}
            >
              Restore
            </button>
            <button
              type="button"
              disabled={busy || contentStatus === "hidden"}
              onClick={() => onContentStatusChange(report, "hidden")}
              className={cn(
                "rounded-xl border px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
                actionButtonClass(contentStatus === "hidden"),
              )}
            >
              Hide
            </button>
            <button
              type="button"
              disabled={busy || contentStatus === "removed"}
              onClick={() => onContentStatusChange(report, "removed")}
              className={cn(
                "rounded-xl border px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
                actionButtonClass(contentStatus === "removed", true),
              )}
            >
              Remove
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function ModerationPage() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [snapshot, setSnapshot] = useState<ModerationSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [reportFilter, setReportFilter] = useState<"all" | "pending" | "reviewed">("pending");

  async function fetchSnapshot() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/moderation", { cache: "no-store" });
      const data = await readJsonResponse<ModerationSnapshot>(response);

      if (!response.ok || !data) {
        setError(data?.error || "Unable to load moderation data right now.");
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

  async function mutateSnapshot(
    key: string,
    path: string,
    body: Record<string, string>,
  ) {
    setBusyKey(key);
    setError(null);

    try {
      const response = await fetch(path, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await readJsonResponse<ModerationSnapshot>(response);

      if (!response.ok || !data) {
        setError(data?.error || "Unable to save moderation changes.");
        return;
      }

      setSnapshot(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusyKey(null);
    }
  }

  const summary = useMemo(() => {
    const reports = snapshot?.reports ?? [];
    const users = snapshot?.users ?? [];

    return {
      pendingReports: reports.filter((report) => report.status !== "reviewed").length,
      reviewedReports: reports.filter((report) => report.status === "reviewed").length,
      suspendedUsers: users.filter((user) => user.accountStatus === "suspended").length,
      bannedUsers: users.filter((user) => user.accountStatus === "banned").length,
    };
  }, [snapshot]);

  const filteredReports = useMemo(() => {
    const reports = snapshot?.reports ?? [];
    if (reportFilter === "all") return reports;
    return reports.filter((report) => (reportFilter === "reviewed" ? report.status === "reviewed" : report.status !== "reviewed"));
  }, [reportFilter, snapshot]);

  const highlightedReportId = useMemo(() => {
    const raw = searchParams.get("report");
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? null : parsed;
  }, [searchParams]);

  useEffect(() => {
    if (!highlightedReportId || !snapshot) return;

    setReportFilter("all");
    const frame = window.requestAnimationFrame(() => {
      const element = document.getElementById(`report-${highlightedReportId}`);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [highlightedReportId, snapshot]);

  if (status === "authenticated" && session?.user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="mb-2 font-heading text-xl font-semibold text-foreground">Access denied</p>
        <p className="text-sm text-muted-foreground">Only admins can access moderation tools.</p>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <p className="font-mono text-xs tracking-widest text-accent uppercase">Admin</p>
      <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground">
        Content{" "}
        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text italic text-transparent">
          moderation
        </span>
      </h1>
      <p className="mt-1 mb-8 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Review reports, take action on forum posts and comments, and manage user account status.
        Anonymous post authors are resolved here for admin-only review.
      </p>

      <div className="mb-8 flex flex-wrap gap-3">
        <Link
          href="/admin/users"
          className="rounded-xl border border-primary/15 bg-card px-4 py-2.5 text-sm font-medium text-primary transition hover:border-primary/30 hover:bg-primary/5"
        >
          Open user accounts
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Pending reports" value={summary.pendingReports} tone="warning" />
        <SummaryCard label="Reviewed reports" value={summary.reviewedReports} tone="primary" />
        <SummaryCard label="Suspended users" value={summary.suspendedUsers} tone="warning" />
        <SummaryCard label="Banned users" value={summary.bannedUsers} tone="danger" />
      </div>

      <div className="mt-8">
        <section className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-foreground">Reports queue</h2>
              <p className="text-sm text-muted-foreground">
                Moderate reported forum content and close the loop on each report.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["pending", "reviewed", "all"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setReportFilter(filter)}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-sm font-medium capitalize transition",
                    reportFilter === filter
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground",
                  )}
                >
                  {filter}
                </button>
              ))}
              <button
                type="button"
                onClick={() => void fetchSnapshot()}
                disabled={isLoading}
                className="rounded-full border border-border bg-background px-3.5 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {isLoading && !snapshot ? (
            <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
              Loading moderation data...
            </div>
          ) : null}

          {!isLoading && snapshot && !filteredReports.length ? (
            <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
              No reports match the current filter.
            </div>
          ) : null}

          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              busy={busyKey === `report-${report.id}` || busyKey === `${report.targetType}-${report.target?.id ?? report.id}`}
              highlighted={highlightedReportId === report.id}
              onReviewToggle={(reportId, nextStatus) => {
                void mutateSnapshot(`report-${reportId}`, `/api/admin/moderation/reports/${reportId}`, { status: nextStatus });
              }}
              onContentStatusChange={(targetReport, nextStatus) => {
                const target = targetReport.target;
                if (!target) return;

                const basePath =
                  targetReport.targetType === "comment"
                    ? `/api/admin/moderation/comments/${target.id}`
                    : `/api/admin/moderation/posts/${target.id}`;

                void mutateSnapshot(`${targetReport.targetType}-${target.id}`, basePath, { status: nextStatus });
              }}
            />
          ))}
        </section>
      </div>
    </div>
  );
}
