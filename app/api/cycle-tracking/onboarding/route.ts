import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/src/db";
import { userCycleOnboarding } from "@/src/schema";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Upsert onboarding data for the user
    await db
      .insert(userCycleOnboarding)
      .values({
        userId: session.user.id,
        averageCycleLength: data.averageCycleLength,
        height: data.height,
        weight: data.weight,
        regularity: data.regularity,
        flowIntensity: data.flowIntensity,
        periodSymptoms: data.periodSymptoms,
        concerns: data.concerns,
        stressLevel: data.stressLevel,
        sleepHours: data.sleepHours,
        activityLevel: data.activityLevel,
        hydration: data.hydration,
        primaryGoal: data.primaryGoal,
        notificationsEnabled: data.notificationsEnabled,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userCycleOnboarding.userId,
        set: {
          averageCycleLength: data.averageCycleLength,
          height: data.height,
          weight: data.weight,
          regularity: data.regularity,
          flowIntensity: data.flowIntensity,
          periodSymptoms: data.periodSymptoms,
          concerns: data.concerns,
          stressLevel: data.stressLevel,
          sleepHours: data.sleepHours,
          activityLevel: data.activityLevel,
          hydration: data.hydration,
          primaryGoal: data.primaryGoal,
          notificationsEnabled: data.notificationsEnabled,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("POST onboarding error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
