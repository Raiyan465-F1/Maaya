import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/src/db";
import { cycleLogs, cycleStageTips } from "@/src/schema";
import { authOptions } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

const SEED_TIPS = [
  {
    phase: "Menstrual",
    tipTitle: "Rest & Recover",
    tipDescription: "Your energy is lowest. Focus on light stretching, heat therapies, and drinking iron-rich fluids.",
  },
  {
    phase: "Follicular",
    tipTitle: "Time to Shine",
    tipDescription: "Estrogen is rising! This is the perfect time to tackle challenging tasks and engage in high-intensity workouts.",
  },
  {
    phase: "Ovulation",
    tipTitle: "Peak Power",
    tipDescription: "You're at your most energetic and sociable. Stay hydrated and enjoy your peak communication skills.",
  },
  {
    phase: "Luteal",
    tipTitle: "Wind Down",
    tipDescription: "Progesterone is high, which may cause fatigue. Prioritize self-care, eat complex carbs, and lower stress.",
  },
  {
    phase: "Late / Expecting",
    tipTitle: "Take a Breath",
    tipDescription: "Cycles can vary due to stress or diet. Take a warm bath and relax; if it persists unusually long, consider a check-up.",
  }
];

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch latest cycle log
    const [latestLog] = await db
      .select()
      .from(cycleLogs)
      .where(eq(cycleLogs.userId, session.user.id))
      .orderBy(desc(cycleLogs.startDate))
      .limit(1);

    if (!latestLog || !latestLog.startDate) {
      return NextResponse.json({ status: "NO_DATA", message: "Please log your cycle dates first." }, { status: 200 });
    }

    // 2. Mathematically deduce phase
    const start = new Date(latestLog.startDate);
    const now = new Date();
    const diffTime = now.getTime() - start.getTime();
    const dayOfCycle = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    const cycleLength = latestLog.predictedCycleLength || 28;

    let targetPhase = "Menstrual";
    let predictedMood = "Tired / Relieved";

    const ovulationDay = Math.max(1, cycleLength - 14); // Luteal phase is ~14 days

    if (dayOfCycle > cycleLength) {
      targetPhase = "Late / Expecting";
      predictedMood = "Anxious / Expectant";
    } else {
      if (dayOfCycle <= 5) {
        targetPhase = "Menstrual";
        predictedMood = "Crampy / Relieved";
      } else if (dayOfCycle < ovulationDay) {
        targetPhase = "Follicular";
        predictedMood = "High Energy / Happy";
      } else if (dayOfCycle === ovulationDay || dayOfCycle === ovulationDay + 1) {
        targetPhase = "Ovulation";
        predictedMood = "Peak Energy / Sociable";
      } else {
        targetPhase = "Luteal";
        predictedMood = "Moody / Fatigued";
      }
    }

    // 3. Fetch tips from database
    let tips = await db
      .select()
      .from(cycleStageTips)
      .where(eq(cycleStageTips.phase, targetPhase));

    // 4. Seed database if absolutely empty
    if (tips.length === 0) {
      const allTips = await db.select().from(cycleStageTips).limit(1);
      if (allTips.length === 0) {
        await db.insert(cycleStageTips).values(SEED_TIPS);
        tips = await db.select().from(cycleStageTips).where(eq(cycleStageTips.phase, targetPhase));
      } else {
        // Just return a generic fallback if another phase is missing
        tips = [{ id: 0, phase: targetPhase, tipTitle: "Stay Healthy", tipDescription: `Drink water and rest well during your ${targetPhase} phase.`, createdAt: new Date() }];
      }
    }

    // Pick a random tip if there are multiple for the phase
    const advice = tips[Math.floor(Math.random() * tips.length)];

    const ovulationDate = new Date(start);
    ovulationDate.setDate(ovulationDate.getDate() + ovulationDay - 1);
    
    const fertileWindowStart = new Date(ovulationDate);
    fertileWindowStart.setDate(fertileWindowStart.getDate() - 5);
    
    const fertileWindowEnd = new Date(ovulationDate);
    fertileWindowEnd.setDate(fertileWindowEnd.getDate() + 1);

    return NextResponse.json({
      status: "SUCCESS",
      dayOfCycle,
      phase: targetPhase,
      predictedMood,
      ovulationDate: ovulationDate.toISOString(),
      fertileWindowStart: fertileWindowStart.toISOString(),
      fertileWindowEnd: fertileWindowEnd.toISOString(),
      advice
    }, { status: 200 });

  } catch (error) {
    console.error("GET cycle-tracking/status error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
