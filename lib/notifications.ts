import {
  and,
  count,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  or,
  type SQL,
} from "drizzle-orm";
import { buildAnonymousOwnerHash } from "@/lib/forum-server";
import { db } from "@/src/db";
import { alerts, forumPosts, users } from "@/src/schema";
import type {
  AlertType,
  NotificationPriority,
} from "@/src/schema/enums";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export type NotificationFilter = "all" | "unread" | "archived";
export type NotificationCategory =
  | "doctor_help"
  | "forum_activity"
  | "moderation"
  | "system";

export interface AppNotification {
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
}

type CreateNotificationInput = {
  userId: string | null | undefined;
  type: AlertType;
  category: NotificationCategory;
  title: string;
  message: string;
  linkHref?: string | null;
  scheduledAt?: Date | null;
  actorUserId?: string | null;
  priority?: NotificationPriority;
  eventKey?: string | null;
};

type NotificationPreferenceRow = {
  id: string;
  notifyDoctorHelp: boolean;
  notifyForumActivity: boolean;
  notifyModeration: boolean;
  notifySystem: boolean;
};

function normalizeLimit(limit: number | undefined) {
  if (!Number.isFinite(limit)) return DEFAULT_LIMIT;
  return Math.min(Math.max(Math.trunc(limit ?? DEFAULT_LIMIT), 1), MAX_LIMIT);
}

function unreadCondition() {
  return or(eq(alerts.isRead, false), isNull(alerts.isRead)) ?? eq(alerts.isRead, false);
}

function archivedCondition() {
  return isNotNull(alerts.archivedAt);
}

function activeCondition() {
  return isNull(alerts.archivedAt);
}

function unseenCondition() {
  return isNull(alerts.seenAt);
}

function serializeNotification(item: typeof alerts.$inferSelect): AppNotification {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    message: item.message,
    linkHref: item.linkHref ?? null,
    eventCount: item.eventCount ?? 1,
    priority: item.priority,
    isRead: item.isRead ?? false,
    isSeen: Boolean(item.seenAt),
    isArchived: Boolean(item.archivedAt),
    createdAt: item.createdAt.toISOString(),
  };
}

function categoryAllowed(
  preferences: NotificationPreferenceRow | undefined,
  category: NotificationCategory,
) {
  if (!preferences) return false;

  switch (category) {
    case "doctor_help":
      return preferences.notifyDoctorHelp;
    case "forum_activity":
      return preferences.notifyForumActivity;
    case "moderation":
      return preferences.notifyModeration;
    default:
      return preferences.notifySystem;
  }
}

async function getNotificationPreferences(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, NotificationPreferenceRow>();
  }

  const rows = await db
    .select({
      id: users.id,
      notifyDoctorHelp: users.notifyDoctorHelp,
      notifyForumActivity: users.notifyForumActivity,
      notifyModeration: users.notifyModeration,
      notifySystem: users.notifySystem,
    })
    .from(users)
    .where(inArray(users.id, userIds));

  return new Map(rows.map((row) => [row.id, row] as const));
}

async function upsertNotification(row: {
  userId: string;
  type: AlertType;
  title: string;
  message: string;
  linkHref: string | null;
  scheduledAt: Date | null;
  priority: NotificationPriority;
  eventKey: string | null;
}) {
  if (row.eventKey) {
    const [existing] = await db
      .select()
      .from(alerts)
      .where(
        and(
          eq(alerts.userId, row.userId),
          eq(alerts.eventKey, row.eventKey),
          activeCondition(),
          unreadCondition(),
        ),
      )
      .orderBy(desc(alerts.createdAt))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(alerts)
        .set({
          type: row.type,
          title: row.title,
          message: row.message,
          linkHref: row.linkHref,
          scheduledAt: row.scheduledAt,
          priority: row.priority,
          eventCount: (existing.eventCount ?? 1) + 1,
          isRead: false,
          seenAt: null,
          archivedAt: null,
          createdAt: new Date(),
        })
        .where(eq(alerts.id, existing.id))
        .returning();

      return updated ?? null;
    }
  }

  const [created] = await db
    .insert(alerts)
    .values({
      userId: row.userId,
      type: row.type,
      title: row.title,
      message: row.message,
      linkHref: row.linkHref,
      scheduledAt: row.scheduledAt,
      priority: row.priority,
      eventKey: row.eventKey,
      eventCount: 1,
    })
    .returning();

  return created ?? null;
}

