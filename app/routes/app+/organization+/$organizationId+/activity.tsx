import { type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { type MetaFunction } from "@remix-run/react";
import { auth } from "~/auth/lucia.server";
import { Separator } from "~/components/ui/separator";
import { TypographyH3, TypographyMuted } from "~/components/ui/typography";
import { getSessionUser } from "~/server/user.server";
import { logout } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Organization Activity | Remix Trello" },
    { name: "description", content: "Remix Trello Organization" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const authRequest = await auth.handleRequest(request);

  const session = await authRequest.validate();

  if (!session) throw redirect("/signin", 303);

  const { error } = await getSessionUser(session.user.userId);

  if (error) {
    return await logout(session.sessionId);
  }

  // TODO: only admin can view this page
  return {};
}

export default function OrganizationActivityPage() {
  return (
    <div className="space-y-6">
      <div>
        <TypographyH3 className="text-primary">Activity</TypographyH3>
        <TypographyMuted>Your organization all activities.</TypographyMuted>
      </div>
      <Separator />
    </div>
  );
}
