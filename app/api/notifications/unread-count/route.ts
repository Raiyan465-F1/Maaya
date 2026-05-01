import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getUnseenNotificationCount } from "@/lib/notifications";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const unreadCount = await getUnseenNotificationCount(session.user.id);

  return NextResponse.json({ unreadCount });
}
