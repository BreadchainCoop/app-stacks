import { useAccount } from "wagmi";
import HomeTab from "./tab";
// import HomeUserStacks from "./user-stacks";

const HomeLoggedInDetails = () => {
	const { isConnected, address } = useAccount();

	if (!isConnected || !address) return null;

	return (
		<>
			<HomeTab />
			{/* <HomeUserStacks address={address} /> */}
		</>
	);
};

export default HomeLoggedInDetails;
