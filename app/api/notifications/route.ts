import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import {
  listUserNotifications,
  type NotificationFilter,
} from "@/lib/notifications";
import { authOptions } from "@/lib/auth";

function parseFilter(value: string | null): NotificationFilter {
  if (value === "unread") return "unread";
  if (value === "archived") return "archived";
  return "all";
}

function parseLimit(value: string | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filter = parseFilter(searchParams.get("filter"));
  const limit = parseLimit(searchParams.get("limit"));

  const data = await listUserNotifications({
    userId: session.user.id,
    filter,
    limit,
    markSeen: filter !== "archived",
  });

  return NextResponse.json(data);
}
