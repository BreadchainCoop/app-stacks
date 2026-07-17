import { generateMetadata } from "@/utils/metadata";
import OwnAccountRedirect from "./_components/own-account-redirect";

export const metadata = generateMetadata({
  title: "My Account - Bread Cooperative",
  description: "Your activity across Bread apps.",
  url: "/account",
});

export default function AccountIndexPage() {
  return <OwnAccountRedirect />;
}
