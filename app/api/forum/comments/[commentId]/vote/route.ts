import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ensureCommentExists, getForumSnapshot, toggleUpvoteForComment } from "@/lib/forum-server";

function parseCommentId(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await getServerSession(authOptions);
  const commentId = parseCommentId((await params).commentId);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to vote." }, { status: 401 });
  }

  if (!commentId) {
    return NextResponse.json({ error: "Invalid comment id." }, { status: 400 });
  }

  const existing = await ensureCommentExists(commentId);
  if (!existing) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }

  await toggleUpvoteForComment(commentId, session.user.id);

  const data = await getForumSnapshot(session.user.id, session.user.role);
  return NextResponse.json(data);
}
