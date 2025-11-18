import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { BaseDexService } from './base-dex.service';
import { SwapQuote, TokenInfo } from '../dex.service';
import { ChainId } from '../../chain/chain.config';
import { ChainService } from '../../chain/chain.service';

@Injectable()
export class UniswapV2Service extends BaseDexService {
  name = 'Uniswap';
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

    const dexConfig = chainService.getDexConfig(chainId, 'uniswapV2');
    if (!dexConfig) {
      throw new Error(`Uniswap not configured for chain ${chainId}`);
    }
    this.routerAddress = dexConfig.router;
  }

  async getQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
  ): Promise<SwapQuote | null> {
    try {
      // Uniswap V2 Router ABI (getAmountsOut 함수)
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

      // 간단한 가스 추정 (실제로는 더 정확한 계산 필요)
      const gasEstimate = '150000';

      // 가격 영향도 계산 (실제로는 풀 정보를 가져와서 계산)
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
      console.error(`Uniswap quote error on chain ${this.chainId}:`, error);
      return null;
    }
  }

  async getTokenInfo(tokenAddress: string): Promise<TokenInfo | null> {
    try {
      // ERC20 표준 ABI
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
        `Uniswap token info error on chain ${this.chainId}:`,
        error,
      );
      return null;
    }
  }
}
