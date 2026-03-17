import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/src/db";
import { reports } from "@/src/schema/reports";
import { authOptions } from "@/lib/auth";
import { canManageContent, ensureCommentExists, getForumSnapshot } from "@/lib/forum-server";

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

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to report a comment." }, { status: 401 });
  }

  if (!commentId) {
    return NextResponse.json({ error: "Invalid comment id." }, { status: 400 });
  }

  const existing = await ensureCommentExists(commentId);
  if (!existing) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }

  if (canManageContent(session.user.id, session.user.role, existing.authorId)) {
    return NextResponse.json({ error: "You cannot report your own comment." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";

    if (reason.length < 5) {
      return NextResponse.json({ error: "Please provide a short reason for the report." }, { status: 400 });
    }

    await db.insert(reports).values({
      reporterId: session.user.id,
      commentId,
      reason,
    });

    const data = await getForumSnapshot(session.user.id, session.user.role);
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to submit the report right now." }, { status: 500 });
  }
}
