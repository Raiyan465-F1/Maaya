import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getModerationSnapshot,
  getModerationUser,
  updateUserModerationStatus,
} from "@/lib/moderation-server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = (await params).userId;

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Only admins can manage user accounts." }, { status: 403 });
  }

  if (!userId) {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
  }

  const targetUser = await getModerationUser(userId);
  if (!targetUser) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (targetUser.id === session.user.id) {
    return NextResponse.json({ error: "You cannot change your own account status here." }, { status: 400 });
  }

  if (targetUser.role === "admin") {
    return NextResponse.json({ error: "Admin accounts cannot be changed from moderation." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const status =
    body?.accountStatus === "pending" ||
    body?.accountStatus === "active" ||
    body?.accountStatus === "banned" ||
    body?.accountStatus === "suspended"
      ? body.accountStatus
      : null;

  if (!status) {
    return NextResponse.json({ error: "Invalid account status." }, { status: 400 });
  }

  const updated = await updateUserModerationStatus(userId, status);
  if (!updated) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const data = await getModerationSnapshot();
  return NextResponse.json(data);
}
