import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { DexService, SwapQuote, TokenInfo } from './dex.service';
import { ChainId } from '../chain/chain.config';
import { ChainService } from '../chain/chain.service';
import { POPULAR_TOKENS } from './popular-tokens.config';

@Controller('dex')
export class DexController {
  constructor(
    private readonly dexService: DexService,
    private readonly chainService: ChainService,
  ) {}

  /**
   * 특정 체인에서 견적 조회
   */
  @Get('quote')
  async getQuote(
    @Query('chainId', ParseIntPipe) chainId: number,
    @Query('tokenIn') tokenIn: string,
    @Query('tokenOut') tokenOut: string,
    @Query('amountIn') amountIn: string,
  ): Promise<{ best: SwapQuote | null; all: SwapQuote[] }> {
    const allQuotes = await this.dexService.findBestQuote(
      chainId as ChainId,
      tokenIn,
      tokenOut,
      amountIn,
    );
    const bestQuote = allQuotes.length > 0 ? allQuotes[0] : null;

    return {
      best: bestQuote,
      all: allQuotes,
    };
  }

  /**
   * 여러 체인에서 견적 조회
   */
  @Get('quote/multi-chain')
  async getQuoteMultiChain(
    @Query('chainIds') chainIds: string, // 콤마로 구분된 체인 ID들 (예: "1,8453,42161")
    @Query('tokenIn') tokenIn: string,
    @Query('tokenOut') tokenOut: string,
    @Query('amountIn') amountIn: string,
  ): Promise<{ best: SwapQuote | null; all: SwapQuote[] }> {
    const chainIdArray = chainIds
      .split(',')
      .map((id) => parseInt(id.trim(), 10) as ChainId)
      .filter((id) => !isNaN(id));

    const allQuotes = await this.dexService.findBestQuoteMultiChain(
      chainIdArray,
      tokenIn,
      tokenOut,
      amountIn,
    );
    const bestQuote = allQuotes.length > 0 ? allQuotes[0] : null;

    return {
      best: bestQuote,
      all: allQuotes,
    };
  }

  /**
   * 토큰 정보 조회
   */
  @Get('token/:chainId/:address')
  async getTokenInfo(
    @Param('chainId', ParseIntPipe) chainId: number,
    @Param('address') address: string,
  ): Promise<TokenInfo | null> {
    return this.dexService.getTokenInfo(chainId as ChainId, address);
  }

  /**
   * 지원되는 체인 목록 조회
   */
  @Get('chains')
  getSupportedChains() {
    return this.chainService.getSupportedChains();
  }

  /**
   * 특정 체인에서 지원되는 DEX 목록 조회
   */
  @Get('chains/:chainId/dexes')
  getSupportedDexes(@Param('chainId', ParseIntPipe) chainId: number) {
    const dexes = this.chainService.getSupportedDexes(chainId as ChainId);
    const chainConfig = this.chainService.getChainConfig(chainId as ChainId);

    return {
      chainId,
      chainName: chainConfig?.name,
      dexes: dexes.map((dexName) => ({
        name: dexName,
        config: this.chainService.getDexConfig(chainId as ChainId, dexName),
      })),
    };
  }

  /**
   * 특정 체인에서 인기 토큰 목록 조회
   */
  @Get('chains/:chainId/popular-tokens')
  getPopularTokens(@Param('chainId', ParseIntPipe) chainId: number) {
    const tokens = POPULAR_TOKENS[chainId as ChainId] || [];
    const chainConfig = this.chainService.getChainConfig(chainId as ChainId);

    return {
      chainId,
      chainName: chainConfig?.name,
      tokens,
    };
  }

  /**
   * 모든 체인의 인기 토큰 목록 조회
   */
  @Get('popular-tokens')
  getAllPopularTokens() {
    const result: Record<number, (typeof POPULAR_TOKENS)[ChainId.BASE]> = {};

    Object.entries(POPULAR_TOKENS).forEach(([chainId, tokens]) => {
      result[Number(chainId)] = tokens;
    });

    return result;
  }

  /**
   * 유동성 추가 견적 조회 (모든 DEX)
   */
  @Get('liquidity/quote')
  async getLiquidityQuote(
    @Query('chainId', ParseIntPipe) chainId: number,
    @Query('tokenA') tokenA: string,
    @Query('tokenB') tokenB: string,
    @Query('amountA') amountA: string,
    @Query('amountB') amountB: string,
  ) {
    const quotes = await this.dexService.getAllLiquidityQuotes(
      chainId as ChainId,
      tokenA,
      tokenB,
      amountA,
      amountB,
    );

    return {
      chainId,
      quotes,
    };
  }

  /**
   * 특정 DEX의 유동성 추가 견적 조회
   */
  @Get('liquidity/quote/:dexName')
  async getLiquidityQuoteByDex(
    @Query('chainId', ParseIntPipe) chainId: number,
    @Query('tokenA') tokenA: string,
    @Query('tokenB') tokenB: string,
    @Query('amountA') amountA: string,
    @Query('amountB') amountB: string,
    @Param('dexName') dexName: string,
  ) {
    const quote = await this.dexService.getLiquidityQuote(
      chainId as ChainId,
      dexName,
      tokenA,
      tokenB,
      amountA,
      amountB,
    );

    return {
      chainId,
      dex: dexName,
      quote,
    };
  }
}
