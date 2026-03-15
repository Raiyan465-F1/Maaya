import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/src/db";
import { forumPosts } from "@/src/schema/forum";
import { authOptions } from "@/lib/auth";
import { canManageContent, ensurePostExists, getForumSnapshot, replacePostMedia, sanitizeMedia } from "@/lib/forum-server";
import { FORUM_TAG_LIMIT } from "@/lib/forum-types";

function parsePostId(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseTags(input: unknown) {
  if (!Array.isArray(input)) return [];

  return [...new Set(
    input
      .map((item) => (typeof item === "string" ? item.trim().toLowerCase() : ""))
      .filter(Boolean)
  )].slice(0, FORUM_TAG_LIMIT);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await getServerSession(authOptions);
  const postId = parsePostId((await params).postId);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to edit a discussion." }, { status: 401 });
  }

  if (!postId) {
    return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
  }

  const existing = await ensurePostExists(postId);
  if (!existing) {
    return NextResponse.json({ error: "Discussion not found." }, { status: 404 });
  }

  if (!canManageContent(session.user.id, session.user.role, existing.authorId)) {
    return NextResponse.json({ error: "You do not have permission to edit this discussion." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const isAnonymous = Boolean(body.isAnonymous);
    const tags = parseTags(body.tags);
    const media = sanitizeMedia(body.media);

    if (title.length < 4) {
      return NextResponse.json({ error: "Title must be at least 4 characters long." }, { status: 400 });
    }

    if (content.length < 10) {
      return NextResponse.json({ error: "Post content must be at least 10 characters long." }, { status: 400 });
    }

    await db
      .update(forumPosts)
      .set({
        title,
        content,
        tags,
        isAnonymous,
        updatedAt: new Date(),
      })
      .where(eq(forumPosts.id, postId));

    await replacePostMedia(postId, media);

    const data = await getForumSnapshot(session.user.id, session.user.role);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Unable to update the discussion right now." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await getServerSession(authOptions);
  const postId = parsePostId((await params).postId);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to delete a discussion." }, { status: 401 });
  }

  if (!postId) {
    return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
  }

  const existing = await ensurePostExists(postId);
  if (!existing) {
    return NextResponse.json({ error: "Discussion not found." }, { status: 404 });
  }

  if (!canManageContent(session.user.id, session.user.role, existing.authorId)) {
    return NextResponse.json({ error: "You do not have permission to delete this discussion." }, { status: 403 });
  }

  await db.delete(forumPosts).where(and(eq(forumPosts.id, postId), eq(forumPosts.authorId, existing.authorId)));

  const data = await getForumSnapshot(session.user.id, session.user.role);
  return NextResponse.json(data);
}
