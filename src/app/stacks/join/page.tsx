import { generateMetadata } from "@/utils/metadata";
import PageContent from "./_components/page-content";

export const metadata = generateMetadata({
  title: "Join a Stack - Bread Cooperative",
  description: "Connect with your friends.",
  url: "/stacks/join",
});

export default function Page() {
  return <PageContent />;
}
