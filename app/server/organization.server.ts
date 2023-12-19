import { and, desc, eq } from "drizzle-orm";
import { db } from "../db";
import {
  organizationMembers,
  organizationRoles,
  organizations,
  users,
} from "../db/schema";

export async function getUserOrganizations(userId: string) {
  const orgs = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      logoUrl: organizations.logoUrl,
      ownderId: organizations.ownerId,
      role: organizationRoles.name,
    })
    .from(organizations)
    .leftJoin(
      organizationRoles,
      eq(organizationRoles.organizationId, organizations.id),
    )
    .leftJoin(
      organizationMembers,
      and(
        eq(organizationMembers.organizationId, organizations.id),
        eq(organizationMembers.memberRoleId, organizationRoles.id),
      ),
    )
    .where(eq(organizationMembers.memberId, userId))
    .groupBy(organizations.id)
    .orderBy(desc(organizations.createdAt))
    .limit(5);

  return orgs;
}

export async function createOrganization({
  name,
  slug,
  userId,
}: {
  name: string;
  slug: string;
  userId: string;
}) {
  const org = await db.transaction(async (tx) => {
    const [user] = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user.id) {
      await tx.rollback();
      return;
    }

    try {
      await tx
        .insert(organizations)
        .values({
          name,
          slug,
          ownerId: userId,
        })
        .execute();
    } catch (e) {
      // TODO: handle unique slug error case and return proper error message
      return;
    }

    // mysql does not return data after insert so we have to select to get new data
    const [org] = await tx
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
      })
      .from(organizations)
      .where(and(eq(organizations.name, name), eq(organizations.slug, slug)))
      .orderBy(desc(organizations.createdAt))
      .limit(1);

    if (!org.id) {
      // TODO: should we throw error?
      // throw new Error("Organization not found");
      await tx.rollback();
      return;
    }

    const ADMIN_ROLE_NAME = "ADMIN";

    await tx.insert(organizationRoles).values({
      name: ADMIN_ROLE_NAME,
      organizationId: org.id,
    });

    const [adminRole] = await tx
      .select({
        id: organizationRoles.id,
      })
      .from(organizationRoles)
      .where(
        and(
          eq(organizationRoles.organizationId, org.id),
          eq(organizationRoles.name, ADMIN_ROLE_NAME),
        ),
      )
      .orderBy(desc(organizationRoles.createdAt))
      .limit(1);

    if (!adminRole.id) {
      // throw new Error("Admin organization role not found");
      await tx.rollback();
      return;
    }

    await tx.insert(organizationRoles).values({
      name: "MEMBER",
      organizationId: org.id,
    });

    await tx.insert(organizationMembers).values({
      memberId: userId,
      memberRoleId: adminRole.id,
      organizationId: org.id,
    });

    return org;
  });

  if (!org) {
    return {
      data: undefined,
      error: "Something went wrong while creating Organization",
    } as const;
  }

  return { data: org, error: undefined } as const;
}
