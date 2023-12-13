import { CSRF, CSRFError } from "remix-utils/csrf/server";
import { createCookie } from "@remix-run/node"; // or cloudflare/deno
import { env } from "~/env";

export const cookie = createCookie("csrf", {
  path: "/",
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  secrets: [env.AUTH_SECRET],
});

export const csrf = new CSRF({
  cookie,
  // what key in FormData objects will be used for the token, defaults to `csrf`
  formDataKey: "csrf",
  // an optional secret used to sign the token, recommended for extra safety
  secret: env.AUTH_SECRET,
});

export async function validateCSRF(formData: FormData, headers: Headers) {
  try {
    await csrf.validate(formData, headers);
  } catch (error) {
    if (error instanceof CSRFError) {
      throw new Response("Invalid CSRF token", { status: 403 });
    }
    throw error;
  }
}
