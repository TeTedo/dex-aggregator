import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { BaseDexService } from './base-dex.service';
import { SwapQuote, TokenInfo } from '../dex.service';
import { ChainId } from '../../chain/chain.config';
import { ChainService } from '../../chain/chain.service';

@Injectable()
export class SushiswapService extends BaseDexService {
  name = 'SushiSwap';
  chainId: ChainId;
  private provider: ethers.JsonRpcProvider;
  private routerAddress: string;

  constructor(chainId: ChainId, chainService: ChainService) {
    super();
    this.chainId = chainId;

    const provider = chainService.getProvider(chainId);
    if (!provider) {
      throw new Error(`Provider not found for chain ${chainId}`);
    }
    this.provider = provider;

    const dexConfig = chainService.getDexConfig(chainId, 'sushiswap');
    if (!dexConfig) {
      throw new Error(`SushiSwap not configured for chain ${chainId}`);
    }
    this.routerAddress = dexConfig.router;
  }

  async getQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
  ): Promise<SwapQuote | null> {
    try {
      // SushiSwap Router ABI (Uniswap V2와 동일한 인터페이스)
      const routerAbi = [
        'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
      ];

      const router = new ethers.Contract(
        this.routerAddress,
        routerAbi,
        this.provider,
      );

      const path = [tokenIn, tokenOut];
      const amounts = await router.getAmountsOut(amountIn, path);

      if (amounts.length < 2) {
        return null;
      }

      const amountOut = amounts[1].toString();
      const gasEstimate = '150000';
      const priceImpact = 0.1; // 임시 값

      return {
        dex: `${this.name} (${this.chainId})`,
        chainId: this.chainId,
        amountOut,
        priceImpact,
        gasEstimate,
        route: [tokenIn, tokenOut],
      };
    } catch (error) {
      console.error(`SushiSwap quote error on chain ${this.chainId}:`, error);
      return null;
    }
  }

  async getTokenInfo(tokenAddress: string): Promise<TokenInfo | null> {
    try {
      const erc20Abi = [
        'function symbol() public view returns (string)',
        'function name() public view returns (string)',
        'function decimals() public view returns (uint8)',
      ];

      const token = new ethers.Contract(tokenAddress, erc20Abi, this.provider);

      const [symbol, name, decimals] = await Promise.all([
        token.symbol(),
        token.name(),
        token.decimals(),
      ]);

      return {
        address: tokenAddress,
        symbol,
        name,
        decimals: Number(decimals),
        chainId: this.chainId,
      };
    } catch (error) {
      console.error(
        `SushiSwap token info error on chain ${this.chainId}:`,
        error,
      );
      return null;
    }
  }
}
