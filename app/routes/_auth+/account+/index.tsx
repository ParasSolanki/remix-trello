import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { Loader2Icon } from "lucide-react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { z } from "zod";
import { auth } from "~/auth/lucia.server";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { TypographyH3, TypographyMuted } from "~/components/ui/typography";
import { useIsSubmitting } from "~/hooks/use-is-submitting";
import { getSessionUser, updateUserDisplayName } from "~/server/user.server";
import { logout } from "~/utils/auth.server";
import { validateCSRF } from "~/utils/csrf.server";

const PROFILE_ACTION_TYPES = {
  DISPLAY_NAME: "display-name",
} as const;
type ProfileActionTypes =
  (typeof PROFILE_ACTION_TYPES)[keyof typeof PROFILE_ACTION_TYPES];

const displayNameSchema = z.object({
  displayName: z
    .string({
      required_error: "Display name is required",
    })
    .min(1)
    .max(32),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const authRequest = await auth.handleRequest(request);

  const session = await authRequest.validate();

  if (!session) throw redirect("/signin", 303);

  const { data: user, error } = await getSessionUser(session.user.userId);

  if (error) {
    return await logout(session.sessionId);
  }

  return json({ user } as const);
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST")
    return new Response("Method not allowed", { status: 405 });

  const authRequest = await auth.handleRequest(request);

  const session = await authRequest.validate();

  if (!session) {
    return json({ status: "error", error: "Not authorized" }, { status: 401 });
  }

  const formData = await request.formData();

  await validateCSRF(formData, request.headers);

  const action = formData.get("_action") as ProfileActionTypes | null;

  if (action === "display-name") {
    const submission = parse(formData, {
      schema: displayNameSchema,
    });

    if (!submission.value) {
      return json({ status: "error", submission } as const, {
        status: 400,
      });
    }

    const { error } = await updateUserDisplayName(
      session.user.userId,
      submission.value.displayName,
    );

    if (error) {
      return json({ status: "error", error, submission } as const, {
        status: 500,
      });
    }

    return json({ status: "success" } as const);
  } else {
    return json({
      status: "error",
      error: "Invalid action type",
    } as const);
  }
}

function DisplayNameCard({ displayName }: { displayName: string | null }) {
  const actionData = useActionData<typeof action>();
  const isSubmitting = useIsSubmitting();
  const [form, fields] = useForm({
    id: "display-name-form",
    lastSubmission: actionData?.submission,
    shouldRevalidate: "onBlur",
    constraint: getFieldsetConstraint(displayNameSchema),
    onValidate({ formData }) {
      return parse(formData, { schema: displayNameSchema });
    },
    defaultValue: {
      displayName,
    },
  });

  return (
    <Form method="POST" {...form.props}>
      <fieldset disabled={isSubmitting}>
        <AuthenticityTokenInput />
        <Card>
          <CardHeader>
            <CardTitle>Display Name</CardTitle>
            <CardDescription>This is your display name.</CardDescription>
          </CardHeader>
          <CardContent className="w-96">
            <FormField field={fields.displayName}>
              <FormControl>
                <Input
                  placeholder="Enter your display name"
                  className="py-5 text-base"
                  {...conform.input(fields.displayName)}
                />
              </FormControl>
              <FormMessage />
            </FormField>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t py-4">
            <p className="text-base text-muted-foreground">
              Please use 32 characters at maximum.
            </p>
            <Button
              form={form.id}
              type="submit"
              aria-disabled={isSubmitting}
              name="_action"
              value={PROFILE_ACTION_TYPES.DISPLAY_NAME}
            >
              {isSubmitting && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save
            </Button>
          </CardFooter>
        </Card>
      </fieldset>
    </Form>
  );
}

export default function AccountGeneralPage() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div>
        <TypographyH3 className="text-primary">General</TypographyH3>
        <TypographyMuted>Your account settings.</TypographyMuted>
      </div>
      <Separator />

      <DisplayNameCard displayName={user.displayName} />
    </div>
  );
}
