import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type DataFunctionArgs,
} from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  type MetaFunction,
  useParams,
  Link,
} from "@remix-run/react";
import { desc, eq } from "drizzle-orm";
import { Loader2, PlusIcon } from "lucide-react";
import React, { useEffect } from "react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { toast } from "sonner";
import { z } from "zod";
import { auth } from "~/auth/lucia.server";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import {
  TypographyH3,
  TypographyMuted,
  TypographyP,
} from "~/components/ui/typography";
import { db } from "~/db";
import { boards, organizations } from "~/db/schema";
import { useIsSubmitting } from "~/hooks/use-is-submitting";
import { getSessionUser } from "~/server/user.server";
import { logout } from "~/utils/auth.server";
import { validateCSRF } from "~/utils/csrf.server";
import { createBoard } from "~/server/board.server";

const addBoardSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must contain at most 255 character(s)"),
  bannerImageUrl: z.string().min(1, "Banner image is required"),
  organizationId: z.string().min(1, "Organization is required"),
});

export const meta: MetaFunction = () => {
  return [
    { title: "Organization Boards | Remix Trello" },
    { name: "description", content: "Remix Trello Organization" },
  ];
};

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

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, params.organizationId))
    .limit(1);

  if (!org) throw new Response("Organization not found", { status: 404 });

  const orgBoards = await db
    .select({
      id: boards.id,
      name: boards.name,
      bannerImageUrl: boards.bannerImageUrl,
      organizationId: boards.organizationId,
    })
    .from(boards)
    .where(eq(boards.organizationId, org.id))
    .orderBy(desc(boards.createdAt));

  return json({ boards: orgBoards } as const);
}

export async function action({ request }: DataFunctionArgs) {
  if (request.method !== "POST")
    return new Response("Method not allowed", { status: 405 });

  const authRequest = await auth.handleRequest(request);

  const session = await authRequest.validate();

  if (!session) {
    return json({ status: "error", error: "Not authorized" } as const, {
      status: 401,
    });
  }

  const formData = await request.formData();

  await validateCSRF(formData, request.headers);

  const submission = parse(formData, {
    schema: addBoardSchema,
  });

  if (!submission.value) {
    return json({ status: "error", submission } as const, {
      status: 400,
    });
  }

  const { name, bannerImageUrl, organizationId } = submission.value;

  const { data: board, error } = await createBoard({
    name,
    bannerImageUrl,
    organizationId,
    userId: session.user.userId,
  });

  if (error) {
    return json({ status: "error", submission, error } as const, {
      status: 400,
    });
  }

  return redirect(
    `/app/organization/${organizationId}/boards/${board.id}`,
    303,
  );
}

function AddBoardForm() {
  const params = useParams();
  const actionData = useActionData<typeof action>();
  const isSubmitting = useIsSubmitting();
  const [form, fields] = useForm({
    id: "add-board-form",
    lastSubmission: actionData?.submission,
    shouldRevalidate: "onBlur",
    constraint: getFieldsetConstraint(addBoardSchema),
    onValidate({ formData }) {
      return parse(formData, { schema: addBoardSchema });
    },
    defaultValue: {
      name: "",
      bannerImageUrl: "",
      organizationId: params.organizationId,
    },
  });

  useEffect(() => {
    if (actionData && actionData.error) toast.error(actionData.error);
  }, [actionData]);

  return (
    <Form method="POST" {...form.props}>
      <fieldset disabled={isSubmitting} className="space-y-4">
        <AuthenticityTokenInput />

        <input {...conform.input(fields.organizationId, { type: "hidden" })} />

        <FormField field={fields.name}>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input
              autoFocus
              placeholder="Enter Name"
              {...conform.input(fields.name)}
            />
          </FormControl>
          <FormMessage />
        </FormField>

        <FormField field={fields.bannerImageUrl}>
          <FormLabel>Image</FormLabel>
          <FormControl>
            <Input
              placeholder="Enter Image"
              {...conform.input(fields.bannerImageUrl)}
            />
          </FormControl>
          <FormMessage />
        </FormField>

        <Button type="submit" disabled={isSubmitting} form={form.id}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </fieldset>
    </Form>
  );
}

function AddBoardDialog({ children }: React.PropsWithChildren<{}>) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <TypographyH3 className="text-primary">Add Board</TypographyH3>
        </DialogHeader>
        <AddBoardForm />
      </DialogContent>
    </Dialog>
  );
}

export default function OrganizationBoardsPage() {
  const { boards } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div>
        <TypographyH3 className="text-primary">Boards</TypographyH3>
        <TypographyMuted>Manage your organization boards.</TypographyMuted>
      </div>
      <Separator />

      {!boards.length && (
        <div className="mx-auto max-w-md space-y-1.5 text-center">
          <TypographyH3>No Boards Found</TypographyH3>
          <TypographyP>Organization does not have any boards.</TypographyP>

          <AddBoardDialog>
            <Button>Add</Button>
          </AddBoardDialog>
        </div>
      )}

      {!!boards.length && (
        <div className="flex gap-3">
          {boards.map((b) => (
            <Link
              key={b.id}
              to={`/app/organization/${b.organizationId}/boards/${b.id}`}
              className="relative h-24 w-40 overflow-hidden rounded-md bg-contain p-2 font-bold text-white after:absolute after:inset-0 after:-z-[-1] after:bg-black after:opacity-40"
              style={{
                backgroundImage: `url(${b.bannerImageUrl})`,
              }}
            >
              <span className="relative z-10 inline-block">{b.name}</span>
            </Link>
          ))}

          <AddBoardDialog>
            <button className="inline-flex h-24 w-40 items-center justify-center rounded-md bg-primary-foreground p-2 text-sm font-semibold">
              <PlusIcon className="mr-1 h-4 w-4" aria-hidden />
              Add
            </button>
          </AddBoardDialog>
        </div>
      )}
    </div>
  );
}
