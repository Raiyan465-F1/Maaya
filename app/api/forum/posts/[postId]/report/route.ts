import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/src/db";
import { reports } from "@/src/schema/reports";
import { authOptions } from "@/lib/auth";
import { canManageContent, ensurePostExists, getForumSnapshot } from "@/lib/forum-server";

function parsePostId(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await getServerSession(authOptions);
  const postId = parsePostId((await params).postId);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to report a discussion." }, { status: 401 });
  }

  if (!postId) {
    return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
  }

  const existing = await ensurePostExists(postId);
  if (!existing) {
    return NextResponse.json({ error: "Discussion not found." }, { status: 404 });
  }

  if (canManageContent(session.user.id, session.user.role, existing.authorId, existing.anonymousOwnerHash)) {
    return NextResponse.json({ error: "You cannot report your own discussion." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";

    if (reason.length < 5) {
      return NextResponse.json({ error: "Please provide a short reason for the report." }, { status: 400 });
    }

    await db.insert(reports).values({
      reporterId: session.user.id,
      postId,
      reason,
    });

    const data = await getForumSnapshot(session.user.id, session.user.role);
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to submit the report right now." }, { status: 500 });
  }
}
