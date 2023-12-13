import { Form, Link } from "@remix-run/react";
import { Building2Icon, HomeIcon, LogOut, User2Icon } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";

import { type SessionUser } from "~/server/user.server";
import { useMemo } from "react";

export function UserMenu({ user }: { user: SessionUser }) {
  const userInitials = useMemo(() => {
    if (!user.displayName) return undefined;

    const splited = user.displayName.split(" ");

    return `${splited[0] ? splited[0].charAt(0).toUpperCase() : ""}${
      splited[1] ? splited[1].charAt(0).toUpperCase() : ""
    }`;
  }, [user.displayName]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="text-foreground">
              {userInitials ?? <User2Icon className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.displayName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/" className="inline-flex w-full items-center">
            <HomeIcon className="mr-2 h-4 w-4" />
            Home
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/app" className="inline-flex w-full items-center">
            <Building2Icon className="mr-2 h-4 w-4" />
            Organizations
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-500 hover:cursor-pointer hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white">
          <Form action="/logout" method="POST">
            <AuthenticityTokenInput />
            <button type="submit" className="flex items-center">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </button>
          </Form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
