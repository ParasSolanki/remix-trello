import { useFormAction, useNavigation } from "@remix-run/react";

/**
 * Returns true if the current navigation is submitting the current route's
 * form. Defaults to the current route's form action and method POST.
 *
 * @see https://github.com/epicweb-dev/web-forms/blob/main/exercises/07.csrf/01.solution.setup/app/utils/misc.tsx#L65
 */
export function useIsSubmitting({
  formAction,
  formMethod = "POST",
}: {
  formAction?: string;
  formMethod?: "POST" | "GET" | "PUT" | "PATCH" | "DELETE";
} = {}) {
  const contextualFormAction = useFormAction();
  const navigation = useNavigation();
  return (
    navigation.state === "submitting" &&
    navigation.formAction === (formAction ?? contextualFormAction) &&
    navigation.formMethod === formMethod
  );
}