export async function createNotifications(inputs: CreateNotificationInput[]) {
  const filtered = inputs
    .filter((input): input is CreateNotificationInput & { userId: string } => Boolean(input.userId))
    .filter((input) => input.userId !== input.actorUserId);

  if (filtered.length === 0) {
    return [];
  }

  const preferenceMap = await getNotificationPreferences(
    Array.from(new Set(filtered.map((item) => item.userId))),
  );

  const deliverable = filtered.filter((input) =>
    categoryAllowed(preferenceMap.get(input.userId), input.category),
  );

  if (deliverable.length === 0) {
    return [];
  }

  const created: Array<typeof alerts.$inferSelect> = [];

  try {
    for (const item of deliverable) {
      const row = await upsertNotification({
        userId: item.userId,
        type: item.type,
        title: item.title,
        message: item.message,
        linkHref: item.linkHref ?? null,
        scheduledAt: item.scheduledAt ?? null,
        priority: item.priority ?? "normal",
        eventKey: item.eventKey ?? null,
      });

      if (row) {
        created.push(row);
      }
    }
  } catch (error) {
    console.error("Notification insert failed:", error);
    return [];
  }

  return created;
}

export async function createNotification(input: CreateNotificationInput) {
  const [created] = await createNotifications([input]);
  return created ?? null;
}

export async function getAdminUserIds(excludeUserId?: string | null) {
  const adminRows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "admin"));

  return adminRows
    .map((row) => row.id)
    .filter((id) => (excludeUserId ? id !== excludeUserId : true));
}

