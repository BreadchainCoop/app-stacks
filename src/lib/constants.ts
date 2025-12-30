import { Address } from "viem";
import { clientEnv } from "./env";

export const SAVING_CIRCLES_CONTRACT_ADDRESS =
	clientEnv.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS as Address;

export const SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS =
	clientEnv.NEXT_PUBLIC_SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS as Address;

export const BREAD_TOKEN_ADDRESS =
	clientEnv.NEXT_PUBLIC_BREAD_TOKEN_ADDRESS as Address;
