import React from "react";
import { Input } from "./input";
import { Button } from "./button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { cn } from "~/lib/utils";

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={showPassword ? "text" : "password"}
        className={cn("pr-11", className)}
        {...props}
      />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="absolute right-0 top-1/2 -translate-y-1/2"
        onClick={() => setShowPassword((showPassword) => !showPassword)}
      >
        {showPassword && <EyeIcon className="h-4 w-4" />}
        {!showPassword && <EyeOffIcon className="h-4 w-4" />}
      </Button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";
