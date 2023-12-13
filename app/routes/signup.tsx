import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import {
  json,
  type DataFunctionArgs,
  type MetaFunction,
  redirect,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Link, useActionData } from "@remix-run/react";
import { LuciaError } from "lucia";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { toast } from "sonner";
import { z } from "zod";
import { auth } from "~/auth/lucia.server";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { PasswordInput } from "~/components/ui/password-input";
import { useIsSubmitting } from "~/hooks/use-is-submitting";
import { validateCSRF } from "~/utils/csrf.server";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(50),
});

export const meta: MetaFunction = () => {
  return [
    { title: "Sign Up" },
    { name: "description", content: "Signup into twitter remix clone" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const authRequest = await auth.handleRequest(request);

  const session = await authRequest.validate();

  if (session) throw redirect("/", 303);

  return json({});
}

export async function action({ request }: DataFunctionArgs) {
  if (request.method !== "POST")
    return new Response("Method not allowed", { status: 405 });

  const authRequest = await auth.handleRequest(request);

  const session = await authRequest.validate();

  if (session) {
    return json(
      { status: "error", error: "Already logged in" },
      { status: 406 },
    );
  }

  const formData = await request.formData();

  await validateCSRF(formData, request.headers);

  const submission = parse(formData, {
    schema: signupSchema,
  });

  // get the password off the payload that's sent back
  delete submission.payload.password;

  if (!submission.value) {
    // @ts-expect-error
    delete submission.value?.password;
    return json({ status: "error", submission } as const, {
      status: 400,
    });
  }
  const { email, password } = submission.value;

  try {
    const user = await auth.createUser({
      key: {
        providerId: "email",
        providerUserId: email,
        password,
      },
      attributes: {
        email,
      },
    });

    const userSession = await auth.createSession({
      userId: user.userId,
      attributes: {},
    });

    const sessionCookie = auth.createSessionCookie(userSession);

    return redirect("/", {
      headers: { "set-cookie": sessionCookie.serialize() },
    });
  } catch (e) {
    console.log({ e });
    // FIXME: update the condition check
    if (
      (typeof e === "object" &&
        e !== null &&
        "code" in e &&
        e.code === "SQLITE_CONSTRAINT_UNIQUE") ||
      (e instanceof LuciaError && e.message === "AUTH_DUPLICATE_KEY_ID")
    ) {
      return json(
        {
          status: "error",
          submission,
          error: "Account with email already exists",
        } as const,
        {
          status: 409,
        },
      );
    }

    return json(
      {
        status: "error",
        submission,
        error: "Something went wrong",
      } as const,
      {
        status: 500,
      },
    );
  }
}

function SignUpForm() {
  const actionData = useActionData<typeof action>();
  const isSubmitting = useIsSubmitting();
  const [form, fields] = useForm({
    id: "signup-form",
    lastSubmission: actionData?.submission,
    shouldRevalidate: "onBlur",
    constraint: getFieldsetConstraint(signupSchema),
    onValidate({ formData }) {
      return parse(formData, { schema: signupSchema });
    },
    defaultValue: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (actionData && actionData.error) toast.error(actionData.error);
  }, [actionData]);

  return (
    <Form method="POST" {...form.props}>
      <fieldset disabled={isSubmitting} className="space-y-4">
        <AuthenticityTokenInput />

        <FormField field={fields.email}>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input
              autoFocus
              placeholder="Enter Email"
              {...conform.input(fields.email, { type: "email" })}
            />
          </FormControl>
          <FormMessage />
        </FormField>

        <FormField field={fields.password}>
          <FormLabel>Password</FormLabel>
          <FormControl>
            <PasswordInput
              placeholder="Enter Password"
              {...conform.input(fields.password)}
            />
          </FormControl>
          <FormMessage />
        </FormField>

        <Button aria-disabled={isSubmitting} form={form.id} type="submit">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign Up
        </Button>
      </fieldset>
    </Form>
  );
}

export default function SignUpPage() {
  return (
    <main className="flex h-screen">
      <div className="hidden h-screen w-6/12 bg-twitter lg:block">
        <div className="mx-auto mt-20 max-w-xl px-2">
          <h1 className="px-2 text-5xl font-bold tracking-tight text-white">
            Create New Account,
          </h1>
        </div>
      </div>
      <div className="relative w-full lg:w-6/12">
        <div className="bg-grid absolute inset-0"></div>
        <div className="relative flex h-full items-center">
          <div className="mx-auto w-full max-w-xl space-y-4 px-4">
            <h3 className="text-4xl font-bold text-foreground">Sign Up</h3>
            <SignUpForm />

            <p className="mt-4 font-medium text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-bold text-primary hover:underline focus:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
