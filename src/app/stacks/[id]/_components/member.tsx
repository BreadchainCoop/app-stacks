import { useUserCircleData } from "@/hooks/use-user-circle-data";
import { Chip } from "@breadcoop/ui";

const StackMember = ({ id }: { id: string }) => {
	const { circleData } = useUserCircleData(BigInt(id));

	if (!circleData || !circleData.isMember) return null;

	return (
		<Chip className="border-system-green text-system-green bg-paper-main max-w-max">
			Member
		</Chip>
	);
};

export default StackMember;
