import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ensurePostExists, getForumSnapshot, toggleUpvoteForPost } from "@/lib/forum-server";

function parsePostId(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await getServerSession(authOptions);
  const postId = parsePostId((await params).postId);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to vote." }, { status: 401 });
  }

  if (!postId) {
    return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
  }

  const existing = await ensurePostExists(postId);
  if (!existing) {
    return NextResponse.json({ error: "Discussion not found." }, { status: 404 });
  }

  await toggleUpvoteForPost(postId, session.user.id);

  const data = await getForumSnapshot(session.user.id, session.user.role);
  return NextResponse.json(data);
}
