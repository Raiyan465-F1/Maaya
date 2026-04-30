import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/src/db";
import { symptomLogs, userCycleOnboarding } from "@/src/schema";
import { authOptions } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { mood, waterIntake, flowIntensity, logDate, height, weight, pregnancyStatus, vaginalDischarge, sex, sexDrive } = body;

    const queryDate = logDate ? new Date(logDate) : new Date();

    if (height || weight) {
      const updateData: any = {};
      if (height) updateData.height = height;
      if (weight) updateData.weight = weight;
      
      await db.update(userCycleOnboarding)
        .set(updateData)
        .where(eq(userCycleOnboarding.userId, session.user.id));
    }

    const symptomsObj: any = {};
    if (pregnancyStatus) symptomsObj.pregnancyStatus = pregnancyStatus;
    if (vaginalDischarge) symptomsObj.vaginalDischarge = vaginalDischarge;
    if (sex) symptomsObj.sex = sex;
    if (sexDrive) symptomsObj.sexDrive = sexDrive;

    const [inserted] = await db
      .insert(symptomLogs)
      .values({
        userId: session.user.id,
        logDate: queryDate.toISOString(),
        mood: mood,
        waterIntake: waterIntake !== undefined ? waterIntake : null,
        flowIntensity: flowIntensity || null,
        symptoms: symptomsObj,
      })
      .returning();

    return NextResponse.json({ symptomLog: inserted }, { status: 200 });
  } catch (error) {
    console.error("POST symptoms error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
