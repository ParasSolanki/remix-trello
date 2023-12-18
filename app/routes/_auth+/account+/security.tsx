import { Separator } from "~/components/ui/separator";
import { TypographyH3, TypographyMuted } from "~/components/ui/typography";

export default function AccountSecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <TypographyH3 className="text-primary">Security</TypographyH3>
        <TypographyMuted>Your account security.</TypographyMuted>
      </div>
      <Separator />
    </div>
  );
}
