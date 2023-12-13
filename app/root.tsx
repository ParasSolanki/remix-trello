import { cssBundleHref } from "@remix-run/css-bundle";
import {
  json,
  type LinksFunction,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import nprogress from "nprogress";
import { useEffect } from "react";
import { AuthenticityTokenProvider } from "remix-utils/csrf/react";
import { Toaster } from "sonner";

import { csrf } from "~/utils/csrf.server";

import globalStyleSheet from "~/styles/global.css";
import nprogressStyleSheet from "~/styles/nprogress.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: globalStyleSheet },
  { rel: "stylesheet", href: nprogressStyleSheet },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export async function loader({ request }: LoaderFunctionArgs) {
  const [csrfToken, csrfCookieHeader] = await csrf.commitToken();

  return json(
    {
      csrfToken,
    } as const,
    {
      headers: csrfCookieHeader ? { "set-cookie": csrfCookieHeader } : {},
    },
  );
}

function App() {
  const transition = useNavigation();
  const busy = transition.state !== "idle";

  useEffect(() => {
    busy ? nprogress.start() : nprogress.done();
  }, [busy]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-white font-inter text-slate-500 antialiased selection:bg-primary selection:text-white dark:bg-slate-950 dark:text-slate-400">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();

  return (
    <AuthenticityTokenProvider token={data.csrfToken}>
      <App />
    </AuthenticityTokenProvider>
  );
}
