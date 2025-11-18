import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { BaseDexService } from './base-dex.service';
import { SwapQuote, TokenInfo } from '../dex.service';
import { ChainId } from '../../chain/chain.config';
import { ChainService } from '../../chain/chain.service';

@Injectable()
export class AerodromeService extends BaseDexService {
  name = 'Aerodrome';
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

    const dexConfig = chainService.getDexConfig(chainId, 'aerodrome');
    if (!dexConfig) {
      throw new Error(`Aerodrome not configured for chain ${chainId}`);
    }
    this.routerAddress = dexConfig.router;
  }

  async getQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
  ): Promise<SwapQuote | null> {
    try {
      // Aerodrome은 Velodrome 포크이므로 유사한 인터페이스 사용
      const routerAbi = [
        'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
        'function getAmountOut(uint amountIn, address tokenIn, address tokenOut) external view returns (uint amount, bool stable)',
      ];

      const router = new ethers.Contract(
        this.routerAddress,
        routerAbi,
        this.provider,
      );

      // Aerodrome은 stable/volatile 풀을 지원하므로 두 가지 경로를 확인
      const path = [tokenIn, tokenOut];

      let amounts: bigint[];
      try {
        const result = await router.getAmountsOut(amountIn, path);
        amounts = result.map((val: bigint) => BigInt(val.toString()));
      } catch {
        // getAmountsOut가 실패하면 getAmountOut 시도
        try {
          const [amount] = await router.getAmountOut(
            amountIn,
            tokenIn,
            tokenOut,
          );
          amounts = [BigInt(amountIn), BigInt(amount.toString())];
        } catch {
          return null;
        }
      }

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
      console.error(`Aerodrome quote error on chain ${this.chainId}:`, error);
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
        `Aerodrome token info error on chain ${this.chainId}:`,
        error,
      );
      return null;
    }
  }
}
