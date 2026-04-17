import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/src/db";
import { symptomLogs } from "@/src/schema";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { mood, waterIntake, flowIntensity, logDate } = body;

    const queryDate = logDate ? new Date(logDate) : new Date();

    const [inserted] = await db
      .insert(symptomLogs)
      .values({
        userId: session.user.id,
        logDate: queryDate.toISOString(),
        mood: mood,
        waterIntake: waterIntake !== undefined ? waterIntake : null,
        flowIntensity: flowIntensity || null,
        symptoms: {}, // Minimum required by db schema
      })
      .returning();

    return NextResponse.json({ symptomLog: inserted }, { status: 200 });
  } catch (error) {
    console.error("POST symptoms error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
