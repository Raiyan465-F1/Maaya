import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { doctorProfiles, users } from "@/src/schema";
import { withCorsHeaders } from "@/lib/cors";

function jsonResponse(
  data: object,
  status: number,
  origin: string | null
): NextResponse {
  const res = NextResponse.json(data, { status });
  Object.entries(withCorsHeaders(origin)).forEach(([key, value]) => {
    res.headers.set(key, value);
  });
  return res;
}

export async function GET(request: NextRequest) {
  try {
    const origin = request.headers.get("origin");

    const doctors = await db
      .select({
        id: doctorProfiles.id,
        specialty: doctorProfiles.specialty,
        availabilityInfo: doctorProfiles.availabilityInfo,
        userId: doctorProfiles.userId,
        // Add user fields as needed
      })
      .from(doctorProfiles)
      .innerJoin(users, eq(doctorProfiles.userId, users.id))
      .where(eq(users.role, "doctor"));

    return jsonResponse(doctors, 200, origin);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return jsonResponse({ error: "Failed to fetch doctors" }, 500, null);
  }
}