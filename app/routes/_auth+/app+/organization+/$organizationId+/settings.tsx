import { type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { type MetaFunction } from "@remix-run/react";
import { auth } from "~/auth/lucia.server";
import { Separator } from "~/components/ui/separator";
import { TypographyH3, TypographyMuted } from "~/components/ui/typography";
import { getSessionUser } from "~/server/user.server";
import { logout } from "~/utils/auth.server";
import {
  organizations,
  organizationMembers,
  organizationRoles,
} from "~/db/schema";
import { and, eq } from "drizzle-orm";
import { db } from "~/db";

export const meta: MetaFunction = () => {
  return [
    { title: "Organization Settings | Remix Trello" },
    { name: "description", content: "Remix Trello Organization" },
  ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const authRequest = await auth.handleRequest(request);

  const session = await authRequest.validate();

  if (!session) throw redirect("/signin", 303);

  const { error } = await getSessionUser(session.user.userId);

  if (error) {
    return await logout(session.sessionId);
  }

  if (!params.organizationId) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  // user should be member of the organization
  const [org] = await db
    .select({
      ownderId: organizations.ownerId,
      userRole: organizationRoles.name,
    })
    .from(organizations)
    .leftJoin(
      organizationMembers,
      eq(organizationMembers.organizationId, organizations.id),
    )
    .leftJoin(
      organizationRoles,
      and(
        eq(organizationRoles.organizationId, organizations.id),
        eq(organizationRoles.id, organizationMembers.memberRoleId),
      ),
    )
    .where(
      and(
        eq(organizations.id, params.organizationId),
        eq(organizationMembers.memberId, session.user.userId),
      ),
    )
    .groupBy(organizations.id)
    .limit(1);

  if (!org) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  const canViewSettings = org.userRole && org.userRole === "ADMIN";

  if (!canViewSettings) {
    throw new Response(null, {
      status: 401,
      statusText: "Unauthorized",
    });
  }

  return {};
}

export default function OrganizationSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <TypographyH3 className="text-primary">Settings</TypographyH3>
        <TypographyMuted>Update organization settings.</TypographyMuted>
      </div>
      <Separator />
    </div>
  );
}
