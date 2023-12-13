import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type MetaFunction,
  type DataFunctionArgs,
} from "@remix-run/node";
import { Link, useActionData, useLoaderData } from "@remix-run/react";
import { eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { Building, Loader2, PlusIcon } from "lucide-react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { auth } from "~/auth/lucia.server";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyP,
  TypographySmall,
} from "~/components/ui/typography";
import { db } from "~/db";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { organizationMembers, organizations } from "~/db/schema";
import { useIsSubmitting } from "~/hooks/use-is-submitting";
import { cn } from "~/lib/utils";
import { getSessionUser } from "~/server/user.server";
import { logout } from "~/utils/auth.server";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Input } from "~/components/ui/input";
import { validateCSRF } from "~/utils/csrf.server";
import { z } from "zod";
import kebabCase from "lodash.kebabcase";
import { createOrganization } from "~/server/organization.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Trello | App" },
    { name: "description", content: "Remix Trello" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const authRequest = await auth.handleRequest(request);

  const session = await authRequest.validate();

  if (!session) throw redirect("/signin", 303);

  const { data: user, error } = await getSessionUser(session.user.userId);

  if (error) {
    return await logout(session.sessionId);
  }

  const org = alias(organizations, "org");

  const userOrganizations = await db
    .select({
      id: org.id,
      name: org.name,
      slug: org.slug,
      logoUrl: org.logoUrl,
      ownerId: org.ownerId,
      totalMembers: sql<number>`(select cast(count(*) as int) from \`organization_members\` where \`organization_id\` = \`org\`.\`id\`)`,
    })
    .from(organizationMembers)
    .leftJoin(org, eq(org.id, organizationMembers.organizationId))
    .where(eq(organizationMembers.memberId, user.id));

  return json({ user, organizations: userOrganizations } as const);
}

export async function action({ request }: DataFunctionArgs) {
  if (request.method !== "POST")
    return new Response("Method not allowed", { status: 405 });

  const authRequest = await auth.handleRequest(request);

  const session = await authRequest.validate();

  if (!session) {
    return json({ status: "error", error: "Not authorized" }, { status: 401 });
  }

  const formData = await request.formData();

  await validateCSRF(formData, request.headers);

  const submission = parse(formData, {
    schema: createOrganizationSchema,
  });

  if (!submission.value) {
    return json({ status: "error", submission } as const, {
      status: 400,
    });
  }

  const { data: org, error } = await createOrganization({
    name: submission.value.name,
    slug: submission.value.slug,
    userId: session.user.userId,
  });

  if (error) {
    return json({ status: "error", submission, error } as const, {
      status: 500,
    });
  }

  return redirect(`organization/${org.id}`, 303);
}

const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must contain at most 255 character(s)"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(255, "Slug must contain at most 255 character(s)"),
});

function CreateOrganizationForm() {
  const actionData = useActionData<typeof action>();
  const isSubmitting = useIsSubmitting();
  const [form, fields] = useForm({
    id: "create-organization-form",
    lastSubmission: actionData?.submission,
    shouldRevalidate: "onBlur",
    constraint: getFieldsetConstraint(createOrganizationSchema),
    onValidate({ formData }) {
      return parse(formData, { schema: createOrganizationSchema });
    },
    defaultValue: {
      name: "",
      slug: "",
      logoUrl: undefined,
    },
  });

  const slugInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (actionData && actionData.error) toast.error(actionData.error);
  }, [actionData]);

  return (
    <Form method="POST" {...form.props}>
      <fieldset disabled={isSubmitting} className="space-y-4">
        <AuthenticityTokenInput />

        <FormField field={fields.name}>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input
              autoFocus
              placeholder="Enter Name"
              {...conform.input(fields.name)}
              onInput={(e) => {
                if (slugInputRef.current)
                  slugInputRef.current.value = kebabCase(e.currentTarget.value);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormField>

        <FormField field={fields.slug}>
          <FormLabel>Slug</FormLabel>
          <FormControl>
            <Input
              ref={slugInputRef}
              placeholder="Enter Slug"
              {...conform.input(fields.slug)}
            />
          </FormControl>
          <FormMessage />
        </FormField>

        {/* <FormField field={fields.logoUrl}>
          <FormLabel>Logo</FormLabel>
          <FormControl>
            <Input
              placeholder="Enter Slug"
              {...conform.input(fields.logoUrl)}
            />
          </FormControl>
          <FormMessage />
        </FormField> */}

        <Button type="submit" disabled={isSubmitting} form={form.id}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </fieldset>
    </Form>
  );
}

function CreateOrganization() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline" className="text-primary">
          <PlusIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <TypographyH3 className="text-primary">
            Create Organization
          </TypographyH3>
        </DialogHeader>
        <CreateOrganizationForm />
      </DialogContent>
    </Dialog>
  );
}

export default function AppPage() {
  const { user, organizations } = useLoaderData<typeof loader>();

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-12">
      <TypographyH1 className="text-primary">
        Welcome {user.displayName ?? "Back"},
      </TypographyH1>

      <section className="space-y-6">
        <div className="flex justify-between">
          <TypographyH2 className="text-primary">Organizations</TypographyH2>
          <CreateOrganization />
        </div>

        {!organizations.length && (
          <div className="mx-auto max-w-md py-6 text-center">
            <TypographyH3>No Organization Found</TypographyH3>
            <TypographyP>
              You are not part of any organization, either join one or create a
              new organization to get started.
            </TypographyP>
          </div>
        )}

        {!!organizations.length && (
          <ul className="space-y-4">
            {organizations.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between rounded-md border px-4 py-6"
              >
                <div className="flex space-x-1.5">
                  {!o.logoUrl && <Building className="h-14 w-14" />}
                  <div className="space-y-0.5">
                    <TypographyH4>{o.name}</TypographyH4>
                    <TypographySmall>
                      {o.totalMembers > 1
                        ? `${o.totalMembers} Members`
                        : `${o.totalMembers} Member`}
                    </TypographySmall>
                  </div>
                </div>
                <div>
                  <Link
                    to={`/app/organization/${o.id}`}
                    className={cn(buttonVariants())}
                  >
                    View
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
