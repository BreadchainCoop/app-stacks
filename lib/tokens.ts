// A mapping of known token addresses on Gnosis chain to their metadata
export const tokenInfo: { [key: string]: { symbol: string; decimals: number } } = {
  "0xddafbb505ad214d7b80b1f830fccc89b60fb7a83": { symbol: "USDC", decimals: 6 },
  "0xa555d5344f6fb6c65da19e403cb4c1ec4a1a5ee3": { symbol: "BREAD", decimals: 18 },
  "0x4ecaba5870353805a9f068101a40e0f32ed605c6": { symbol: "DAI", decimals: 18 },
  // Gnosis doesn't have native USDT, this is a common wrapped version
  "0x4ecaba5870353805a9f068101a40e0f32ed605c6": { symbol: "USDT", decimals: 6 },
}
