import type { Session } from "next-auth";
import { NextResponse } from "next/server";
import { isSuspendedAndActive } from "@/lib/account-restriction-helpers";
import { withCorsHeaders } from "@/lib/cors";

export function jsonWithCors(data: object, status: number, origin: string | null) {
  const res = NextResponse.json(data, { status });
  Object.entries(withCorsHeaders(origin)).forEach(([key, value]) => {
    res.headers.set(key, value);
  });
  return res;
}

/**
 * Returns a 403 response if the user is suspended (and restriction not expired).
 * Use on POST/PATCH/DELETE that suspended users must not perform.
 */
export function suspendedMutationBlockedResponse(
  session: Session | null,
  origin: string | null
): NextResponse | null {
  if (!session?.user?.id) return null;

  const blocked = isSuspendedAndActive(
    session.user.accountStatus,
    session.user.restrictionEndsAt ?? null
  );

  if (!blocked) return null;

  return jsonWithCors(
    {
      error:
        "Your account is suspended. You can browse the app but cannot post, comment, vote, or ask doctors until the suspension lifts.",
      code: "SUSPENDED",
    },
    403,
    origin
  );
}
