import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { and, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { doctorRatings, users } from "@/src/schema";
import { authOptions } from "@/lib/auth";
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

async function loadDoctor(id: string) {
  const [doctor] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return doctor ?? null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get("origin");
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return jsonResponse({ error: "Unauthorized" }, 401, origin);
  }

  try {
    const { id } = await params;

    const [existing] = await db
      .select({
        id: doctorRatings.id,
        rating: doctorRatings.rating,
        comment: doctorRatings.comment,
        createdAt: doctorRatings.createdAt,
      })
      .from(doctorRatings)
      .where(
        and(
          eq(doctorRatings.doctorUserId, id),
          eq(doctorRatings.userId, session.user.id)
        )
      )
      .limit(1);

    return jsonResponse({ rating: existing ?? null }, 200, origin);
  } catch (error) {
    console.error("Error loading doctor rating:", error);
    return jsonResponse({ error: "Failed to load rating" }, 500, origin);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get("origin");
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return jsonResponse({ error: "Unauthorized" }, 401, origin);
  }

  try {
    const { id } = await params;

    if (id === session.user.id) {
      return jsonResponse(
        { error: "You cannot rate yourself" },
        400,
        origin
      );
    }

    const doctor = await loadDoctor(id);
    if (!doctor) {
      return jsonResponse({ error: "Doctor not found" }, 404, origin);
    }
    if (doctor.role !== "doctor") {
      return jsonResponse(
        { error: "Only verified doctors can be rated" },
        400,
        origin
      );
    }

    const body = await request.json().catch(() => null);
    const rating = Number(body?.rating);
    const rawComment = typeof body?.comment === "string" ? body.comment : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return jsonResponse(
        { error: "Rating must be an integer between 1 and 5" },
        400,
        origin
      );
    }

    const trimmedComment = rawComment.trim().slice(0, 1000);
    const commentValue = trimmedComment.length > 0 ? trimmedComment : null;

    const [existing] = await db
      .select({ id: doctorRatings.id })
      .from(doctorRatings)
      .where(
        and(
          eq(doctorRatings.doctorUserId, id),
          eq(doctorRatings.userId, session.user.id)
        )
      )
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(doctorRatings)
        .set({
          rating,
          comment: commentValue,
          createdAt: new Date(),
        })
        .where(eq(doctorRatings.id, existing.id))
        .returning();

      return jsonResponse({ rating: updated }, 200, origin);
    }

    const [inserted] = await db
      .insert(doctorRatings)
      .values({
        doctorUserId: id,
        userId: session.user.id,
        rating,
        comment: commentValue,
      })
      .returning();

    return jsonResponse({ rating: inserted }, 201, origin);
  } catch (error) {
    console.error("Error saving doctor rating:", error);
    return jsonResponse({ error: "Failed to save rating" }, 500, origin);
  }
}
