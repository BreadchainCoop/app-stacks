import { Address } from "viem";
import { clientEnv } from "./env";
import { isLocalMode } from "./network-mode";

const local = isLocalMode();

export const SAVING_CIRCLES_CONTRACT_ADDRESS = (
  local
    ? clientEnv.NEXT_PUBLIC_LOCAL_SAVING_CIRCLES_ADDRESS
    : clientEnv.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS
) as Address;

export const SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS = (
  local
    ? clientEnv.NEXT_PUBLIC_LOCAL_SAVING_CIRCLES_VIEWER_ADDRESS
    : clientEnv.NEXT_PUBLIC_SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS
) as Address;

export const AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS = (
  local
    ? clientEnv.NEXT_PUBLIC_LOCAL_AUTOMATIC_SAVING_CIRCLES_ADDRESS
    : clientEnv.NEXT_PUBLIC_AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS
) as Address;

export const BREAD_TOKEN_ADDRESS = (
  local
    ? clientEnv.NEXT_PUBLIC_LOCAL_BREAD_TOKEN_ADDRESS
    : clientEnv.NEXT_PUBLIC_BREAD_TOKEN_ADDRESS
) as Address;
