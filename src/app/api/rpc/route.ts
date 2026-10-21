import { NextRequest } from "next/server";

// Same-origin JSON-RPC proxy.
//
// The browser talks to /api/rpc (first-party, same origin as the app that just
// loaded) and this route forwards the JSON-RPC body to the upstream RPC
// server-side. This keeps on-chain reads working for users whose VPN / DNS /
// ad-blocker blocks, reroutes, or CORS-breaks the public RPC endpoint directly
// (reported by a member on a VPN), and keeps the upstream URL off the client.
//
// Override the upstreams with GNOSIS_RPC_URL / SEPOLIA_RPC_URL (e.g. a private
// Alchemy/Ankr endpoint) in the server environment.
const UPSTREAM: Record<string, string> = {
  "100": process.env.GNOSIS_RPC_URL || "https://rpc.gnosischain.com",
  "11155111":
    process.env.SEPOLIA_RPC_URL ||
    "https://ethereum-sepolia-rpc.publicnode.com",
};

export async function POST(req: NextRequest) {
  const chainId = req.nextUrl.searchParams.get("chainId") || "100";
  const upstream = UPSTREAM[chainId];
  if (!upstream) {
    return new Response(
      JSON.stringify({ error: `unsupported chainId ${chainId}` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = await req.text();
  try {
    const res = await fetch(upstream, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "upstream RPC unreachable" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
