import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { markAllNotificationsRead } from "@/lib/notifications";
import { authOptions } from "@/lib/auth";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updatedCount = await markAllNotificationsRead(session.user.id);

  return NextResponse.json({ updatedCount });
}
