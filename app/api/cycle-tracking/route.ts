import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/src/db";
import { cycleLogs } from "@/src/schema";
import { authOptions } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function getInclusiveDayCount(start: Date, end: Date) {
  const startAtMidnight = new Date(start);
  startAtMidnight.setHours(0, 0, 0, 0);

  const endAtMidnight = new Date(end);
  endAtMidnight.setHours(0, 0, 0, 0);

  return Math.floor((endAtMidnight.getTime() - startAtMidnight.getTime()) / MS_PER_DAY) + 1;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const logs = await db
      .select()
      .from(cycleLogs)
      .where(eq(cycleLogs.userId, session.user.id))
      .orderBy(desc(cycleLogs.startDate))
      .limit(6);

    return NextResponse.json({ cycleLogs: logs }, { status: 200 });
  } catch (error) {
    console.error("GET cycle-tracking error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { startDate, endDate, predictedCycleLength } = body;

    if (!startDate) {
      return NextResponse.json({ error: "Start date is required." }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    const now = new Date();

    if (start > now || (end && end > now)) {
      return NextResponse.json({ error: "Dates cannot be in the future." }, { status: 400 });
    }

    const pLength = predictedCycleLength ? parseInt(predictedCycleLength) : 28;

    // Calculate actual difference if we have both start and end dates
    // Legacy column name: this stores period duration until a schema cleanup renames it.
    let actualCycleLength = null;
    let predictedDifference = null;
    
    if (end) {
      actualCycleLength = getInclusiveDayCount(start, end);
    }

    // Theoretical end date based on predicted cycle length (assuming bleeding length + full cycle length)
    // Actually predictedEndDate is when the NEXT cycle is supposed to start minus 1 day.
    const predictedEndDate = new Date(start);
    predictedEndDate.setDate(predictedEndDate.getDate() + pLength);

    const [inserted] = await db
      .insert(cycleLogs)
      .values({
        userId: session.user.id,
        startDate: start.toISOString(),
        endDate: end ? end.toISOString() : null,
        predictedCycleLength: pLength,
        actualCycleLength: actualCycleLength,
        predictedDifference: predictedDifference,
        predictedEndDate: predictedEndDate.toISOString(),
      })
      .returning();

    return NextResponse.json({ cycleLog: inserted }, { status: 200 });
  } catch (error) {
    console.error("POST cycle-tracking error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { endDate } = body;

    if (!endDate) {
      return NextResponse.json({ error: "End date is required." }, { status: 400 });
    }

    const end = new Date(endDate);
    const now = new Date();

    if (end > now) {
      return NextResponse.json({ error: "Date cannot be in the future." }, { status: 400 });
    }

    // Find the latest active cycle (no endDate)
    const logs = await db
      .select()
      .from(cycleLogs)
      .where(eq(cycleLogs.userId, session.user.id))
      .orderBy(desc(cycleLogs.startDate))
      .limit(1);

    if (logs.length === 0 || logs[0].endDate) {
      return NextResponse.json({ error: "No active cycle to end." }, { status: 400 });
    }

    const activeCycle = logs[0];
    const start = new Date(activeCycle.startDate);

    if (end < start) {
      return NextResponse.json({ error: "End date cannot be before start date." }, { status: 400 });
    }

    // Legacy column name: this stores period duration until a schema cleanup renames it.
    const actualCycleLength = getInclusiveDayCount(start, end);
    const predictedDifference = null;

    const [updated] = await db
      .update(cycleLogs)
      .set({
        endDate: end.toISOString(),
        actualCycleLength,
        predictedDifference,
      })
      .where(eq(cycleLogs.id, activeCycle.id))
      .returning();

    return NextResponse.json({ cycleLog: updated }, { status: 200 });
  } catch (error) {
    console.error("PUT cycle-tracking error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
