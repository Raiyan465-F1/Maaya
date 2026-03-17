import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getModerationSnapshot, updatePostModerationStatus } from "@/lib/moderation-server";

function parsePostId(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await getServerSession(authOptions);
  const postId = parsePostId((await params).postId);

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Only admins can moderate discussions." }, { status: 403 });
  }

  if (!postId) {
    return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const status =
    body?.status === "active" || body?.status === "hidden" || body?.status === "removed"
      ? body.status
      : null;

  if (!status) {
    return NextResponse.json({ error: "Invalid content status." }, { status: 400 });
  }

  const updated = await updatePostModerationStatus(postId, status);
  if (!updated) {
    return NextResponse.json({ error: "Discussion not found." }, { status: 404 });
  }

  const data = await getModerationSnapshot();
  return NextResponse.json(data);
}
