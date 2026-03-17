import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getModerationSnapshot } from "@/lib/moderation-server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Only admins can access moderation data." }, { status: 403 });
  }

  const data = await getModerationSnapshot();
  return NextResponse.json(data);
}
