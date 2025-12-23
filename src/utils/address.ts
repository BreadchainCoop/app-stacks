import { Address } from "viem";

export const formatAddress = (address: Address) =>
	`${address.slice(0, 6)}...${address.slice(-4)}`;
