import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { and, eq } from "drizzle-orm";
import {
  ActivityIcon,
  BuildingIcon,
  LayoutIcon,
  SettingsIcon,
} from "lucide-react";
import { auth } from "~/auth/lucia.server";
import {
  Breadcrumb,
  BreadcrumbLink,
  Breadcrumbs,
} from "~/components/ui/breadcrumbs";
import { buttonVariants } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { TypographyH2, TypographyMuted } from "~/components/ui/typography";
import { db } from "~/db";
import {
  organizations,
  organizationMembers,
  organizationRoles,
} from "~/db/schema";
import { cn } from "~/lib/utils";
import { getSessionUser } from "~/server/user.server";
import { logout } from "~/utils/auth.server";

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
      id: organizations.id,
      name: organizations.name,
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

  return json({ organization: org } as const);
}

const sidebarLinks = [
  {
    title: "Boards",
    href: (id: string) => `/app/organization/${id}`,
    icon: LayoutIcon,
  },
  {
    title: "Settings",
    href: (id: string) => `/app/organization/${id}/settings`,
    icon: SettingsIcon,
  },
  {
    title: "Activity",
    href: (id: string) => `/app/organization/${id}/activity`,
    icon: ActivityIcon,
  },
];

export default function OrganizationLayout() {
  const { organization } = useLoaderData<typeof loader>();
  const location = useLocation();

  const links = sidebarLinks.filter((link) => {
    if (link.title === "Settings") return organization.userRole === "ADMIN";
    return true;
  });

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-12">
      <Breadcrumbs>
        <Breadcrumb>
          <BreadcrumbLink>
            <BuildingIcon className="mr-2 h-4 w-4" />
            <Link to="/app">Organizations</Link>
          </BreadcrumbLink>
        </Breadcrumb>
        <Breadcrumb>
          <BreadcrumbLink isCurrent>{organization.name}</BreadcrumbLink>
        </Breadcrumb>
      </Breadcrumbs>

      <div className="space-y-1">
        <TypographyH2 className="capitalize text-primary">
          {organization.name}
        </TypographyH2>
        <TypographyMuted className="text-base">
          Manage your organization.
        </TypographyMuted>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            <ul>
              {links.map((item) => (
                <li key={item.title}>
                  <Link
                    to={item.href(organization.id)}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      location.pathname === item.href(organization.id)
                        ? "bg-muted text-primary hover:bg-muted"
                        : "hover:bg-transparent hover:underline",
                      "w-full justify-start text-base",
                    )}
                  >
                    <item.icon className="mr-2 h-5 w-5" aria-hidden />
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <div className="flex-1 lg:max-w-2xl">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
