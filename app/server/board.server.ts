import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { boards, organizations, users } from "../db/schema";

export async function createBoard({
  name,
  bannerImageUrl,
  userId,
  organizationId,
}: {
  name: string;
  bannerImageUrl: string;
  userId: string;
  organizationId: string;
}) {
  try {
    return await db.transaction(async (tx) => {
      const [user] = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user.id) {
        await tx.rollback();
        return { data: undefined, error: "User does not exists" } as const;
      }

      const [org] = await tx
        .select({ id: organizations.id })
        .from(organizations)
        .where(eq(organizations.id, organizationId))
        .limit(1);

      if (!org.id) {
        await tx.rollback();
        return {
          data: undefined,
          error: "Organization does not exists",
        } as const;
      }

      await tx
        .insert(boards)
        .values({
          name,
          bannerImageUrl,
          organizationId: org.id,
          createdById: user.id,
        })
        .execute();

      const [board] = await tx
        .select({
          id: boards.id,
        })
        .from(boards)
        .where(
          and(
            eq(boards.name, name),
            eq(boards.organizationId, org.id),
            eq(boards.createdById, user.id),
          ),
        )
        .limit(1);

      return { data: board, error: undefined } as const;
    });
  } catch (e) {
    return {
      data: undefined,
      error: "Something went wrong while creating board",
    } as const;
  }
}
