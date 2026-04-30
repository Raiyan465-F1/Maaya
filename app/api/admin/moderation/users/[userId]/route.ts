import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getModerationSnapshot,
  getModerationUser,
  updateUserModerationStatus,
} from "@/lib/moderation-server";
import type { AccountStatus } from "@/src/schema/enums";

function parseRestrictionEndsAt(body: Record<string, unknown>): {
  endsAt: Date | null;
  error: string | null;
} {
  const indefinite = body.indefinite === true;

  if (indefinite) {
    return { endsAt: null, error: null };
  }

  const raw = body.restrictionEndsAt;
  if (typeof raw !== "string" || !raw.trim()) {
    return {
      endsAt: null,
      error: "restrictionEndsAt is required unless indefinite is true.",
    };
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return { endsAt: null, error: "Invalid restrictionEndsAt date." };
  }

  if (parsed <= new Date()) {
    return {
      endsAt: null,
      error: "restrictionEndsAt must be in the future.",
    };
  }

  return { endsAt: parsed, error: null };
}

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

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const status =
    body?.accountStatus === "pending" ||
    body?.accountStatus === "active" ||
    body?.accountStatus === "banned" ||
    body?.accountStatus === "suspended"
      ? (body.accountStatus as AccountStatus)
      : null;

  if (!status) {
    return NextResponse.json({ error: "Invalid account status." }, { status: 400 });
  }

  let restrictionEndsAt: Date | null = null;

  if (status === "banned" || status === "suspended") {
    const { endsAt, error } = parseRestrictionEndsAt(body ?? {});
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    restrictionEndsAt = endsAt;
  }

  const updated = await updateUserModerationStatus(userId, status, restrictionEndsAt);
  if (!updated) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const data = await getModerationSnapshot();
  return NextResponse.json(data);
}
