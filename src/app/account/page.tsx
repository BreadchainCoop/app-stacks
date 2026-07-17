import { generateMetadata } from "@/utils/metadata";
import AccountContent from "./_components/account-content";

export const metadata = generateMetadata({
  title: "My Account - Bread Cooperative",
  description: "Manage your account settings",
  url: "/account",
});

export default function Page() {
  return <AccountContent />;
}
