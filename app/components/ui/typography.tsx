import React from "react";
import { cn } from "~/lib/utils";

export const TypographyH1 = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<"h1">
>(({ className, children, ...props }, ref) => {
  return (
    <h1
      ref={ref}
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  );
});
TypographyH1.displayName = "TypographyH1";

export const TypographyH2 = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<"h2">
>(({ className, children, ...props }, ref) => {
  return (
    <h2
      ref={ref}
      className={cn(
        "scroll-m-20 text-3xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
});
TypographyH2.displayName = "TypographyH2";

export const TypographyH3 = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<"h3">
>(({ className, children, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
});
TypographyH3.displayName = "TypographyH3";

export const TypographyH4 = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<"h4">
>(({ className, children, ...props }, ref) => {
  return (
    <h4
      ref={ref}
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    >
      {children}
    </h4>
  );
});
TypographyH4.displayName = "TypographyH4";

export const TypographyP = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<"p">
>(({ className, children, ...props }, ref) => {
  return (
    <p ref={ref} className={cn("leading-7", className)} {...props}>
      {children}
    </p>
  );
});
TypographyP.displayName = "TypographyP";

export const TypographyLarge = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<"p">
>(({ className, children, ...props }, ref) => {
  return (
    <p ref={ref} className={cn("text-lg font-semibold", className)} {...props}>
      {children}
    </p>
  );
});
TypographyLarge.displayName = "TypographyLarge";

export const TypographySmall = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<"small">
>(({ className, children, ...props }, ref) => {
  return (
    <small
      ref={ref}
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    >
      {children}
    </small>
  );
});
TypographySmall.displayName = "TypographySmall";

export const TypographyMuted = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<"p">
>(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
});
TypographyMuted.displayName = "TypographyMuted";
