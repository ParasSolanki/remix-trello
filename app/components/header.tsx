import { Link } from "@remix-run/react";

export function Header({ children }: React.PropsWithChildren<{}>) {
  return (
    <header className="flex h-20 items-center border-b border-primary/60">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-slate-900">
            Remix Trello
          </Link>
          {children}
        </nav>
      </div>
    </header>
  );
}
