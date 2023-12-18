import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { and, eq } from "drizzle-orm";
import { auth } from "~/auth/lucia.server";
import { ScrollArea } from "~/components/ui/scroll-area";
import { db } from "~/db";
import { boards } from "~/db/schema";
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
    throw new Response("Organization not found", { status: 404 });
  }
  if (!params.boardId) {
    throw new Response("Board not found", { status: 404 });
  }

  const [_boards] = await db
    .select()
    .from(boards)
    .where(
      and(
        eq(boards.organizationId, params.organizationId),
        eq(boards.id, params.boardId),
      ),
    )
    .limit(1);

  return json({ board: _boards } as const);
}

export default function BoardsPage() {
  const { board } = useLoaderData<typeof loader>();

  return (
    <ScrollArea
      className="container relative mx-auto bg-primary bg-cover bg-center bg-no-repeat px-4 py-6 after:absolute after:inset-0 after:-z-[-1] after:bg-black after:opacity-10"
      style={{
        height: "calc(100vh - 5rem)",
        backgroundImage: board.bannerImageUrl
          ? `url(${board.bannerImageUrl})`
          : undefined,
      }}
    ></ScrollArea>
  );
}
