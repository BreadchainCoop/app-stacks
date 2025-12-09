import { Address } from "viem";
import { clientEnv } from "./env";

export const STACKS_CONTRACT_ADDRESS =
	clientEnv.NEXT_PUBLIC_STACKS_CONTRACT_ADDRESS as Address;
