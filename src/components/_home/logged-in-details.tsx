import { useAccount } from "wagmi";
import HomeTab from "./tab";
import HomeUserStacks from "./user-stacks";
import { useConnectedUser } from "@breadcoop/ui";

const HomeLoggedInDetails = () => {
	const { user } = useConnectedUser();

	if (!(user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN")) return null;

	return (
		<>
			<HomeTab />
			<HomeUserStacks address={user.address} />
		</>
	);
};

export default HomeLoggedInDetails;
