import { eq } from "drizzle-orm";
import { db } from "~/db";
import { users } from "~/db/schema";

export type SessionUser = NonNullable<
  Awaited<ReturnType<typeof getSessionUser>>["data"]
>;

export async function getSessionUser(userId: string) {
  try {
    const data = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!data) throw new Error("User not found");
    if (!data[0]) throw new Error("User not found");

    const user = data[0];

    return { data: user, error: undefined } as const;
  } catch (e) {
    return { data: undefined, error: "something went wrong" } as const;
  }
}

export async function updateUserDisplayName(
  userId: string,
  displayName: string | null,
) {
  try {
    await db
      .update(users)
      .set({
        displayName,
      })
      .where(eq(users.id, userId));

    return { data: true, error: undefined } as const;
  } catch (e) {
    return { data: undefined, error: "something went wrong" } as const;
  }
}
