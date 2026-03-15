import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users } from "@/src/schema";
import { withCorsHeaders } from "@/lib/cors";

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export async function OPTIONS(_request: NextRequest) {
  const origin = _request.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: withCorsHeaders(origin),
  });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || typeof email !== "string") {
      return jsonResponse(
        { error: "Email is required" },
        400,
        origin
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return jsonResponse(
        { error: "Invalid email format" },
        400,
        origin
      );
    }

    if (!password || typeof password !== "string") {
      return jsonResponse(
        { error: "Password is required" },
        400,
        origin
      );
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return jsonResponse(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        400,
        origin
      );
    }

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, trimmedEmail))
      .limit(1);

    if (existing) {
      return jsonResponse(
        { error: "An account with this email already exists" },
        409,
        origin
      );
    }

    const passwordHash = await hash(password, 12);

    await db.insert(users).values({
      email: trimmedEmail,
      passwordHash,
      role: "user",
      accountStatus: "active",
    });

    return jsonResponse(
      { message: "Registration successful" },
      201,
      origin
    );
  } catch (err) {
    console.error("Register error:", err);
    return jsonResponse(
      { error: "Registration failed" },
      500,
      origin
    );
  }
}
