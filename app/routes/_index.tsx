import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { auth } from "~/auth/lucia.server";
import { buttonVariants } from "~/components/ui/button";
import { TypographyH1, TypographyP } from "~/components/ui/typography";
import { UserMenu } from "~/components/user-menu";
import { cn } from "~/lib/utils";
import { getSessionUser } from "~/server/user.server";
import { logout } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Trello" },
    { name: "description", content: "Remix Trello" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const authRequest = await auth.handleRequest(request);

  const session = await authRequest.validate();

  let user = null;

  if (session) {
    const { data, error } = await getSessionUser(session.user.userId);
    if (error) {
      return await logout(session.sessionId);
    }

    user = data;
  }

  return json({ user } as const);
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <header className=" flex h-20 items-center border-b border-primary/20">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-slate-900">
              Remix Trello
            </Link>
            {user && <UserMenu user={user} />}
            {!user && (
              <div className="flex space-x-3">
                <Link
                  to="/signin"
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  Login
                </Link>
                <Link to="/signup" className={cn(buttonVariants())}>
                  Signup
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <section className="flex flex-grow items-center">
        <div className="mx-auto max-w-3xl space-y-4 px-4 text-center">
          <TypographyH1 className="text-primary">Remix Trello</TypographyH1>
          <TypographyP className="text-lg">
            Collaborate, manage projects, and reach new productivity peaks. From
            high rises to the home office, the way your team works is unique -
            accomplish it all with Remix Trello.
          </TypographyP>
          <Link
            to={user ? "/app" : "/signin"}
            className={cn(buttonVariants({ size: "lg" }), "text-lg")}
          >
            Get Started
          </Link>
        </div>
      </section>

      <footer className="flex h-20 items-center border-t border-primary/20">
        <div className="container mx-auto px-4">
          <nav className="flex flex-wrap items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-slate-900">
              Remix Trello
            </Link>

            <div className="grid grid-cols-2 divide-x text-center">
              <Link
                to="/privacy"
                className="hover:text-slate-600 focus:text-slate-600"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="pl-4 hover:text-slate-600 focus:text-slate-600"
              >
                Terms of Service
              </Link>
            </div>
          </nav>
        </div>
      </footer>
    </main>
  );
}
