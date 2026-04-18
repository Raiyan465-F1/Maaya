import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users } from "@/src/schema";

/**
 * Server-only: clears expired ban/suspension windows in the DB.
 * Do not import this module from Client Components.
 */
export async function expireAccountRestrictionIfNeeded(userId: string): Promise<void> {
  const [row] = await db
    .select({
      accountStatus: users.accountStatus,
      restrictionEndsAt: users.restrictionEndsAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!row) return;

  if (
    (row.accountStatus === "banned" || row.accountStatus === "suspended") &&
    row.restrictionEndsAt &&
    row.restrictionEndsAt <= new Date()
  ) {
    await db
      .update(users)
      .set({
        accountStatus: "active",
        restrictionEndsAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }
}
