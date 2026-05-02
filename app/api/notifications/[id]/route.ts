import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { markNotificationReadState } from "@/lib/notifications";
import { authOptions } from "@/lib/auth";

function parseNotificationId(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notificationId = parseNotificationId((await params).id);
  if (!notificationId) {
    return NextResponse.json({ error: "Invalid notification id" }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as
    | { isRead?: unknown; isArchived?: unknown }
    | null;

  if (
    typeof body?.isRead !== "boolean" &&
    typeof body?.isArchived !== "boolean"
  ) {
    return NextResponse.json(
      { error: "Provide isRead and/or isArchived as booleans" },
      { status: 400 },
    );
  }

  const updated = await markNotificationReadState({
    userId: session.user.id,
    notificationId,
    isRead: typeof body?.isRead === "boolean" ? body.isRead : undefined,
    isArchived:
      typeof body?.isArchived === "boolean" ? body.isArchived : undefined,
  });

  if (!updated) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
