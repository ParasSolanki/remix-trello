import { Separator } from "~/components/ui/separator";
import { TypographyH3, TypographyMuted } from "~/components/ui/typography";

export default function AccountGeneralPage() {
  return (
    <div className="space-y-6">
      <div>
        <TypographyH3 className="text-primary">General</TypographyH3>
        <TypographyMuted>Your account settings.</TypographyMuted>
      </div>
      <Separator />
    </div>
  );
}
