import { Link, useLocation, type MetaFunction, Outlet } from "@remix-run/react";
import { LockIcon, SettingsIcon } from "lucide-react";
import { buttonVariants } from "~/components/ui/button";
import { TypographyH2 } from "~/components/ui/typography";
import { cn } from "~/lib/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "Account | Remix Trello" },
    { name: "description", content: "Account Remix Trello" },
  ];
};

const sidebarLinks = [
  {
    title: "General",
    href: "/account",
    icon: SettingsIcon,
  },
  {
    title: "Security",
    href: "/account/security",
    icon: LockIcon,
  },
];

export default function AccountPage() {
  const location = useLocation();

  return (
    <>
      <div className="container mx-auto border-b border-b-primary/60 px-4 py-10">
        <TypographyH2 className="text-primary">Account Settings</TypographyH2>
      </div>
      <div className="container mx-auto mt-10 px-10">
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
              <ul>
                {sidebarLinks.map((item) => (
                  <li key={item.title}>
                    <Link
                      to={item.href}
                      className={cn(
                        buttonVariants({ variant: "ghost" }),
                        location.pathname === item.href
                          ? "bg-muted text-primary hover:bg-muted"
                          : "hover:bg-transparent hover:underline",
                        "w-full justify-start text-base",
                      )}
                    >
                      <item.icon className="mr-2 h-5 w-5" aria-hidden />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
          <div className="flex-1 lg:max-w-2xl">
          <Outlet />
        </div>
        </div>
      </div>
    </>
  );
}
