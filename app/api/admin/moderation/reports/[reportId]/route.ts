import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getModerationSnapshot, updateReportStatus } from "@/lib/moderation-server";

function parseReportId(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const session = await getServerSession(authOptions);
  const reportId = parseReportId((await params).reportId);

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Only admins can update reports." }, { status: 403 });
  }

  if (!reportId) {
    return NextResponse.json({ error: "Invalid report id." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const status = body?.status === "pending" ? "pending" : body?.status === "reviewed" ? "reviewed" : null;

  if (!status) {
    return NextResponse.json({ error: "Invalid report status." }, { status: 400 });
  }

  const updated = await updateReportStatus(reportId, status);
  if (!updated) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  const data = await getModerationSnapshot();
  return NextResponse.json(data);
}
