import { type MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { TypographyH1 } from "~/components/ui/typography";

export const meta: MetaFunction = () => {
  return [
    { title: "Terms of Service" },
    { name: "description", content: "Remix trello terms of services." },
  ];
};

export default function TermsOfServicePage() {
  return (
    <main>
      <header className=" flex h-20 items-center border-b border-primary/20">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-slate-900">
              Remix Trello
            </Link>
          </nav>
        </div>
      </header>
      <section className="flex h-56 items-center justify-center bg-primary p-4 lg:h-64">
        <TypographyH1 className="text-white">Terms Of Service</TypographyH1>
      </section>
    </main>
  );
}
