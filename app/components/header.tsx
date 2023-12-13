import { Link } from "@remix-run/react";
import { UserMenu } from "./user-menu";
import { type SessionUser } from "~/server/user.server";

export function Header({ user }: { user: SessionUser }) {
  return (
    <header className="flex h-20 items-center border-b border-primary/60">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-slate-900">
            Remix Trello
          </Link>
          <UserMenu user={user} />
        </nav>
      </div>
    </header>
  );
}
