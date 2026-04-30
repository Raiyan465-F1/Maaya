import type { AccountStatus } from "@/src/schema/enums";

/** Safe for Client Components — no DB or Node-only APIs. */

export function isSuspendedAndActive(
  accountStatus: AccountStatus | string | null | undefined,
  restrictionEndsAt: Date | string | null | undefined
): boolean {
  if (accountStatus !== "suspended") return false;
  if (!restrictionEndsAt) return true;
  const end = restrictionEndsAt instanceof Date ? restrictionEndsAt : new Date(restrictionEndsAt);
  if (Number.isNaN(end.getTime())) return true;
  return end > new Date();
}

/** Human-readable time remaining until restriction lifts (for UI). */
export function formatRestrictionRemaining(
  restrictionEndsAt: string | Date | null | undefined
): string {
  if (!restrictionEndsAt) {
    return "until an administrator restores your access.";
  }
  const end =
    restrictionEndsAt instanceof Date
      ? restrictionEndsAt
      : new Date(restrictionEndsAt);
  if (Number.isNaN(end.getTime())) {
    return "for a limited period.";
  }
  const ms = end.getTime() - Date.now();
  if (ms <= 0) return "ending momentarily.";
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  if (days > 0) return `for ${days} day${days === 1 ? "" : "s"} and ${hours} hour${hours === 1 ? "" : "s"} (${end.toLocaleString()})`;
  if (hours > 0) return `for ${hours} hour${hours === 1 ? "" : "s"} and ${minutes} minute${minutes === 1 ? "" : "s"} (${end.toLocaleString()})`;
  return `for ${minutes} more minute${minutes === 1 ? "" : "s"} (${end.toLocaleString()})`;
}
