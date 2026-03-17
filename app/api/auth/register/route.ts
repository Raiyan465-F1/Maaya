import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users } from "@/src/schema";
import { withCorsHeaders } from "@/lib/cors";

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOCTOR_REGISTRATION_CODES = (process.env.DOCTOR_REGISTRATION_CODE ?? "")
  .split(",")
  .map((code) => code.trim())
  .filter(Boolean);

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
    const { name, email, password, role, doctorAccessCode } = body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
      doctorAccessCode?: string;
    };

    if (!email || typeof email !== "string") {
      return jsonResponse({ error: "Email is required" }, 400, origin);
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return jsonResponse({ error: "Invalid email format" }, 400, origin);
    }

    if (!password || typeof password !== "string") {
      return jsonResponse({ error: "Password is required" }, 400, origin);
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return jsonResponse(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        400,
        origin
      );
    }

    const normalizedRole = role === "doctor" ? "doctor" : "user";

    if (normalizedRole === "doctor") {
      if (DOCTOR_REGISTRATION_CODES.length === 0) {
        return jsonResponse(
          { error: "Doctor registration is not configured yet" },
          503,
          origin
        );
      }

      if (
        !doctorAccessCode ||
        typeof doctorAccessCode !== "string" ||
        !DOCTOR_REGISTRATION_CODES.includes(doctorAccessCode.trim())
      ) {
        return jsonResponse(
          { error: "Doctor access code is invalid" },
          403,
          origin
        );
      }
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

    const trimmedName = typeof name === "string" ? name.trim().slice(0, 255) : null;

    await db.insert(users).values({
      name: trimmedName || null,
      email: trimmedEmail,
      passwordHash,
      role: normalizedRole,
      accountStatus: "active",
    });

    return jsonResponse(
      {
        message:
          normalizedRole === "doctor"
            ? "Doctor account created successfully"
            : "Registration successful",
      },
      201,
      origin
    );
  } catch (err) {
    console.error("Register error:", err);
    return jsonResponse({ error: "Registration failed" }, 500, origin);
  }
}
