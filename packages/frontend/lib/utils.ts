import { Token } from "./api";

/**
 * 토큰 수량을 읽기 쉬운 형식으로 변환
 */
export function formatTokenAmount(
  amount: string,
  decimals: number,
  precision: number = 6
): string {
  const divisor = BigInt(10 ** decimals);
  const amountBigInt = BigInt(amount);
  const wholePart = amountBigInt / divisor;
  const fractionalPart = amountBigInt % divisor;

  if (fractionalPart === BigInt(0)) {
    return wholePart.toString();
  }

  const fractionalStr = fractionalPart.toString().padStart(decimals, "0");
  const trimmed = fractionalStr.slice(0, precision).replace(/0+$/, "");

  if (trimmed === "") {
    return wholePart.toString();
  }

  return `${wholePart}.${trimmed}`;
}

/**
 * 토큰 수량을 wei 단위로 변환
 */
export function parseTokenAmount(amount: string, decimals: number): string {
  const [whole, fractional = ""] = amount.split(".");
  const fractionalPadded = fractional.padEnd(decimals, "0").slice(0, decimals);
  return (
    BigInt(whole) * BigInt(10 ** decimals) +
    BigInt(fractionalPadded)
  ).toString();
}

/**
 * 토큰 심볼 표시
 */
export function getTokenDisplay(token: Token | null): string {
  if (!token) return "Select token";
  return token.symbol;
}
