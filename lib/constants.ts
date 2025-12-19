import { Address } from "viem";
import { clientEnv } from "./env";

export const STACKS_CONTRACT_ADDRESS =
	clientEnv.NEXT_PUBLIC_STACKS_CONTRACT_ADDRESS as Address;

export const BREAD_TOKEN_ADDRESS =
	clientEnv.NEXT_PUBLIC_BREAD_TOKEN_ADDRESS as Address;
