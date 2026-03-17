import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getModerationSnapshot, updateCommentModerationStatus } from "@/lib/moderation-server";

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

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Only admins can moderate comments." }, { status: 403 });
  }

  if (!commentId) {
    return NextResponse.json({ error: "Invalid comment id." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const status =
    body?.status === "active" || body?.status === "hidden" || body?.status === "removed"
      ? body.status
      : null;

  if (!status) {
    return NextResponse.json({ error: "Invalid content status." }, { status: 400 });
  }

  const updated = await updateCommentModerationStatus(commentId, status);
  if (!updated) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }

  const data = await getModerationSnapshot();
  return NextResponse.json(data);
}
