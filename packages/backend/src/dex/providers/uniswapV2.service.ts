import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { BaseDexService } from './base-dex.service';
import { SwapQuote, TokenInfo } from '../dex.service';
import { ChainId, DexName } from '../../chain/chain.config';
import { ChainService } from '../../chain/chain.service';

@Injectable()
export class UniswapV2Service extends BaseDexService {
  name = DexName.UNISWAP_V2;
  chainId: ChainId;
  private provider: ethers.JsonRpcProvider;
  private routerAddress: string;

  constructor(
    chainId: ChainId,
    private readonly chainService: ChainService,
  ) {
    super();
    this.chainId = chainId;

    const provider = this.chainService.getProvider(chainId);
    if (!provider) {
      throw new Error(`Provider not found for chain ${chainId}`);
    }
    this.provider = provider;

    const dexConfig = this.chainService.getDexConfig(chainId, this.name);
    if (!dexConfig) {
      throw new Error(`${this.name} not configured for chain ${chainId}`);
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
      const amounts = (await router.getAmountsOut(amountIn, path)) as bigint[];

      if (amounts.length < 2) {
        return null;
      }

      const amountOut = amounts[1].toString();

      return {
        dex: this.name,
        chainId: this.chainId,
        amountOut,
        route: [tokenIn, tokenOut],
      };
    } catch (error) {
      console.error(
        `${this.name} quote error on chain ${this.chainId}:`,
        error,
      );
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

      const [symbol, name, decimals] = (await Promise.all([
        token.symbol(),
        token.name(),
        token.decimals(),
      ])) as [string, string, string];

      return {
        address: tokenAddress,
        symbol,
        name,
        decimals: Number(decimals),
        chainId: this.chainId,
      };
    } catch (error) {
      console.error(
        `${this.name} token info error on chain ${this.chainId}:`,
        error,
      );
      return null;
    }
  }

  async getLiquidityQuote(
    tokenA: string,
    tokenB: string,
    amountA: string,
    amountB: string,
  ): Promise<{ lpTokens: string; share: number } | null> {
    try {
      const dexConfig = this.chainService.getDexConfig(this.chainId, this.name);
      if (!dexConfig?.factory) {
        return null;
      }

      // Factory ABI
      const factoryAbi = [
        'function getPair(address tokenA, address tokenB) external view returns (address pair)',
      ];

      // Pair ABI
      const pairAbi = [
        'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
        'function totalSupply() external view returns (uint)',
        'function token0() external view returns (address)',
      ];

      const factory = new ethers.Contract(
        dexConfig.factory,
        factoryAbi,
        this.provider,
      );

      // 풀 주소 가져오기
      const pairAddress = (await factory.getPair(tokenA, tokenB)) as string;
      if (!pairAddress || pairAddress === ethers.ZeroAddress) {
        // 새 풀인 경우: sqrt(amountA * amountB) - 1000 (초기 유동성 제거)
        const amountABigInt = BigInt(amountA);
        const amountBBigInt = BigInt(amountB);
        const product = amountABigInt * amountBBigInt;
        const lpTokens = this.sqrt(product) - BigInt(1000); // 초기 유동성 제거
        return {
          lpTokens: lpTokens.toString(),
          share: 100, // 새 풀이므로 100%
        };
      }

      // 기존 풀인 경우
      const pair = new ethers.Contract(pairAddress, pairAbi, this.provider);

      const [reserves, totalSupply] = (await Promise.all([
        pair.getReserves(),
        pair.totalSupply(),
      ])) as [bigint[], bigint];
      const [reserve0, reserve1] = reserves as [bigint, bigint];

      const token0Address = (await pair.token0()) as string;
      const isTokenAFirst =
        token0Address.toLowerCase() === tokenA.toLowerCase();

      const reserveA = isTokenAFirst ? reserve0 : reserve1;
      const reserveB = isTokenAFirst ? reserve1 : reserve0;

      const amountABigInt = BigInt(amountA);
      const amountBBigInt = BigInt(amountB);
      const reserveABigInt = BigInt(reserveA.toString());
      const reserveBBigInt = BigInt(reserveB.toString());
      const totalSupplyBigInt = BigInt(totalSupply.toString());

      // LP 토큰 계산: min((amountA * totalSupply) / reserveA, (amountB * totalSupply) / reserveB)
      const lpFromA = (amountABigInt * totalSupplyBigInt) / reserveABigInt;
      const lpFromB = (amountBBigInt * totalSupplyBigInt) / reserveBBigInt;
      const lpTokens = lpFromA < lpFromB ? lpFromA : lpFromB;

      // 풀 점유율 계산
      const newTotalSupply = totalSupplyBigInt + lpTokens;
      const share = Number((lpTokens * BigInt(10000)) / newTotalSupply) / 100;

      return {
        lpTokens: lpTokens.toString(),
        share,
      };
    } catch (error) {
      console.error(
        `${this.name} liquidity quote error on chain ${this.chainId}:`,
        error,
      );
      return null;
    }
  }

  private sqrt(value: bigint): bigint {
    if (value < BigInt(0)) {
      throw new Error('Square root of negative number');
    }
    if (value < BigInt(2)) {
      return value;
    }

    let x = value;
    let y = (x + BigInt(1)) / BigInt(2);
    while (y < x) {
      x = y;
      y = (x + value / x) / BigInt(2);
    }
    return x;
  }
}
