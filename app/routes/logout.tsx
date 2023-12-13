import { type DataFunctionArgs, json, redirect } from "@remix-run/node";
import { auth } from "~/auth/lucia.server";
import { logout } from "~/utils/auth.server";
import { validateCSRF } from "~/utils/csrf.server";

export function loader() {
  return redirect("/", 303);
}

export async function action({ request }: DataFunctionArgs) {
  if (request.method !== "POST") {
    return json(
      { status: "error", error: "Method not allowed" },
      { status: 405 },
    );
  }

  const authRequest = await auth.handleRequest(request);

  const session = await authRequest.validate();

  if (!session) {
    return json({ status: "error", error: "Not authorized" }, { status: 401 });
  }
  const formData = await request.formData();

  await validateCSRF(formData, request.headers);

  return await logout(session.sessionId);
}
