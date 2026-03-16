import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { sql } from "@/src/db";
import { authOptions } from "@/lib/auth";
import { getForumSnapshot, replacePostMedia, sanitizeMedia } from "@/lib/forum-server";
import { FORUM_TAG_LIMIT } from "@/lib/forum-types";

function parseTags(input: unknown) {
  if (!Array.isArray(input)) return [];

  return [...new Set(
    input
      .map((item) => (typeof item === "string" ? item.trim().toLowerCase() : ""))
      .filter(Boolean)
  )].slice(0, FORUM_TAG_LIMIT);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const data = await getForumSnapshot(session?.user?.id ?? null, session?.user?.role ?? null);

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to create a discussion." }, { status: 401 });
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

    const createdRows = await sql`
      insert into forum_posts (author_id, title, content, tags, is_anonymous)
      values (${session.user.id}, ${title}, ${content}, ${tags}, ${isAnonymous})
      returning post_id
    `;

    const createdId = Number(createdRows[0]?.post_id);
    if (!Number.isFinite(createdId)) {
      throw new Error("Post creation did not return an id.");
    }

    if (media.length) await replacePostMedia(createdId, media);

    const data = await getForumSnapshot(session.user.id, session.user.role);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Forum create error:", error);
    return NextResponse.json({ error: "Unable to create the discussion right now." }, { status: 500 });
  }
}
