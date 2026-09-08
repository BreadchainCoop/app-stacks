import { headers } from "next/headers";
import { isMiniPayUserAgent } from "@/utils/minipay";

export async function isServerMiniPay() {
  const headersList = await headers();
  return isMiniPayUserAgent(headersList.get("user-agent"));
}
