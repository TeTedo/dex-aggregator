import { Injectable } from '@nestjs/common';
import { ChainId } from '../chain/chain.config';
import { DexFactoryService } from './dex-factory.service';

export interface SwapQuote {
  dex: string;
  chainId: ChainId;
  amountOut: string;
  route: string[];
}

export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
  chainId: ChainId;
}

@Injectable()
export class DexService {
  constructor(private readonly dexFactory: DexFactoryService) {}

  /**
   * 특정 체인에서 여러 DEX의 최적 스왑 경로를 찾습니다
   */
  async findBestQuote(
    chainId: ChainId,
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
  ): Promise<SwapQuote[]> {
    const quotes: SwapQuote[] = [];
    const dexServices = this.dexFactory.getAllDexServices(chainId);

    // 모든 DEX에서 병렬로 견적 조회
    const quotePromises = dexServices.map(async (dexService) => {
      try {
        const quote = await dexService.getQuote(tokenIn, tokenOut, amountIn);
        if (quote) {
          return {
            ...quote,
            chainId,
          };
        }
      } catch (error) {
        console.error(
          `${dexService.name} quote error on chain ${chainId}:`,
          error,
        );
      }
      return null;
    });

    const results = await Promise.all(quotePromises);
    quotes.push(...results.filter((q): q is SwapQuote => q !== null));

    // 최적의 가격 순으로 정렬
    return quotes.sort((a, b) => {
      const amountA = BigInt(a.amountOut);
      const amountB = BigInt(b.amountOut);
      return amountA > amountB ? -1 : amountA < amountB ? 1 : 0;
    });
  }

  /**
   * 여러 체인에서 최적의 스왑 경로를 찾습니다
   */
  async findBestQuoteMultiChain(
    chainIds: ChainId[],
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
  ): Promise<SwapQuote[]> {
    const allQuotes: SwapQuote[] = [];

    // 모든 체인에서 병렬로 견적 조회
    const chainPromises = chainIds.map((chainId) =>
      this.findBestQuote(chainId, tokenIn, tokenOut, amountIn),
    );

    const chainResults = await Promise.all(chainPromises);
    allQuotes.push(...chainResults.flat());

    // 최적의 가격 순으로 정렬
    return allQuotes.sort((a, b) => {
      const amountA = BigInt(a.amountOut);
      const amountB = BigInt(b.amountOut);
      return amountA > amountB ? -1 : amountA < amountB ? 1 : 0;
    });
  }

  /**
   * 최고의 스왑 경로를 반환합니다
   */
  async getBestQuote(
    chainId: ChainId,
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
  ): Promise<SwapQuote | null> {
    const quotes = await this.findBestQuote(
      chainId,
      tokenIn,
      tokenOut,
      amountIn,
    );
    return quotes.length > 0 ? quotes[0] : null;
  }

  /**
   * 토큰 정보를 조회합니다
   */
  async getTokenInfo(
    chainId: ChainId,
    tokenAddress: string,
  ): Promise<TokenInfo | null> {
    const dexServices = this.dexFactory.getAllDexServices(chainId);

    // 모든 DEX에서 순차적으로 시도
    for (const dexService of dexServices) {
      try {
        const info = await dexService.getTokenInfo(tokenAddress);
        if (info) {
          return {
            ...info,
            chainId,
          };
        }
      } catch (error) {
        console.error(
          `${dexService.name} token info error on chain ${chainId}:`,
          error,
        );
      }
    }

    return null;
  }
}
