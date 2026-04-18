import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/src/db";
import { cycleLogs } from "@/src/schema";
import { authOptions } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

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

    const startOrEnd = new Date(startDate);
    const pLength = predictedCycleLength ? parseInt(predictedCycleLength) : 28;

    // Check for an active open cycle
    const logs = await db
      .select()
      .from(cycleLogs)
      .where(eq(cycleLogs.userId, session.user.id))
      .orderBy(desc(cycleLogs.startDate))
      .limit(1);

    const latestCycle = logs[0];

    if (latestCycle && !latestCycle.endDate) {
      // User is currently in "menstrual state". This second click logs the END of the cycle.
      const diffTime = Math.abs(startOrEnd.getTime() - new Date(latestCycle.startDate).getTime());
      const actualCycleLength = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // In this specific implementation, actualCycleLength tracks the length between start and end of bleeding.

      const [updated] = await db
        .update(cycleLogs)
        .set({
          endDate: startOrEnd.toISOString()
        })
        .where(eq(cycleLogs.id, latestCycle.id))
        .returning();
        
      return NextResponse.json({ cycleLog: updated, state: "closed" }, { status: 200 });
    } else {
      // User is NOT in a menstrual state. This click starts a NEW cycle.
      const predictedEndDate = new Date(startOrEnd);
      predictedEndDate.setDate(predictedEndDate.getDate() + pLength);

      const [inserted] = await db
        .insert(cycleLogs)
        .values({
          userId: session.user.id,
          startDate: startOrEnd.toISOString(),
          endDate: null,
          cyclePhase: "Menstrual",
          predictedCycleLength: pLength,
          predictedStartDate: startOrEnd.toISOString(),
          predictedEndDate: predictedEndDate.toISOString(),
        })
        .returning();

      return NextResponse.json({ cycleLog: inserted, state: "started" }, { status: 200 });
    }
  } catch (error) {
    console.error("POST cycle-tracking error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
