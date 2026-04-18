import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/src/db";
import { cycleLogs, cycleStageTips } from "@/src/schema";
import { authOptions } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

const MOOD_PREDICTIONS: Record<string, string> = {
  "Menstrual": "You might feel tired, introspective, or experience mild discomfort. Rest and be gentle with yourself.",
  "Follicular": "Your energy levels and mood are likely rising. You might feel more creative, upbeat, and outgoing.",
  "Ovulation": "You're likely at your most energetic and confident. Great time for socializing and intense workouts.",
  "Luteal": "You might experience a dip in energy, potential PMS symptoms, and crave nesting or quiet time."
};

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
      .orderBy(desc(cycleLogs.startDate));

    if (!logs || logs.length === 0) {
      return NextResponse.json({ hasData: false, message: "No cycles logged yet." }, { status: 200 });
    }

    const latestCycle = logs[0];
    const today = new Date();
    const start = new Date(latestCycle.startDate);
    
    // Calculate days since the start of the latest cycle
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const dayOfCycle = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    let currentPhase = "Menstrual";
    if (dayOfCycle > 5 && dayOfCycle <= 13) currentPhase = "Follicular";
    else if (dayOfCycle === 14) currentPhase = "Ovulation";
    else if (dayOfCycle > 14 && dayOfCycle <= 28) currentPhase = "Luteal";
    else if (dayOfCycle > 28) currentPhase = "Luteal"; // Late cycle

    // Expected mood based on Phase
    const expectedMood = MOOD_PREDICTIONS[currentPhase] || "Stable";

    // Fetch tips for this phase
    const tips = await db
      .select()
      .from(cycleStageTips)
      .where(eq(cycleStageTips.phase, currentPhase));

    return NextResponse.json({
      hasData: true,
      currentPhase,
      dayOfCycle,
      expectedMood,
      recommendations: tips.length > 0 ? tips : [{ tipTitle: "Rest and Hydrate", tipDescription: "Listen to your body today." }],
      latestCycle: {
        startDate: latestCycle.startDate,
        endDate: latestCycle.endDate,
        predictedEndDate: latestCycle.predictedEndDate
      }
    }, { status: 200 });

  } catch (error) {
    console.error("GET cycle analytics error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
