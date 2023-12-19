import { ChevronRightIcon } from "lucide-react";
import React from "react";
import {
  Breadcrumb as ReactAriaBreadcrumb,
  Breadcrumbs as ReactAriaBreadcrumbs,
} from "react-aria-components";
import { cn } from "~/lib/utils";

export function Breadcrumbs({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <ReactAriaBreadcrumbs
      className={cn("flex items-center space-x-2 text-sm", className)}
    >
      {children}
    </ReactAriaBreadcrumbs>
  );
}

export function Breadcrumb({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <ReactAriaBreadcrumb
      className={cn("flex items-center space-x-2 text-sm", className)}
    >
      {children}
    </ReactAriaBreadcrumb>
  );
}

export function BreadcrumbLink({
  isCurrent = false,
  className,
  children,
}: React.PropsWithChildren<{
  isCurrent?: boolean;
  className?: string;
}>) {
  return (
    <>
      <span
        aria-disabled={isCurrent}
        className={cn(
          "flex items-center font-semibold aria-disabled:text-muted-foreground/70 [&:not([aria-disabled='true'])]:text-muted-foreground [&:not([aria-disabled='true'])]:focus-within:rounded-sm [&:not([aria-disabled='true'])]:focus-within:text-primary [&:not([aria-disabled='true'])]:focus-within:outline-none [&:not([aria-disabled='true'])]:focus-within:ring-2 [&:not([aria-disabled='true'])]:focus-within:ring-primary [&:not([aria-disabled='true'])]:focus-within:ring-offset-2 [&:not([aria-disabled='true'])]:focus-within:ring-offset-background [&:not([aria-disabled='true'])]:hover:text-primary",
          className,
        )}
      >
        {children}
      </span>
      {!isCurrent && (
        <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
      )}
    </>
  );
}
