import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { suspendedMutationBlockedResponse } from "@/lib/suspended-mutation";
import {
  canAccessModeratedContent,
  ensureCommentExists,
  getCommentVoteSnapshot,
  toggleVoteForComment,
} from "@/lib/forum-server";
import type { VoteType } from "@/src/schema/enums";

function parseCommentId(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await getServerSession(authOptions);
  const commentId = parseCommentId((await params).commentId);
  const body = await request.json().catch(() => null);
  const voteType: VoteType = body?.voteType === "downvote" ? "downvote" : "upvote";

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to vote." }, { status: 401 });
  }

  const blocked = suspendedMutationBlockedResponse(session, request.headers.get("origin"));
  if (blocked) return blocked;

  if (!commentId) {
    return NextResponse.json({ error: "Invalid comment id." }, { status: 400 });
  }

  const existing = await ensureCommentExists(commentId);
  if (!existing || !canAccessModeratedContent(session.user.role, existing.status)) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }

  await toggleVoteForComment(commentId, session.user.id, voteType);

  const data = await getCommentVoteSnapshot(commentId, session.user.id);
  return NextResponse.json(data);
}
