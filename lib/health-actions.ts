"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/src/db";
import { symptomLogs } from "@/src/schema";
import { eq, and } from "drizzle-orm";

/**
 * Grabs the active mood exactly matching the user's localized day
 */
export async function getTodayMood(localDateStr: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const existingLogs = await db
    .select()
    .from(symptomLogs)
    .where(
      and(
        eq(symptomLogs.userId, session.user.id),
        eq(symptomLogs.logDate, localDateStr)
      )
    )
    .limit(1);

  if (existingLogs.length > 0 && existingLogs[0].symptoms) {
    const symptomsObj = existingLogs[0].symptoms as { mood?: string };
    if (symptomsObj.mood) {
      return symptomsObj.mood;
    }
  }

  return null;
}

/**
 * Securely locks a single mood inside the Postgres database for a fully 24-hour constrained period natively relying on user-provided timezone strings
 */
export async function saveDailyMood(mood: string, localDateStr: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "You must be logged in to track your cycle insights." };
  }

  // Double verification checkpoint to perfectly obey strict 24-hour locks
  const existingLogs = await db
    .select()
    .from(symptomLogs)
    .where(
      and(
        eq(symptomLogs.userId, session.user.id),
        eq(symptomLogs.logDate, localDateStr)
      )
    )
    .limit(1);

  if (existingLogs.length > 0) {
    const existingObj = (existingLogs[0].symptoms as Record<string, any>) || {};
    
    if (existingObj.mood) {
      return { error: "Mood already strictly locked for today. Wait until 12:00 AM." };
    }
    
    // Safely append mood property into JSON tree if they logged a different symptom earlier today
    await db
      .update(symptomLogs)
      .set({
        symptoms: { ...existingObj, mood },
        updatedAt: new Date(),
      })
      .where(eq(symptomLogs.id, existingLogs[0].id));
      
    return { success: true };
  }

  // Create cleanly formatted initial row mapping
  await db.insert(symptomLogs).values({
    userId: session.user.id,
    logDate: localDateStr,
    symptoms: { mood },
  });

  return { success: true };
}

