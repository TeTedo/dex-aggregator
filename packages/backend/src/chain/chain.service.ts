import { Injectable } from '@nestjs/common';
import { ChainId, ChainConfig, CHAIN_CONFIGS, DexName } from './chain.config';
import { ethers } from 'ethers';

@Injectable()
export class ChainService {
  private providers: Map<ChainId, ethers.JsonRpcProvider> = new Map();

  /**
   * 체인 설정을 가져옵니다
   */
  getChainConfig(chainId: ChainId): ChainConfig | null {
    return CHAIN_CONFIGS[chainId] || null;
  }

  /**
   * 모든 지원되는 체인 목록을 반환합니다
   */
  getSupportedChains(): ChainConfig[] {
    return Object.values(CHAIN_CONFIGS);
  }

  /**
   * 체인 ID로 체인 이름을 가져옵니다
   */
  getChainName(chainId: ChainId): string {
    const config = this.getChainConfig(chainId);
    return config?.name || `Chain ${chainId}`;
  }

  /**
   * 체인별 Provider를 가져옵니다 (캐싱됨)
   */
  getProvider(chainId: ChainId): ethers.JsonRpcProvider | null {
    if (this.providers.has(chainId)) {
      return this.providers.get(chainId)!;
    }

    const config = this.getChainConfig(chainId);
    if (!config) {
      return null;
    }

    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.providers.set(chainId, provider);
    return provider;
  }

  /**
   * 체인의 DEX 설정을 가져옵니다
   */
  getDexConfig(chainId: ChainId, dexName: DexName) {
    const config = this.getChainConfig(chainId);
    if (!config) {
      return null;
    }
    if (!config.dexes[dexName]) {
      return null;
    }
    return config.dexes[dexName];
  }

  /**
   * 체인에서 지원하는 DEX 목록을 반환합니다
   */
  getSupportedDexes(chainId: ChainId): DexName[] {
    const config = this.getChainConfig(chainId);
    return config ? (Object.keys(config.dexes) as DexName[]) : [];
  }
}
