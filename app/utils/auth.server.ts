import { redirect } from "@remix-run/node";
import { auth } from "~/auth/lucia.server";

export async function requireAuth(request: Request) {
  const authRequest = await auth.handleRequest(request);

  const session = await authRequest.validate();

  if (!session) throw new Response("Not Authorized", { status: 401 });

  return session;
}

export async function logout(sessionId: string) {
  try {
    await auth.invalidateSession(sessionId);

    // create blank session cookie
    const sessionCookie = auth.createSessionCookie(null);

    throw redirect("/signin", {
      headers: {
        "set-cookie": sessionCookie.serialize(),
      },
      status: 303,
    });
  } catch (e) {
    throw e;
  }
}
