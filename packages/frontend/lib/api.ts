const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9090";

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  isNative?: boolean;
  logoURI?: string;
}

export interface SwapQuote {
  dex: string;
  chainId: number;
  amountOut: string;
  route: string[];
}

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorer?: string;
}

export async function getSupportedChains(): Promise<ChainConfig[]> {
  const response = await fetch(`${API_BASE_URL}/dex/chains`);
  if (!response.ok) throw new Error("Failed to fetch chains");
  return response.json();
}

export async function getPopularTokens(chainId: number): Promise<Token[]> {
  const response = await fetch(
    `${API_BASE_URL}/dex/chains/${chainId}/popular-tokens`
  );
  if (!response.ok) throw new Error("Failed to fetch popular tokens");
  const data = await response.json();
  return data.tokens;
}

export async function getQuote(
  chainId: number,
  tokenIn: string,
  tokenOut: string,
  amountIn: string
): Promise<{ best: SwapQuote | null; all: SwapQuote[] }> {
  const params = new URLSearchParams({
    chainId: chainId.toString(),
    tokenIn,
    tokenOut,
    amountIn,
  });
  const response = await fetch(`${API_BASE_URL}/dex/quote?${params}`);
  if (!response.ok) throw new Error("Failed to fetch quote");
  return response.json();
}

export async function getTokenInfo(
  chainId: number,
  address: string
): Promise<Token | null> {
  const response = await fetch(
    `${API_BASE_URL}/dex/token/${chainId}/${address}`
  );
  if (!response.ok) return null;
  return response.json();
}
