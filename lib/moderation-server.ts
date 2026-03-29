import { desc, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { comments, forumPosts } from "@/src/schema/forum";
import { reports } from "@/src/schema/reports";
import { users } from "@/src/schema/users";
import type { AccountStatus, ContentStatus, ReportStatus, UserRole } from "@/src/schema/enums";
import { buildAnonymousOwnerHash } from "@/lib/forum-server";
import type { ModerationAuthorRecord, ModerationSnapshot, ModerationUserRecord } from "@/lib/moderation-types";

function toIsoString(value: Date | string | null | undefined) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return new Date(value).toISOString();
  return new Date().toISOString();
}

function buildAuthorRecord(user: {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  accountStatus: AccountStatus | null;
} | null | undefined): ModerationAuthorRecord | null {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    role: user.role,
    accountStatus: user.accountStatus ?? null,
  };
}

export async function getModerationSnapshot(): Promise<ModerationSnapshot> {
  const [userRows, postRows, commentRows, reportRows] = await Promise.all([
    db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        accountStatus: users.accountStatus,
        createdAt: users.createdAt,
      })
      .from(users),
    db
      .select({
        id: forumPosts.id,
        authorId: forumPosts.authorId,
        anonymousOwnerHash: forumPosts.anonymousOwnerHash,
        title: forumPosts.title,
        content: forumPosts.content,
        isAnonymous: forumPosts.isAnonymous,
        status: forumPosts.status,
      })
      .from(forumPosts),
    db
      .select({
        id: comments.id,
        postId: comments.postId,
        authorId: comments.authorId,
        content: comments.content,
        status: comments.status,
      })
      .from(comments),
    db.select().from(reports).orderBy(desc(reports.createdAt)),
  ]);

  const usersById = new Map(userRows.map((user) => [user.id, user] as const));
  const usersByAnonymousHash = new Map(userRows.map((user) => [buildAnonymousOwnerHash(user.id), user] as const));
  const postsById = new Map(postRows.map((post) => [post.id, post] as const));
  const commentsById = new Map(commentRows.map((comment) => [comment.id, comment] as const));

  const userSummaries = new Map<string, ModerationUserRecord>(
    userRows.map((user) => [
      user.id,
      {
        id: user.id,
        email: user.email,
        name: user.name ?? null,
        role: user.role,
        accountStatus: user.accountStatus ?? null,
        createdAt: toIsoString(user.createdAt),
        postCount: 0,
        anonymousPostCount: 0,
        commentCount: 0,
        pendingReports: 0,
        reviewedReports: 0,
      },
    ]),
  );

  for (const post of postRows) {
    const resolvedAuthor =
      (post.authorId ? usersById.get(post.authorId) : null) ??
      (post.anonymousOwnerHash ? usersByAnonymousHash.get(post.anonymousOwnerHash) : null);

    if (!resolvedAuthor) continue;

    const summary = userSummaries.get(resolvedAuthor.id);
    if (!summary) continue;

    summary.postCount += 1;
    if (post.isAnonymous) {
      summary.anonymousPostCount += 1;
    }
  }

  for (const comment of commentRows) {
    const summary = userSummaries.get(comment.authorId);
    if (summary) {
      summary.commentCount += 1;
    }
  }

  const normalizedReports = reportRows.map((report) => {
    const reporter = usersById.get(report.reporterId) ?? null;

    if (report.commentId) {
      const comment = commentsById.get(report.commentId) ?? null;
      const parentPost = comment ? postsById.get(comment.postId) ?? null : null;
      const author = comment ? usersById.get(comment.authorId) ?? null : null;

      if (author) {
        const summary = userSummaries.get(author.id);
        if (summary) {
          if (report.status === "reviewed") summary.reviewedReports += 1;
          else summary.pendingReports += 1;
        }
      }

      return {
        id: report.id,
        status: report.status ?? "pending",
        reason: report.reason,
        createdAt: toIsoString(report.createdAt),
        reporter: reporter
          ? {
              id: reporter.id,
              email: reporter.email,
              name: reporter.name ?? null,
            }
          : null,
        targetType: "comment" as const,
        target: comment
          ? {
              id: comment.id,
              status: comment.status ?? "active",
              title: null,
              content: comment.content,
              postId: comment.postId,
              postTitle: parentPost?.title ?? null,
              isAnonymous: false,
              author: buildAuthorRecord(author),
            }
          : null,
      };
    }

    const post = report.postId ? postsById.get(report.postId) ?? null : null;
    const author =
      (post?.authorId ? usersById.get(post.authorId) : null) ??
      (post?.anonymousOwnerHash ? usersByAnonymousHash.get(post.anonymousOwnerHash) : null) ??
      null;

    if (author) {
      const summary = userSummaries.get(author.id);
      if (summary) {
        if (report.status === "reviewed") summary.reviewedReports += 1;
        else summary.pendingReports += 1;
      }
    }

    return {
      id: report.id,
      status: report.status ?? "pending",
      reason: report.reason,
      createdAt: toIsoString(report.createdAt),
      reporter: reporter
        ? {
            id: reporter.id,
            email: reporter.email,
            name: reporter.name ?? null,
          }
        : null,
      targetType: "post" as const,
      target: post
        ? {
            id: post.id,
            status: post.status ?? "active",
            title: post.title,
            content: post.content,
            postId: post.id,
            postTitle: post.title,
            isAnonymous: Boolean(post.isAnonymous),
            author: buildAuthorRecord(author),
          }
        : null,
    };
  });

  const normalizedUsers = [...userSummaries.values()].sort((left, right) => {
    if (right.pendingReports !== left.pendingReports) {
      return right.pendingReports - left.pendingReports;
    }

    if (right.reviewedReports !== left.reviewedReports) {
      return right.reviewedReports - left.reviewedReports;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });

  return {
    reports: normalizedReports,
    users: normalizedUsers,
  };
}

export async function updateReportStatus(reportId: number, status: ReportStatus) {
  const [existing] = await db
    .select({ id: reports.id })
    .from(reports)
    .where(eq(reports.id, reportId))
    .limit(1);

  if (!existing) return false;

  await db.update(reports).set({ status }).where(eq(reports.id, reportId));
  return true;
}

export async function updatePostModerationStatus(postId: number, status: ContentStatus) {
  const [existing] = await db
    .select({ id: forumPosts.id })
    .from(forumPosts)
    .where(eq(forumPosts.id, postId))
    .limit(1);

  if (!existing) return false;

  await db
    .update(forumPosts)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(forumPosts.id, postId));

  await db.update(reports).set({ status: "reviewed" }).where(eq(reports.postId, postId));
  return true;
}

export async function updateCommentModerationStatus(commentId: number, status: ContentStatus) {
  const [existing] = await db
    .select({ id: comments.id })
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1);

  if (!existing) return false;

  await db
    .update(comments)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(comments.id, commentId));

  await db.update(reports).set({ status: "reviewed" }).where(eq(reports.commentId, commentId));
  return true;
}

export async function getModerationUser(userId: string) {
  const [user] = await db
    .select({
      id: users.id,
      role: users.role,
      accountStatus: users.accountStatus,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
}

export async function updateUserModerationStatus(userId: string, status: AccountStatus) {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!existing) return false;

  await db
    .update(users)
    .set({
      accountStatus: status,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return true;
}
