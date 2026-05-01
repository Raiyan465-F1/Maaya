"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import type { AlertType, NotificationPriority } from "@/src/schema/enums";

type NotificationFilter = "all" | "unread" | "archived";

type NotificationItem = {
  id: number;
  type: AlertType;
  title: string;
  message: string;
  linkHref: string | null;
  eventCount: number;
  priority: NotificationPriority;
  isRead: boolean;
  isSeen: boolean;
  isArchived: boolean;
  createdAt: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function typeLabel(type: AlertType) {
  switch (type) {
    case "doctor_response":
      return "Doctor response";
    case "question_assigned":
      return "Question assigned";
    case "forum_comment":
      return "Forum comment";
    case "forum_reply":
      return "Forum reply";
    case "moderation_update":
      return "Moderation";
    case "account_update":
      return "Account";
    case "article_update":
      return "Article update";
    case "reminder":
      return "Reminder";
    case "reply":
      return "Reply";
    default:
      return "System";
  }
}

function emitNotificationsChanged() {
  window.dispatchEvent(new Event("notifications:changed"));
}

export function NotificationsCenter({
  initialNotifications,
  initialUnreadCount,
  initialUnseenCount,
}: {
  initialNotifications: NotificationItem[];
  initialUnreadCount: number;
  initialUnseenCount: number;
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [unseenCount, setUnseenCount] = useState(initialUnseenCount);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [isPending, startTransition] = useTransition();

  const visibleNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((item) => !item.isArchived && !item.isRead);
    }

    if (filter === "archived") {
      return notifications.filter((item) => item.isArchived);
    }

    return notifications.filter((item) => !item.isArchived);
  }, [filter, notifications]);

  function syncCounts(items: NotificationItem[]) {
    return items.reduce(
      (totals, item) => ({
        unread: totals.unread + (!item.isArchived && !item.isRead ? 1 : 0),
        unseen: totals.unseen + (!item.isArchived && !item.isSeen ? 1 : 0),
      }),
      { unread: 0, unseen: 0 },
    );
  }

  useEffect(() => {
    const source = new EventSource("/api/notifications/stream");

    const handleNotifications = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data) as {
          notifications?: NotificationItem[];
          unreadCount?: number;
          unseenCount?: number;
        };

        if (Array.isArray(data.notifications)) {
          setNotifications((current) => {
            const archived = current.filter((item) => item.isArchived);
            const activeNotifications = data.notifications as NotificationItem[];
            const merged = [...activeNotifications];
            for (const item of archived) {
              if (!merged.some((active) => active.id === item.id)) {
                merged.push(item);
              }
            }
            merged.sort(
              (left, right) =>
                new Date(right.createdAt).getTime() -
                new Date(left.createdAt).getTime(),
            );
            return merged;
          });
        }
        if (typeof data.unreadCount === "number") {
          setUnreadCount(data.unreadCount);
        }
        if (typeof data.unseenCount === "number") {
          setUnseenCount(data.unseenCount);
        }
        emitNotificationsChanged();
      } catch {
        // ignore malformed events
      }
    };

    source.addEventListener("notifications", handleNotifications as EventListener);

    return () => {
      source.removeEventListener("notifications", handleNotifications as EventListener);
      source.close();
    };
  }, []);

  function toggleReadState(notificationId: number, isRead: boolean) {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isRead }),
        });

        const data = (await response.json().catch(() => null)) as
          | NotificationItem
          | { error?: string }
          | null;

        if (!response.ok) {
          toast.error(
            data && "error" in data ? data.error ?? "Unable to update notification." : "Unable to update notification.",
          );
          return;
        }

        setNotifications((current) => {
          const next = current.map((item) =>
            item.id === notificationId && data && "id" in data ? data : item,
          );
          const counts = syncCounts(next);
          setUnreadCount(counts.unread);
          setUnseenCount(counts.unseen);
          return next;
        });
        emitNotificationsChanged();
      } catch {
        toast.error("Unable to update notification right now.");
      }
    });
  }

  function markAllRead() {
    startTransition(async () => {
      try {
        const response = await fetch("/api/notifications/read-all", {
          method: "POST",
        });

        const data = (await response.json().catch(() => null)) as
          | { updatedCount?: number; error?: string }
          | null;

        if (!response.ok) {
          toast.error(data?.error ?? "Unable to mark notifications as read.");
          return;
        }

        setNotifications((current) =>
          current.map((item) => ({
            ...item,
            isRead: true,
            isSeen: true,
          })),
        );
        setUnreadCount(0);
        setUnseenCount(0);
        emitNotificationsChanged();
        if ((data?.updatedCount ?? 0) > 0) {
          toast.success("All notifications marked as read.");
        }
      } catch {
        toast.error("Unable to mark notifications as read right now.");
      }
    });
  }

  function toggleArchivedState(notificationId: number, isArchived: boolean) {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isArchived }),
        });

        const data = (await response.json().catch(() => null)) as
          | NotificationItem
          | { error?: string }
          | null;

        if (!response.ok) {
          toast.error(
            data && "error" in data ? data.error ?? "Unable to update notification." : "Unable to update notification.",
          );
          return;
        }

        setNotifications((current) => {
          const next = current.map((item) =>
            item.id === notificationId && data && "id" in data ? data : item,
          );
          const counts = syncCounts(next);
          setUnreadCount(counts.unread);
          setUnseenCount(counts.unseen);
          return next;
        });
        emitNotificationsChanged();
      } catch {
        toast.error("Unable to update notification right now.");
      }
    });
  }

  function priorityClasses(priority: NotificationPriority) {
    if (priority === "high") {
      return "bg-rose-100 text-rose-700";
    }
    if (priority === "low") {
      return "bg-slate-100 text-slate-600";
    }
    return "bg-amber-100 text-amber-700";
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-3 font-mono text-xs tracking-widest text-primary uppercase">
          Notification Center
        </p>
        <h1 className="mb-2 font-heading text-3xl font-bold tracking-tight text-foreground">
          In-app{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text italic text-transparent">
            notifications
          </span>
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Track replies, moderation updates, forum activity, and system notices in one inbox.
        </p>
      </div>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filter === "unread"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("archived")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filter === "archived"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Archived ({notifications.filter((item) => item.isArchived).length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {unseenCount} new in this session
            </span>
            <button
              type="button"
              onClick={markAllRead}
              disabled={isPending || unreadCount === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {visibleNotifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground">
              {filter === "unread"
                ? "You're caught up. No unread notifications right now."
                : "No notifications yet."}
            </div>
          ) : null}

          {visibleNotifications.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-2xl border p-5 transition-colors ${
                notification.isRead
                  ? "border-border bg-background"
                  : "border-primary/20 bg-primary/5"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {typeLabel(notification.type)}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-medium ${priorityClasses(notification.priority)}`}
                    >
                      {notification.priority}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                        notification.isRead
                          ? "bg-slate-100 text-slate-600"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {notification.isRead ? "Read" : "Unread"}
                    </span>
                  </div>
                  <h2 className="mt-3 text-lg font-semibold text-foreground">
                    {notification.title}
                  </h2>
                  {notification.eventCount > 1 ? (
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
                      {notification.eventCount} grouped updates
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm leading-7 text-foreground">
                    {notification.message}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>

                <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
                  <button
                    type="button"
                    onClick={() => toggleReadState(notification.id, !notification.isRead)}
                    disabled={isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {notification.isRead ? (
                      <>
                        <Bell className="h-4 w-4" />
                        Mark unread
                      </>
                    ) : (
                      <>
                        <BellOff className="h-4 w-4" />
                        Mark read
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      toggleArchivedState(notification.id, !notification.isArchived)
                    }
                    disabled={isPending}
                    className="inline-flex items-center justify-center rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {notification.isArchived ? "Restore" : "Archive"}
                  </button>
                  {notification.linkHref ? (
                    <Link
                      href={notification.linkHref}
                      className="inline-flex items-center justify-center rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      Open
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
