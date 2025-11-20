export enum ChainId {
  ETHEREUM = 1,
  BASE = 8453,
  ARBITRUM = 42161,
  OPTIMISM = 10,
  POLYGON = 137,
  BSC = 56,
}

export enum DexName {
  UNISWAP_V2 = 'uniswapV2',
  SUSHISWAP = 'sushiswap',
  PANCAKESWAP_V2 = 'pancakeswapV2',
  AERODROME = 'aerodrome',
}

export interface ChainConfig {
  chainId: ChainId;
  name: string;
  rpcUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorer?: string;
  dexes: {
    [dexName in DexName]?: {
      router: string;
      factory?: string;
      pool?: string;
      poolFactory?: string;
      fee?: string; // 0.3% = 0.003, 1% = 0.01
    };
  };
}

export const CHAIN_CONFIGS: Record<ChainId, ChainConfig> = {
  [ChainId.ETHEREUM]: {
    chainId: ChainId.ETHEREUM,
    name: 'Ethereum',
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorer: 'https://etherscan.io',
    dexes: {
      [DexName.UNISWAP_V2]: {
        router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        pool: '0x0000000000000000000000000000000000000000',
        poolFactory: '0x0000000000000000000000000000000000000000',
        fee: '0.003',
      },
      [DexName.SUSHISWAP]: {
        router: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
        factory: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
        fee: '0.003',
      },
      [DexName.PANCAKESWAP_V2]: {
        router: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
        factory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
        pool: '0x0000000000000000000000000000000000000000',
        poolFactory: '0x0000000000000000000000000000000000000000',
        fee: '0.003',
      },
    },
  },
  [ChainId.BASE]: {
    chainId: ChainId.BASE,
    name: 'Base',
    rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorer: 'https://basescan.org',
    dexes: {
      [DexName.UNISWAP_V2]: {
        router: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
        factory: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
        pool: '0x0000000000000000000000000000000000000000',
        poolFactory: '0x0000000000000000000000000000000000000000',
        fee: '0.003',
      },
      [DexName.SUSHISWAP]: {
        router: '0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891',
        factory: '0x71524B4f93c58fcbF659783284E38825f0622859',
        fee: '0.003',
      },
      [DexName.AERODROME]: {
        router: '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43',
        fee: '0.003',
      },
    },
  },
  [ChainId.ARBITRUM]: {
    chainId: ChainId.ARBITRUM,
    name: 'Arbitrum',
    rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorer: 'https://arbiscan.io',
    dexes: {
      [DexName.UNISWAP_V2]: {
        router: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
        factory: '0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9',
        pool: '0x0000000000000000000000000000000000000000',
        poolFactory: '0x0000000000000000000000000000000000000000',
        fee: '0.003',
      },
      [DexName.SUSHISWAP]: {
        router: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
        factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
        fee: '0.003',
      },
    },
  },
  [ChainId.OPTIMISM]: {
    chainId: ChainId.OPTIMISM,
    name: 'Optimism',
    rpcUrl: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorer: 'https://optimistic.etherscan.io',
    dexes: {
      [DexName.UNISWAP_V2]: {
        router: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
        factory: '0x0c3c1c532F1e39EdF36BE9Fe0bE1410313E074Bf',
        pool: '0x0000000000000000000000000000000000000000',
        poolFactory: '0x0000000000000000000000000000000000000000',
        fee: '0.003',
      },
      [DexName.SUSHISWAP]: {
        router: '0x4C5D5234f232BD2D76B96aA33F5AE4FCF0E4BFAb',
        factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
        fee: '0.003',
      },
    },
  },
  [ChainId.POLYGON]: {
    chainId: ChainId.POLYGON,
    name: 'Polygon',
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    blockExplorer: 'https://polygonscan.com',
    dexes: {
      [DexName.UNISWAP_V2]: {
        router: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
        factory: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
        pool: '0x0000000000000000000000000000000000000000',
        poolFactory: '0x0000000000000000000000000000000000000000',
        fee: '0.003',
      },
      [DexName.SUSHISWAP]: {
        router: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
        factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
        fee: '0.003',
      },
    },
  },
  [ChainId.BSC]: {
    chainId: ChainId.BSC,
    name: 'BNB Smart Chain',
    rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    blockExplorer: 'https://bscscan.com',
    dexes: {
      [DexName.PANCAKESWAP_V2]: {
        router: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
        factory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
        pool: '0x0000000000000000000000000000000000000000',
        poolFactory: '0x0000000000000000000000000000000000000000',
        fee: '0.003',
      },
    },
  },
};
