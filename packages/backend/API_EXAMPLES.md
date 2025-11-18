# DEX Aggregator API 예시

## 기본 URL

```
http://localhost:3000/dex
```

---

## 1. 지원되는 체인 목록 조회

### 요청

```bash
GET /dex/chains
```

### cURL 예시

```bash
curl http://localhost:3000/dex/chains
```

### 응답 예시

```json
[
  {
    "chainId": 1,
    "name": "Ethereum",
    "rpcUrl": "https://eth.llamarpc.com",
    "nativeCurrency": {
      "name": "Ether",
      "symbol": "ETH",
      "decimals": 18
    },
    "blockExplorer": "https://etherscan.io",
    "dexes": {
      "uniswapV2": { ... },
      "sushiswap": { ... }
    }
  },
  {
    "chainId": 8453,
    "name": "Base",
    ...
  }
]
```

---

## 2. 특정 체인에서 지원되는 DEX 목록 조회

### 요청

```bash
GET /dex/chains/:chainId/dexes
```

### cURL 예시 (Base Chain)

```bash
curl http://localhost:3000/dex/chains/8453/dexes
```

### 응답 예시

```json
{
  "chainId": 8453,
  "chainName": "Base",
  "dexes": [
    {
      "name": "uniswapV2",
      "config": {
        "router": "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24",
        "factory": "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6"
      }
    },
    {
      "name": "sushiswap",
      "config": { ... }
    },
    {
      "name": "aerodrome",
      "config": { ... }
    }
  ]
}
```

---

## 3. 특정 체인에서 스왑 견적 조회

### 요청

```bash
GET /dex/quote?chainId={chainId}&tokenIn={tokenIn}&tokenOut={tokenOut}&amountIn={amountIn}
```

### 파라미터

- `chainId`: 체인 ID (예: 8453 = Base, 1 = Ethereum)
- `tokenIn`: 입력 토큰 주소
- `tokenOut`: 출력 토큰 주소
- `amountIn`: 입력 토큰 수량 (wei 단위, 18 decimals 기준)

### cURL 예시 (Base Chain: USDC → WETH, 100 USDC)

```bash
curl "http://localhost:3000/dex/quote?chainId=8453&tokenIn=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&tokenOut=0x4200000000000000000000000000000000000006&amountIn=100000000"
```

**참고**: USDC는 6 decimals이므로 100 USDC = 100000000

### cURL 예시 (Base Chain: WETH → USDC, 0.1 ETH)

```bash
curl "http://localhost:3000/dex/quote?chainId=8453&tokenIn=0x4200000000000000000000000000000000000006&tokenOut=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&amountIn=100000000000000000"
```

**참고**: WETH는 18 decimals이므로 0.1 ETH = 100000000000000000

### cURL 예시 (Ethereum: USDC → DAI, 1000 USDC)

```bash
curl "http://localhost:3000/dex/quote?chainId=1&tokenIn=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&tokenOut=0x6B175474E89094C44Da98b954EedeAC495271d0F&amountIn=1000000000"
```

**참고**: USDC는 6 decimals이므로 1000 USDC = 1000000000

### 응답 예시

```json
{
  "best": {
    "dex": "Aerodrome (8453)",
    "chainId": 8453,
    "amountOut": "123456789000000000",
    "priceImpact": 0.1,
    "gasEstimate": "150000",
    "route": [
      "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "0x4200000000000000000000000000000000000006"
    ]
  },
  "all": [
    {
      "dex": "Aerodrome (8453)",
      "chainId": 8453,
      "amountOut": "123456789000000000",
      "priceImpact": 0.1,
      "gasEstimate": "150000",
      "route": [...]
    },
    {
      "dex": "Uniswap (8453)",
      "chainId": 8453,
      "amountOut": "123000000000000000",
      ...
    },
    {
      "dex": "SushiSwap (8453)",
      "chainId": 8453,
      "amountOut": "122500000000000000",
      ...
    }
  ]
}
```

---

## 4. 여러 체인에서 스왑 견적 조회 (멀티체인)

### 요청

```bash
GET /dex/quote/multi-chain?chainIds={chainIds}&tokenIn={tokenIn}&tokenOut={tokenOut}&amountIn={amountIn}
```

### 파라미터

- `chainIds`: 콤마로 구분된 체인 ID들 (예: "1,8453,42161")
- `tokenIn`: 입력 토큰 주소
- `tokenOut`: 출력 토큰 주소
- `amountIn`: 입력 토큰 수량 (wei 단위)

### cURL 예시 (Base, Ethereum, Arbitrum에서 비교)

```bash
curl "http://localhost:3000/dex/quote/multi-chain?chainIds=8453,1,42161&tokenIn=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&tokenOut=0x4200000000000000000000000000000000000006&amountIn=100000000"
```

### 응답 예시

```json
{
  "best": {
    "dex": "Aerodrome (8453)",
    "chainId": 8453,
    "amountOut": "123456789000000000",
    ...
  },
  "all": [
    {
      "dex": "Aerodrome (8453)",
      "chainId": 8453,
      "amountOut": "123456789000000000",
      ...
    },
    {
      "dex": "Uniswap (1)",
      "chainId": 1,
      "amountOut": "120000000000000000",
      ...
    },
    {
      "dex": "SushiSwap (42161)",
      "chainId": 42161,
      "amountOut": "118000000000000000",
      ...
    }
  ]
}
```

