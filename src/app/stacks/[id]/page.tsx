import PageContent from "./_components/page-content";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
	const { id } = await params;

	return <PageContent id={id} />;
};

export default Page;
