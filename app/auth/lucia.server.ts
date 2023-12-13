import { lucia } from "lucia";
import { mysql2 } from "@lucia-auth/adapter-mysql";
import { web } from "lucia/middleware";
import "lucia/polyfill/node";

import { pool } from "~/db";
import { env } from "~/env";

export const auth = lucia({
  env: env.NODE_ENV !== "production" ? "DEV" : "PROD",
  middleware: web(),
  adapter: mysql2(pool, {
    user: "users",
    key: "user_keys",
    session: "user_sessions",
  }),
  sessionCookie: {
    name: "_rtc",
  },
  // session will be vaid for 2 DAY -> 1 DAY active and other day idle it will get activated if session is idle
  sessionExpiresIn: {
    activePeriod: 1000 * 60 * 60 * 24, // 1 DAY
    idlePeriod: 1000 * 60 * 60 * 24, // 1 DAY
  },
  getUserAttributes(databaseUser) {
    return {
      email: databaseUser.email,
    };
  },
});

export type Auth = typeof auth;
