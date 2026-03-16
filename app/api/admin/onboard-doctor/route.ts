import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users, doctorProfiles } from "@/src/schema";
import { authOptions } from "@/lib/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { email, password, name, specialty } = body as {
      email?: string;
      password?: string;
      name?: string;
      specialty?: string;
    };

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Doctor email is required." }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, trimmedEmail))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await hash(password, 12);
    const trimmedName = typeof name === "string" ? name.trim().slice(0, 255) : null;

    const [newUser] = await db
      .insert(users)
      .values({
        name: trimmedName || null,
        email: trimmedEmail,
        passwordHash,
        role: "doctor",
        accountStatus: "active",
      })
      .returning({ id: users.id });

    if (newUser) {
      await db.insert(doctorProfiles).values({
        userId: newUser.id,
        specialty: typeof specialty === "string" ? specialty.trim().slice(0, 100) || null : null,
      });
    }

    return NextResponse.json(
      { message: "Doctor account created successfully.", email: trimmedEmail },
      { status: 201 },
    );
  } catch (err) {
    console.error("Admin onboard doctor error:", err);
    return NextResponse.json({ error: "Failed to create doctor account." }, { status: 500 });
  }
}
