/// <reference types="lucia" />
declare namespace Lucia {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  type Auth = import("./app/auth/lucia.server.js").Auth;
  type DatabaseUserAttributes = {
    email: string;
  };
  type DatabaseSessionAttributes = {};
}
