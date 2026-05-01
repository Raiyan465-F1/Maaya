import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/src/db";
import { cycleLogs, cycleStageTips, userCycleOnboarding } from "@/src/schema";
import { authOptions } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const MOOD_PREDICTIONS: Record<string, string> = {
  "Menstrual": "You might feel tired, introspective, or experience mild discomfort. Rest and be gentle with yourself.",
  "Follicular": "Your energy levels and mood are likely rising. You might feel more creative, upbeat, and outgoing.",
  "Ovulation": "You're likely at your most energetic and confident. Great time for socializing and intense workouts.",
  "Luteal": "You might experience a dip in energy, potential PMS symptoms, and crave nesting or quiet time."
};

type HistoryItem = {
  month: string;
  year: number;
  length: number;
  startDate: string;
};

type PeriodHistoryItem = HistoryItem & {
  endDate: string;
};

function startOfDay(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function getDayDifference(start: Date, end: Date) {
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
}

function getInclusiveDayCount(start: Date, end: Date) {
  return getDayDifference(start, end) + 1;
}

function getAverage(values: number[]) {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
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
        cycleAverageDays: null,
        periodAverageDays: null,
        cycleVarianceDays: null,
        cycleTrend: null,
        cycleHistory: [],
        periodHistory: [],
        usesOnboardingFallback: false,
        isCycleNormal: null,
        isPeriodNormal: null,
        periodStartDates: [],
        pregnancyChance: { label: "Unknown", color: "text-muted-foreground", bg: "bg-muted/10" },
        recommendations: [{ 
          tipTitle: "Ready to start?", 
          tipDescription: "Click a date on the calendar to log your first period and unlock full phase predictions!" 
        }]

      }, { status: 200 });
    }

    let latestCycle = logs[0];
    const today = startOfDay(new Date());
    const onboardingCycleAverage = isOnboarded ? onboardingData[0].averageCycleLength ?? null : null;
    const onboardingPeriodAverage = isOnboarded ? onboardingData[0].averagePeriodLength ?? null : null;

    const cycleHistory: HistoryItem[] = [];
    if (logs.length > 1) {
      for (let i = 0; i < Math.min(logs.length - 1, 6); i++) {
        const currentStart = startOfDay(new Date(logs[i].startDate));
        const previousStart = startOfDay(new Date(logs[i + 1].startDate));
        cycleHistory.push({
          month: previousStart.toLocaleString("default", { month: "short" }),
          year: previousStart.getFullYear(),
          length: getDayDifference(previousStart, currentStart),
          startDate: logs[i + 1].startDate,
        });
      }
    }

    const periodHistory: PeriodHistoryItem[] = logs
      .filter((log) => !!log.endDate)
      .slice(0, 6)
      .map((log) => {
        const startDate = startOfDay(new Date(log.startDate));
        const endDate = startOfDay(new Date(log.endDate!));
        return {
          month: startDate.toLocaleString("default", { month: "short" }),
          year: startDate.getFullYear(),
          length: getInclusiveDayCount(startDate, endDate),
          startDate: log.startDate,
          endDate: log.endDate!,
        };
      })
      .reverse();

    const orderedCycleHistory = cycleHistory.reverse();
    const cycleAverageFromLogs = getAverage(orderedCycleHistory.map((cycle) => cycle.length));
    const periodAverageFromLogs = getAverage(periodHistory.map((period) => period.length));
    const cycleAverageDays = cycleAverageFromLogs ?? onboardingCycleAverage ?? 28;
    const periodAverageDays = periodAverageFromLogs ?? onboardingPeriodAverage ?? 5;
    const usesOnboardingFallback =
      cycleAverageFromLogs === null || periodAverageFromLogs === null;
    const cycleVarianceDays =
      orderedCycleHistory.length > 0
        ? Math.max(...orderedCycleHistory.map((cycle) => cycle.length)) -
          Math.min(...orderedCycleHistory.map((cycle) => cycle.length))
        : null;
    const cycleTrend =
      cycleVarianceDays === null ? null : cycleVarianceDays <= 3 ? "consistent" : "variable";

    // Auto-close active cycle if time frame exceeded
    if (!latestCycle.endDate) {
      const cycleStart = startOfDay(new Date(latestCycle.startDate));
      const daysSinceStart = getInclusiveDayCount(cycleStart, today);
      
      if (daysSinceStart > periodAverageDays) {
        // Automatically set end date to start + estimated period length - 1 day.
        const autoEndDate = new Date(cycleStart);
        autoEndDate.setDate(autoEndDate.getDate() + periodAverageDays - 1);
        
        await db.update(cycleLogs)
          .set({ endDate: autoEndDate.toISOString() })
          .where(eq(cycleLogs.id, latestCycle.id));
          
        latestCycle = { ...latestCycle, endDate: autoEndDate.toISOString() };
      }
    }
    const start = startOfDay(new Date(latestCycle.startDate));

    const nextPeriodStart = new Date(start.getTime() + cycleAverageDays * MS_PER_DAY);
    const nextPeriodEnd = new Date(nextPeriodStart.getTime() + (periodAverageDays - 1) * MS_PER_DAY);

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

    const daysUntilNextPeriod = Math.max(0, Math.ceil((nextPeriodStart.getTime() - today.getTime()) / MS_PER_DAY));
    
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
    
    const userRegularity = isOnboarded ? onboardingData[0].regularity : "mostly";
    
    // Evaluate health status based on cycle and regularity
    let healthStatus = null;

    if (userRegularity === "irregular") {
      healthStatus = {
        status: "Advice",
        message: "Irregular Cycle Noted",
        details: "Since your cycle is irregular, we suggest consulting our medical professionals for personalized guidance."
      };
    } else if (dayOfCycle > 35) {
      healthStatus = {
        status: "Warning",
        message: "Your period is late.",
        details: "Consider taking a pregnancy test or consulting a professional if your cycle is usually regular."
      };
    } else if (currentPhase === "Ovulation") {
      healthStatus = {
        status: "Excellent",
        message: "Optimal Reproductive Window",
        details: "You are in your highly fertile phase right now. Great job monitoring your cycle!"
      };
    }



    // Pregnancy chance calculation
    let pregnancyChance = { label: "LOW CHANCE of getting pregnant", color: "text-green-500", bg: "bg-green-500/10" };
    if (dayOfCycle >= 12 && dayOfCycle <= 16) {
      pregnancyChance = { label: "HIGH CHANCE of getting pregnant", color: "text-red-500", bg: "bg-red-500/10" };
    } else if ((dayOfCycle >= 10 && dayOfCycle <= 11) || (dayOfCycle >= 17 && dayOfCycle <= 18)) {
      pregnancyChance = { label: "MODERATE CHANCE of getting pregnant", color: "text-yellow-600", bg: "bg-yellow-500/10" };
    }

    // Normalcy Analysis
    const isCycleNormal = cycleAverageDays >= 21 && cycleAverageDays <= 35;
    const isPeriodNormal = periodAverageDays >= 2 && periodAverageDays <= 7;


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
      cycleHistory: orderedCycleHistory,
      periodHistory,
      cycleAverageDays,
      periodAverageDays,
      cycleVarianceDays,
      cycleTrend,
      usesOnboardingFallback,
      isCycleNormal,
      isPeriodNormal,


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
