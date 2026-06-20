import { headers } from "next/headers";
import { userAgentFromString } from "next/server";

export async function isServerMobile() {
  const headersList = await headers();
  const ua = headersList.get("user-agent");
  const { device } = userAgentFromString(ua ?? undefined);
  return device.type === "mobile" || device.type === "tablet";
}
