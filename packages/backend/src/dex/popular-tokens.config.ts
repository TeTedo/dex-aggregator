import { ChainId } from '../chain/chain.config';

export interface PopularToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  isNative?: boolean; // 네이티브 토큰인지 (ETH, MATIC 등)
}

export const POPULAR_TOKENS: Record<ChainId, PopularToken[]> = {
  [ChainId.BASE]: [
    {
      address: '0x4200000000000000000000000000000000000006', // WETH
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      isNative: true,
    },
    {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
    {
      address: '0x50c5725949A6F0c72E6C4a641F24049A917E0C6F', // DAI
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
    },
    {
      address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631', // AERO
      symbol: 'AERO',
      name: 'Aerodrome Finance',
      decimals: 18,
    },
    {
      address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', // cbETH
      symbol: 'cbETH',
      name: 'Coinbase Wrapped Staked ETH',
      decimals: 18,
    },
    {
      address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', // USDbC
      symbol: 'USDbC',
      name: 'USD Base Coin',
      decimals: 6,
    },
  ],
  [ChainId.ETHEREUM]: [
    {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      isNative: true,
    },
    {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
    {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
    },
    {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
    },
    {
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
      symbol: 'WBTC',
      name: 'Wrapped BTC',
      decimals: 8,
    },
    {
      address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', // MATIC
      symbol: 'MATIC',
      name: 'Polygon',
      decimals: 18,
    },
  ],
  [ChainId.ARBITRUM]: [
    {
      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      isNative: true,
    },
    {
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
    {
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // DAI
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
    },
    {
      address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
    },
    {
      address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', // WBTC
      symbol: 'WBTC',
      name: 'Wrapped BTC',
      decimals: 8,
    },
  ],
  [ChainId.OPTIMISM]: [
    {
      address: '0x4200000000000000000000000000000000000006', // WETH
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      isNative: true,
    },
    {
      address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', // USDC
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
    {
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // DAI
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
    },
    {
      address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', // USDT
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
    },
  ],
  [ChainId.POLYGON]: [
    {
      address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // WMATIC
      symbol: 'WMATIC',
      name: 'Wrapped MATIC',
      decimals: 18,
      isNative: true,
    },
    {
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
    {
      address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', // DAI
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
    },
    {
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
    },
    {
      address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', // WBTC
      symbol: 'WBTC',
      name: 'Wrapped BTC',
      decimals: 8,
    },
  ],
  [ChainId.BSC]: [
    {
      address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
      symbol: 'WBNB',
      name: 'Wrapped BNB',
      decimals: 18,
      isNative: true,
    },
    {
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 18,
    },
    {
      address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', // BUSD
      symbol: 'BUSD',
      name: 'Binance USD',
      decimals: 18,
    },
    {
      address: '0x55d398326f99059fF775485246999027B3197955', // USDT
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 18,
    },
    {
      address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', // ETH
      symbol: 'ETH',
      name: 'Ethereum Token',
      decimals: 18,
    },
  ],
};
