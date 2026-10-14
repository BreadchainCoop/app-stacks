import { generateMetadata as _generateMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import PageContent from "./_components/page-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  return _generateMetadata({
    title: "View Conditional Grant - Bread Cooperative",
    description:
      "A zero-interest advance with a grant that unlocks once it is paid back.",
    url: `/conditional-grants/${id}`,
  });
}

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return <PageContent id={id} />;
};

export default Page;
