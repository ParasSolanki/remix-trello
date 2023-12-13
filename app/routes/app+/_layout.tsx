import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { auth } from "~/auth/lucia.server";
import { Header } from "~/components/header";
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

  return json({ user } as const);
}

export default function AppLayout() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      <Header user={user} />
      <Outlet />
    </>
  );
}
