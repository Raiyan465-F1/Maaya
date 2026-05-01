import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/src/db";
import { cycleLogs, cycleStageTips, userCycleOnboarding } from "@/src/schema";
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

    // Check for onboarding data as fallback
    const onboardingData = await db
      .select()
      .from(userCycleOnboarding)
      .where(eq(userCycleOnboarding.userId, session.user.id))
      .limit(1);

    const isOnboarded = onboardingData.length > 0;

    if ((!logs || logs.length === 0) && !isOnboarded) {
      return NextResponse.json({ hasData: false, message: "No cycles logged yet." }, { status: 200 });
    }

    if ((!logs || logs.length === 0) && isOnboarded) {
      const config = onboardingData[0];
      return NextResponse.json({
        hasData: false,
        isOnboarded: true,
        message: "Logged your profile, now log your first period start on the calendar!",
        config: {
          averageCycleLength: config.averageCycleLength,
          averagePeriodLength: config.averagePeriodLength,
          height: config.height,
          weight: config.weight,
          primaryGoal: config.primaryGoal
        },
        periodStartDates: [],
        pregnancyChance: { label: "Unknown", color: "text-muted-foreground", bg: "bg-muted/10" },
        recommendations: [{ 
          tipTitle: "Ready to start?", 
          tipDescription: "Click a date on the calendar to log your first period and unlock full phase predictions!" 
        }]

      }, { status: 200 });
    }

    let latestCycle = logs[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const avgCycleLength = isOnboarded && onboardingData[0].averageCycleLength ? onboardingData[0].averageCycleLength : 28;
    const avgPeriodLength = isOnboarded && onboardingData[0].averagePeriodLength ? onboardingData[0].averagePeriodLength : 5;
    today.setHours(0, 0, 0, 0);
    
    const start = new Date(latestCycle.startDate);
    start.setHours(0, 0, 0, 0);

    const nextPeriodStart = new Date(start.getTime() + avgCycleLength * 24 * 60 * 60 * 1000);
    const nextPeriodEnd = new Date(nextPeriodStart.getTime() + avgPeriodLength * 24 * 60 * 60 * 1000);

    // Calculate strict calendar days since the start of the latest cycle
    const diffTime = today.getTime() - start.getTime();
    // Add 1 because the start day is Day 1
    const dayOfCycle = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

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

    const daysUntilNextPeriod = Math.max(0, Math.ceil((nextPeriodStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    const userPeriodSymptoms = isOnboarded && onboardingData[0].periodSymptoms ? onboardingData[0].periodSymptoms : [];
    const formattedSymptoms = userPeriodSymptoms.length > 0 
      ? (userPeriodSymptoms.length > 1 
          ? `${userPeriodSymptoms.slice(0, -1).join(", ")} and ${userPeriodSymptoms.slice(-1)}` 
          : userPeriodSymptoms[0])
      : null;

    const SYMPTOMS_PREDICTIONS: Record<string, string> = {
      "Menstrual": formattedSymptoms 
        ? `You may be experiencing ${formattedSymptoms} today. Rest and take care of yourself.` 
        : "Fatigue, cramps, lower back pain, potential headaches.",
      "Follicular": "Everything is fine! Energy is rising, skin might be clearer.",
      "Ovulation": "High energy, possible mild pelvic twinges (mittelschmerz).",
      "Luteal": formattedSymptoms 
        ? `Heads up! You might start feeling ${formattedSymptoms} as your period approaches.`
        : "Cravings, bloating, mood swings, potential insomnia or fatigue."
    };
    const predictedSymptoms = SYMPTOMS_PREDICTIONS[currentPhase] || "No major symptoms predicted.";

    
    const userStats = isOnboarded ? { height: onboardingData[0].height, weight: onboardingData[0].weight } : null;
    
    // Evaluate health status based on cycle
    let healthStatus = {
      status: "Good",
      message: "Reproductive system seems fine.",
      details: "Everything appears to be within normal ranges."
    };

    if (dayOfCycle > 35) {
      healthStatus = {
        status: "Warning",
        message: "Your period is late.",
        details: "You might be pregnant. Consider taking a test or getting professional help and asking for consultation."
      };
    } else if (currentPhase === "Ovulation") {
      healthStatus = {
        status: "Excellent",
        message: "Optimal Reproductive Window",
        details: "Good reproduction phase. You are highly fertile right now."
      };
    }

    // Pregnancy chance calculation
    let pregnancyChance = { label: "LOW CHANCE of getting pregnant", color: "text-green-500", bg: "bg-green-500/10" };
    if (dayOfCycle >= 12 && dayOfCycle <= 16) {
      pregnancyChance = { label: "HIGH CHANCE of getting pregnant", color: "text-red-500", bg: "bg-red-500/10" };
    } else if ((dayOfCycle >= 10 && dayOfCycle <= 11) || (dayOfCycle >= 17 && dayOfCycle <= 18)) {
      pregnancyChance = { label: "MODERATE CHANCE of getting pregnant", color: "text-yellow-600", bg: "bg-yellow-500/10" };
    }


    return NextResponse.json({
      hasData: true,
      currentPhase,
      dayOfCycle,
      expectedMood,
      daysUntilNextPeriod,
      predictedSymptoms,
      healthStatus,
      pregnancyChance,
      userStats,
      periodStartDates: logs.map(l => l.startDate),
      recommendations: tips.length > 0 ? tips : [{ tipTitle: "Rest and Hydrate", tipDescription: "Listen to your body today." }],
      latestCycle: {
        startDate: latestCycle.startDate,
        endDate: latestCycle.endDate,
        predictedEndDate: nextPeriodStart.toISOString(),
        expectedPeriodEnd: nextPeriodEnd.toISOString()
      }
    }, { status: 200 });


  } catch (error) {
    console.error("GET cycle analytics error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
