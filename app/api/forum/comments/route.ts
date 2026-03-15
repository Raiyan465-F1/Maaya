import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/src/db";
import { comments } from "@/src/schema/forum";
import { authOptions } from "@/lib/auth";
import { ensureCommentExists, ensurePostExists, getForumSnapshot } from "@/lib/forum-server";

function parseId(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to comment." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const postId = parseId(body.postId);
    const parentCommentId = parseId(body.parentCommentId);
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!postId) {
      return NextResponse.json({ error: "A discussion is required." }, { status: 400 });
    }

    if (content.length < 2) {
      return NextResponse.json({ error: "Comment must be at least 2 characters long." }, { status: 400 });
    }

    const post = await ensurePostExists(postId);
    if (!post) {
      return NextResponse.json({ error: "Discussion not found." }, { status: 404 });
    }

    if (parentCommentId) {
      const parent = await ensureCommentExists(parentCommentId);
      if (!parent || parent.postId !== postId) {
        return NextResponse.json({ error: "Reply target not found." }, { status: 404 });
      }
    }

    await db.insert(comments).values({
      postId,
      parentCommentId,
      authorId: session.user.id,
      content,
    });

    const data = await getForumSnapshot(session.user.id, session.user.role);
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to add your comment right now." }, { status: 500 });
  }
}
