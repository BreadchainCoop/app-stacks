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
    title: "View Goal - Bread Cooperative",
    description: "Save together toward a target by a deadline.",
    url: `/goals/${id}`,
  });
}

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return <PageContent id={id} />;
};

export default Page;
