import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/src/db";
import { comments } from "@/src/schema/forum";
import { authOptions } from "@/lib/auth";
import {
  canAccessModeratedContent,
  canManageContent,
  ensureCommentExists,
  getForumSnapshot,
} from "@/lib/forum-server";

function parseCommentId(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await getServerSession(authOptions);
  const commentId = parseCommentId((await params).commentId);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to edit a comment." }, { status: 401 });
  }

  if (!commentId) {
    return NextResponse.json({ error: "Invalid comment id." }, { status: 400 });
  }

  const existing = await ensureCommentExists(commentId);
  if (!existing || !canAccessModeratedContent(session.user.role, existing.status)) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }

  if (!canManageContent(session.user.id, session.user.role, existing.authorId)) {
    return NextResponse.json({ error: "You do not have permission to edit this comment." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (content.length < 2) {
      return NextResponse.json({ error: "Comment must be at least 2 characters long." }, { status: 400 });
    }

    await db
      .update(comments)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, commentId));

    const data = await getForumSnapshot(session.user.id, session.user.role);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Unable to update this comment right now." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await getServerSession(authOptions);
  const commentId = parseCommentId((await params).commentId);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to delete a comment." }, { status: 401 });
  }

  if (!commentId) {
    return NextResponse.json({ error: "Invalid comment id." }, { status: 400 });
  }

  const existing = await ensureCommentExists(commentId);
  if (!existing || !canAccessModeratedContent(session.user.role, existing.status)) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }

  if (!canManageContent(session.user.id, session.user.role, existing.authorId)) {
    return NextResponse.json({ error: "You do not have permission to delete this comment." }, { status: 403 });
  }

  await db.delete(comments).where(eq(comments.id, commentId));

  const data = await getForumSnapshot(session.user.id, session.user.role);
  return NextResponse.json(data);
}
