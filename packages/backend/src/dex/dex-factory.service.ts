import { Injectable } from '@nestjs/common';
import { ChainId } from '../chain/chain.config';
import { ChainService } from '../chain/chain.service';
import { UniswapV2Service } from './providers/uniswapV2.service';
import { SushiswapService } from './providers/sushiswap.service';
import { AerodromeService } from './providers/aerodrome.service';
import { BaseDexService } from './providers/base-dex.service';

@Injectable()
export class DexFactoryService {
  private dexInstances: Map<string, BaseDexService> = new Map();

  constructor(private readonly chainService: ChainService) {}

  /**
   * 체인과 DEX 이름으로 DEX 서비스 인스턴스를 생성하거나 가져옵니다
   */
  getDexService(chainId: ChainId, dexName: string): BaseDexService | null {
    const key = `${chainId}-${dexName}`;

    // 이미 생성된 인스턴스가 있으면 반환
    if (this.dexInstances.has(key)) {
      return this.dexInstances.get(key)!;
    }

    // 체인에서 해당 DEX가 지원되는지 확인
    const supportedDexes = this.chainService.getSupportedDexes(chainId);
    if (!supportedDexes.includes(dexName)) {
      return null;
    }

    // DEX 서비스 인스턴스 생성
    let dexService: BaseDexService;

    try {
      switch (dexName.toLowerCase()) {
        case 'uniswapV2':
          dexService = new UniswapV2Service(chainId, this.chainService);
          break;
        case 'sushiswap':
          dexService = new SushiswapService(chainId, this.chainService);
          break;
        case 'aerodrome':
          dexService = new AerodromeService(chainId, this.chainService);
          break;
        default:
          return null;
      }

      this.dexInstances.set(key, dexService);
      return dexService;
    } catch (error) {
      console.error(
        `Failed to create ${dexName} service for chain ${chainId}:`,
        error,
      );
      return null;
    }
  }

  /**
   * 체인의 모든 지원되는 DEX 서비스를 가져옵니다
   */
  getAllDexServices(chainId: ChainId): BaseDexService[] {
    const supportedDexes = this.chainService.getSupportedDexes(chainId);
    const services: BaseDexService[] = [];

    for (const dexName of supportedDexes) {
      const service = this.getDexService(chainId, dexName);
      if (service) {
        services.push(service);
      }
    }

    return services;
  }
}
