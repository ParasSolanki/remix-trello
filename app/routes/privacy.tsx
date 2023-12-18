import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { auth } from "~/auth/lucia.server";
import { Header } from "~/components/header";
import { TypographyH1, TypographyP } from "~/components/ui/typography";
import { UserMenu } from "~/components/user-menu";
import { getUserOrganizations } from "~/server/organization.server";
import { getSessionUser } from "~/server/user.server";
import { logout } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Privacy Policay" },
    { name: "description", content: "Remix trello privacy policies." },
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

  const organizations = await getUserOrganizations(session.user.userId);

  return json({ user, organizations } as const);
}

export default function PrivacyPolicyPage() {
  const { user, organizations } = useLoaderData<typeof loader>();

  return (
    <>
      <Header>
        {user && <UserMenu user={user} organizations={organizations} />}
      </Header>
      <main>
        <section className="flex h-56 items-center justify-center bg-primary p-4 lg:h-64">
          <TypographyH1 className="text-white">Privacy Policy</TypographyH1>
        </section>

        <article className="mx-auto mt-12 max-w-[80ch] px-4">
          <TypographyP>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Libero
            nemo tenetur quia rem perspiciatis modi at ipsam aperiam officiis
            aliquid, nulla quasi quisquam ullam tempora quod amet assumenda
            perferendis pariatur?
          </TypographyP>
        </article>
      </main>
    </>
  );
}