export async function getUserDisplayLabel(userId: string | null | undefined) {
  if (!userId) return null;

  const [user] = await db
    .select({
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return null;

  if (user.name?.trim()) {
    return user.name.trim();
  }

  return user.email;
}

export async function resolveUserIdFromAuthorOrAnonymous(
  authorId: string | null | undefined,
  anonymousOwnerHash: string | null | undefined,
) {
  if (authorId) return authorId;
  if (!anonymousOwnerHash) return null;

  const userRows = await db.select({ id: users.id }).from(users);
  const owner = userRows.find(
    (row) => buildAnonymousOwnerHash(row.id) === anonymousOwnerHash,
  );

  return owner?.id ?? null;
}

export async function resolveForumPostOwnerUserId(postId: number) {
  const [post] = await db
    .select({
      authorId: forumPosts.authorId,
      anonymousOwnerHash: forumPosts.anonymousOwnerHash,
    })
    .from(forumPosts)
    .where(eq(forumPosts.id, postId))
    .limit(1);

  if (!post) return null;

  return resolveUserIdFromAuthorOrAnonymous(
    post.authorId,
    post.anonymousOwnerHash,
  );
}

export async function getUnseenNotificationCount(userId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(alerts)
    .where(and(eq(alerts.userId, userId), activeCondition(), unseenCondition()));

  return Number(row?.value ?? 0);
}

export async function getUnreadNotificationCount(userId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(alerts)
    .where(and(eq(alerts.userId, userId), activeCondition(), unreadCondition()));

  return Number(row?.value ?? 0);
}

export async function markNotificationsSeen(userId: string, notificationIds: number[]) {
  if (notificationIds.length === 0) return 0;

  const updated = await db
    .update(alerts)
    .set({ seenAt: new Date() })
    .where(
      and(
        eq(alerts.userId, userId),
        inArray(alerts.id, notificationIds),
        unseenCondition(),
      ),
    )
    .returning({ id: alerts.id });

  return updated.length;
}

export async function listUserNotifications(options: {
  userId: string;
  filter?: NotificationFilter;
  limit?: number;
  types?: AlertType[];
  markSeen?: boolean;
}) {
  const { userId, filter = "all", limit, types, markSeen = false } = options;
  const conditions: SQL<unknown>[] = [eq(alerts.userId, userId)];

  if (filter === "unread") {
    conditions.push(activeCondition(), unreadCondition());
  } else if (filter === "archived") {
    conditions.push(archivedCondition());
  } else {
    conditions.push(activeCondition());
  }

  if (types && types.length > 0) {
    conditions.push(inArray(alerts.type, types));
  }

  const notifications = await db
    .select()
    .from(alerts)
    .where(and(...conditions))
    .orderBy(desc(alerts.createdAt))
    .limit(normalizeLimit(limit));

  if (markSeen) {
    await markNotificationsSeen(
      userId,
      notifications.map((item) => item.id),
    );
    notifications.forEach((item) => {
      item.seenAt = item.seenAt ?? new Date();
    });
  }

  const [unreadCount, unseenCount] = await Promise.all([
    getUnreadNotificationCount(userId),
    getUnseenNotificationCount(userId),
  ]);

  return {
    notifications: notifications.map(serializeNotification),
    unreadCount,
    unseenCount,
  };
}

export async function markNotificationReadState(options: {
  userId: string;
  notificationId: number;
  isRead?: boolean;
  isArchived?: boolean;
}) {
  const updates: Partial<typeof alerts.$inferInsert> = {};

  if (typeof options.isRead === "boolean") {
    updates.isRead = options.isRead;
    if (options.isRead) {
      updates.seenAt = new Date();
    }
  }

  if (typeof options.isArchived === "boolean") {
    updates.archivedAt = options.isArchived ? new Date() : null;
    if (options.isArchived) {
      updates.seenAt = new Date();
    }
  }

  if (Object.keys(updates).length === 0) {
    return null;
  }

  const [updated] = await db
    .update(alerts)
    .set(updates)
    .where(
      and(
        eq(alerts.id, options.notificationId),
        eq(alerts.userId, options.userId),
      ),
    )
    .returning();

  return updated ? serializeNotification(updated) : null;
}

export async function markAllNotificationsRead(userId: string) {
  const updated = await db
    .update(alerts)
    .set({ isRead: true, seenAt: new Date() })
    .where(and(eq(alerts.userId, userId), activeCondition(), unreadCondition()))
    .returning({ id: alerts.id });

  return updated.length;
}

export async function getNotificationStreamSnapshot(userId: string, limit = 25) {
  const data = await listUserNotifications({
    userId,
    limit,
  });

  return {
    notifications: data.notifications,
    unreadCount: data.unreadCount,
    unseenCount: data.unseenCount,
  };
}

export async function notifyDoctorQuestionAssigned(options: {
  doctorUserId: string;
  actorUserId: string;
  questionId: number;
  questionTitle: string;
  actorLabel?: string | null;
}) {
  return createNotification({
    userId: options.doctorUserId,
    actorUserId: options.actorUserId,
    type: "question_assigned",
    category: "doctor_help",
    title: "New Doctor's Help question assigned",
    message: `${options.actorLabel ?? "A user"} sent you "${options.questionTitle}".`,
    linkHref: `/doctors-help?question=${options.questionId}`,
    priority: "high",
    eventKey: `question-assigned:${options.questionId}`,
  });
}

export async function notifyDoctorResponse(options: {
  recipientUserId: string;
  actorUserId: string;
  questionId: number;
  questionTitle: string;
  actorLabel?: string | null;
}) {
  return createNotification({
    userId: options.recipientUserId,
    actorUserId: options.actorUserId,
    type: "doctor_response",
    category: "doctor_help",
    title: "Doctor replied to your question",
    message: `${options.actorLabel ?? "A doctor"} answered "${options.questionTitle}".`,
    linkHref: `/doctors-help/my-questions/${options.questionId}`,
    priority: "high",
    eventKey: `doctor-response:${options.questionId}`,
  });
}

export async function notifyForumComment(options: {
  recipientUserId: string | null;
  actorUserId: string;
  actorLabel?: string | null;
  postId: number;
  postTitle: string;
  commentId: number;
}) {
  return createNotification({
    userId: options.recipientUserId,
    actorUserId: options.actorUserId,
    type: "forum_comment",
    category: "forum_activity",
    title: "New comment on your discussion",
    message: `${options.actorLabel ?? "Someone"} commented on "${options.postTitle}".`,
    linkHref: `/forum?post=${options.postId}&comment=${options.commentId}`,
    priority: "normal",
    eventKey: `forum-comment:${options.postId}`,
  });
}

export async function notifyForumReply(options: {
  recipientUserId: string | null;
  actorUserId: string;
  actorLabel?: string | null;
  postId: number;
  postTitle: string;
  commentId: number;
  parentCommentId: number;
}) {
  return createNotification({
    userId: options.recipientUserId,
    actorUserId: options.actorUserId,
    type: "forum_reply",
    category: "forum_activity",
    title: "New reply to your comment",
    message: `${options.actorLabel ?? "Someone"} replied in "${options.postTitle}".`,
    linkHref: `/forum?post=${options.postId}&comment=${options.commentId}&replyTo=${options.parentCommentId}`,
    priority: "normal",
    eventKey: `forum-reply:${options.parentCommentId}`,
  });
}

export async function notifyAdminReportCreated(options: {
  actorUserId: string;
  actorLabel?: string | null;
  targetType: "post" | "comment";
  reportId?: number | null;
}) {
  const adminIds = await getAdminUserIds(options.actorUserId);
  return createNotifications(
    adminIds.map((userId) => ({
      userId,
      actorUserId: options.actorUserId,
      type: "system" as const,
      category: "system" as const,
      title: "New forum report submitted",
      message: `${options.actorLabel ?? "A community member"} reported a ${options.targetType}.`,
      linkHref: options.reportId
        ? `/admin/moderation?report=${options.reportId}`
        : "/admin/moderation",
      priority: "high" as const,
      eventKey: "admin-report-queue",
    })),
  );
}

export async function notifyQuestionStatusUpdated(options: {
  recipientUserId: string;
  actorUserId: string;
  questionId: number;
  questionTitle: string;
  status: string;
}) {
  return createNotification({
    userId: options.recipientUserId,
    actorUserId: options.actorUserId,
    type: "system",
    category: "system",
    title: "Your Doctor's Help question was updated",
    message:
      options.status === "closed"
        ? `An admin closed "${options.questionTitle}".`
        : `An admin changed "${options.questionTitle}" to ${options.status}.`,
    linkHref: `/doctors-help/my-questions/${options.questionId}`,
    priority: "high",
    eventKey: `question-status:${options.questionId}`,
  });
}

export async function notifyPostModerated(options: {
  recipientUserId: string | null;
  actorUserId?: string | null;
  postId: number;
  postTitle: string;
  status: string;
}) {
  return createNotification({
    userId: options.recipientUserId,
    actorUserId: options.actorUserId,
    type: "moderation_update",
    category: "moderation",
    title: "Your discussion was moderated",
    message: `An admin updated "${options.postTitle}" to ${options.status}.`,
    linkHref: `/forum?post=${options.postId}`,
    priority: "high",
    eventKey: `moderated-post:${options.postId}`,
  });
}

export async function notifyCommentModerated(options: {
  recipientUserId: string | null;
  actorUserId?: string | null;
  postId: number;
  commentId: number;
  status: string;
}) {
  return createNotification({
    userId: options.recipientUserId,
    actorUserId: options.actorUserId,
    type: "moderation_update",
    category: "moderation",
    title: "Your comment was moderated",
    message: `An admin updated one of your forum comments to ${options.status}.`,
    linkHref: `/forum?post=${options.postId}&comment=${options.commentId}`,
    priority: "high",
    eventKey: `moderated-comment:${options.commentId}`,
  });
}

export async function notifyAccountStatusChanged(options: {
  recipientUserId: string;
  actorUserId?: string | null;
  status: string;
  endsAt?: Date | null;
}) {
  return createNotification({
    userId: options.recipientUserId,
    actorUserId: options.actorUserId,
    type: "account_update",
    category: "moderation",
    title: "Your account status changed",
    message:
      options.status === "active"
        ? "Your account is active again."
        : options.status === "suspended"
          ? `Your account was suspended${options.endsAt ? " until the end time shown in your profile." : "."}`
          : options.status === "banned"
            ? "Your account was banned by an admin."
            : "Your account status was updated by an admin.",
    linkHref: "/profile",
    priority: "high",
    eventKey: `account-status:${options.recipientUserId}`,
  });
}
