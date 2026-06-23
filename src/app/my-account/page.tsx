import { generateMetadata } from "@/utils/metadata";
import { Body, Heading1 } from "@breadcoop/ui";
import { AccountContent } from "@/app/my-account/_components/account-content";

export const metadata = generateMetadata({
  title: "My Account - Bread Cooperative",
  description: "Your activity across Bread apps.",
  url: "/my-account",
});

export default function MyAccountPage() {
  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-2">
        <Heading1 className="text-3xl">My Account</Heading1>
        <Body className="text-surface-grey">
          Your activity across Bread apps.
        </Body>
      </header>

      <AccountContent />
    </div>
  );
}
