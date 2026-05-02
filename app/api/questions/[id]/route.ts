import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { and, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { doctorQuestions, users } from "@/src/schema";
import { questionStatus, type QuestionStatus } from "@/src/schema/enums";
import { authOptions } from "@/lib/auth";
import { notifyQuestionStatusUpdated } from "@/lib/notifications";
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

export async function PATCH(
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
    const questionId = Number.parseInt(id, 10);

    if (Number.isNaN(questionId)) {
      return jsonResponse({ error: "Invalid question ID" }, 400, origin);
    }

    const body = await request.json();
    const nextStatus = body?.status as QuestionStatus | undefined;

    if (!nextStatus || !questionStatus.includes(nextStatus)) {
      return jsonResponse({ error: "Invalid status value" }, 400, origin);
    }

    const [existing] = await db
      .select({
        id: doctorQuestions.id,
        userId: doctorQuestions.userId,
        questionText: doctorQuestions.questionText,
      })
      .from(doctorQuestions)
      .where(eq(doctorQuestions.id, questionId))
      .limit(1);

    if (!existing) {
      return jsonResponse({ error: "Question not found" }, 404, origin);
    }

    const [currentUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    const isOwner = existing.userId === session.user.id;
    const isAdmin = currentUser?.role === "admin";

    if (nextStatus === "closed") {
      if (!isOwner && !isAdmin) {
        return jsonResponse(
          { error: "Only the question owner can close it" },
          403,
          origin
        );
      }
    } else {
      if (!isAdmin) {
        return jsonResponse(
          { error: "Only admins can change status to this value" },
          403,
          origin
        );
      }
    }

    const [updated] = await db
      .update(doctorQuestions)
      .set({ status: nextStatus })
      .where(eq(doctorQuestions.id, questionId))
      .returning();

    if (isAdmin && existing.userId !== session.user.id) {
      await notifyQuestionStatusUpdated({
        recipientUserId: existing.userId,
        actorUserId: session.user.id,
        questionId,
        questionTitle:
          existing.questionText.split("\n\n")[0]?.trim() || "your question",
        status: nextStatus,
      });
    }

    return jsonResponse(updated, 200, origin);
  } catch (error) {
    console.error("Error updating question:", error);
    return jsonResponse({ error: "Failed to update question" }, 500, origin);
  }
}
