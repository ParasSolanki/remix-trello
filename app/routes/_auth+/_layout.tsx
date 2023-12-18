import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { auth } from "~/auth/lucia.server";
import { Header } from "~/components/header";
import { UserMenu } from "~/components/user-menu";
import { getUserOrganizations } from "~/server/organization.server";
import { getSessionUser } from "~/server/user.server";
import { logout } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const authRequest = await auth.handleRequest(request);

  const session = await authRequest.validate();

  if (!session) throw redirect("/signin", 303);

  const { data: user, error } = await getSessionUser(session.user.userId);

  if (error) {
    return await logout(session.sessionId);
  }

  const organizations = await getUserOrganizations(session.user.userId);

  return json({ user, organizations } as const);
}

export default function AuthLayout() {
  const { user, organizations } = useLoaderData<typeof loader>();

  return (
    <>
      <Header>
        <UserMenu user={user} organizations={organizations} />
      </Header>
      <Outlet />
    </>
  );
}
