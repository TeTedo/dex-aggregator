import { SwapQuote, TokenInfo } from '../dex.service';
import { ChainId } from '../../chain/chain.config';

export abstract class BaseDexService {
  abstract name: string;
  abstract chainId: ChainId;

  /**
   * 스왑 견적을 가져옵니다
   */
  abstract getQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
  ): Promise<SwapQuote | null>;

  /**
   * 토큰 정보를 가져옵니다
   */
  abstract getTokenInfo(tokenAddress: string): Promise<TokenInfo | null>;

  /**
   * 유동성 추가 시 받게 될 LP 토큰 수량을 계산합니다
   */
  abstract getLiquidityQuote(
    tokenA: string,
    tokenB: string,
    amountA: string,
    amountB: string,
  ): Promise<{ lpTokens: string; share: number } | null>;

  /**
   * 가격 영향도를 계산합니다
   */
  protected calculatePriceImpact(
    amountIn: bigint,
    amountOut: bigint,
    reserveIn: bigint,
    reserveOut: bigint,
  ): number {
    // 간단한 가격 영향도 계산 (실제로는 더 복잡한 공식 사용)
    const k = reserveIn * reserveOut;
    const newReserveIn = reserveIn + amountIn;
    const newReserveOut = k / newReserveIn;
    const expectedOut = reserveOut - newReserveOut;

    const impact =
      Number(((amountOut - expectedOut) * BigInt(10000)) / expectedOut) / 100;
    return Math.abs(impact);
  }
}