---

## 5. 인기 토큰 목록 조회

### 요청 (특정 체인)

```bash
GET /dex/chains/:chainId/popular-tokens
```

### cURL 예시 (Base Chain)

```bash
curl http://localhost:3000/dex/chains/8453/popular-tokens
```

### 응답 예시

```json
{
  "chainId": 8453,
  "chainName": "Base",
  "tokens": [
    {
      "address": "0x4200000000000000000000000000000000000006",
      "symbol": "WETH",
      "name": "Wrapped Ether",
      "decimals": 18,
      "isNative": true
    },
    {
      "address": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "symbol": "USDC",
      "name": "USD Coin",
      "decimals": 6
    },
    {
      "address": "0x50c5725949A6F0c72E6C4a641F24049A917E0C6F",
      "symbol": "DAI",
      "name": "Dai Stablecoin",
      "decimals": 18
    }
  ]
}
```

### 요청 (모든 체인)

```bash
GET /dex/popular-tokens
```

### cURL 예시

```bash
curl http://localhost:3000/dex/popular-tokens
```

### 응답 예시

```json
{
  "8453": [
    {
      "address": "0x4200000000000000000000000000000000000006",
      "symbol": "WETH",
      "name": "Wrapped Ether",
      "decimals": 18,
      "isNative": true
    },
    ...
  ],
  "1": [
    {
      "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "symbol": "WETH",
      "name": "Wrapped Ether",
      "decimals": 18,
      "isNative": true
    },
    ...
  ]
}
```

---

## 6. 토큰 정보 조회

### 요청

```bash
GET /dex/token/:chainId/:address
```

### cURL 예시 (Base Chain의 USDC)

```bash
curl http://localhost:3000/dex/token/8453/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

### cURL 예시 (Ethereum의 WETH)

```bash
curl http://localhost:3000/dex/token/1/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
```

### 응답 예시

```json
{
  "address": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "symbol": "USDC",
  "name": "USD Coin",
  "decimals": 6,
  "chainId": 8453
}
```

---

## 주요 토큰 주소 참고

### Base Chain (8453)

- **WETH**: `0x4200000000000000000000000000000000000006`
- **USDC**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (6 decimals)
- **DAI**: `0x50c5725949A6F0c72E6C4a641F24049A917E0C6F` (18 decimals)

### Ethereum (1)

- **WETH**: `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` (18 decimals)
- **USDC**: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` (6 decimals)
- **DAI**: `0x6B175474E89094C44Da98b954EedeAC495271d0F` (18 decimals)

### Arbitrum (42161)

- **WETH**: `0x82aF49447D8a07e3bd95BD0d56f35241523fBab1` (18 decimals)
- **USDC**: `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` (6 decimals)

### Optimism (10)

- **WETH**: `0x4200000000000000000000000000000000000006` (18 decimals)
- **USDC**: `0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85` (6 decimals)

### Polygon (137)

- **WMATIC**: `0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270` (18 decimals)
- **USDC**: `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174` (6 decimals)

### BSC (56)

- **WBNB**: `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c` (18 decimals)
- **USDC**: `0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d` (18 decimals)
- **BUSD**: `0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56` (18 decimals)

---

## Amount 계산 예시

### 18 decimals 토큰 (ETH, WETH, DAI 등)

- 1 토큰 = `1000000000000000000` (1e18)
- 0.1 토큰 = `100000000000000000` (1e17)
- 0.01 토큰 = `10000000000000000` (1e16)

### 6 decimals 토큰 (USDC 등)

- 1 USDC = `1000000` (1e6)
- 100 USDC = `100000000` (1e8)
- 1000 USDC = `1000000000` (1e9)

### JavaScript/TypeScript 변환 예시

```typescript
// 18 decimals 토큰
const amount = ethers.parseEther('1.0'); // "1000000000000000000"
const amount = ethers.parseEther('0.1'); // "100000000000000000"

// 6 decimals 토큰 (USDC)
const amount = ethers.parseUnits('100', 6); // "100000000"
const amount = ethers.parseUnits('1000', 6); // "1000000000"
```

---

## Postman Collection 예시

```json
{
  "info": {
    "name": "DEX Aggregator API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Supported Chains",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3000/dex/chains",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["dex", "chains"]
        }
      }
    },
    {
      "name": "Get Quote - Base USDC to WETH",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3000/dex/quote?chainId=8453&tokenIn=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&tokenOut=0x4200000000000000000000000000000000000006&amountIn=100000000",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["dex", "quote"],
          "query": [
            { "key": "chainId", "value": "8453" },
            {
              "key": "tokenIn",
              "value": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
            },
            {
              "key": "tokenOut",
              "value": "0x4200000000000000000000000000000000000006"
            },
            { "key": "amountIn", "value": "100000000" }
          ]
        }
      }
    }
  ]
}
```
