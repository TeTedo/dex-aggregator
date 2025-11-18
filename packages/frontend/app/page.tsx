"use client";

import { useState, useEffect } from "react";
import { Token, SwapQuote, ChainConfig } from "@/lib/api";
import { getSupportedChains, getPopularTokens, getQuote } from "@/lib/api";
import { formatTokenAmount, parseTokenAmount } from "@/lib/utils";
import TokenSelector from "@/components/TokenSelector";
import QuoteCard from "@/components/QuoteCard";

export default function Home() {
  const [chains, setChains] = useState<ChainConfig[]>([]);
  const [selectedChainId, setSelectedChainId] = useState<number>(8453); // Base
  const [tokenIn, setTokenIn] = useState<Token | null>(null);
  const [tokenOut, setTokenOut] = useState<Token | null>(null);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [inputMode, setInputMode] = useState<"in" | "out">("in");
  const [quotes, setQuotes] = useState<SwapQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<SwapQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSupportedChains().then(setChains).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedChainId) {
      getPopularTokens(selectedChainId).then((tokens) => {
        if (tokens.length > 0) {
          setTokenIn(tokens[0]);
          if (tokens.length > 1) {
            setTokenOut(tokens[1]);
          }
        }
      });
    }
  }, [selectedChainId]);

  const fetchQuotes = async () => {
    if (!tokenIn || !tokenOut || !selectedChainId) return;

    const inputAmount = inputMode === "in" ? amountIn : amountOut;
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setQuotes([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (inputMode === "in") {
        // amountIn 입력 시: 정방향 조회
        const amountInWei = parseTokenAmount(amountIn, tokenIn.decimals);
        const result = await getQuote(
          selectedChainId,
          tokenIn.address,
          tokenOut.address,
          amountInWei
        );

        setQuotes(result.all);
        setSelectedQuote(result.best);

        // amountOut 업데이트
        if (result.best) {
          const formatted = formatTokenAmount(
            result.best.amountOut,
            tokenOut.decimals
          );
          setAmountOut(formatted);
        }
      } else {
        // amountOut 입력 시: 역방향 조회 (tokenOut -> tokenIn)
        const amountOutWei = parseTokenAmount(amountOut, tokenOut.decimals);
        const result = await getQuote(
          selectedChainId,
          tokenOut.address,
          tokenIn.address,
          amountOutWei
        );

        // 결과를 역방향으로 변환 (amountOut이 실제로는 amountIn이 됨)
        const processedQuotes = result.all.map((quote) => ({
          ...quote,
          amountOut: quote.amountOut, // 이건 실제로는 필요한 amountIn
        }));

        setQuotes(processedQuotes);
        setSelectedQuote(result.best);

        // amountIn 업데이트
        if (result.best) {
          const formatted = formatTokenAmount(
            result.best.amountOut,
            tokenIn.decimals
          );
          setAmountIn(formatted);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch quotes");
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchQuotes();
    }, 500); // 디바운스

    return () => clearTimeout(timeoutId);
  }, [amountIn, amountOut, tokenIn, tokenOut, selectedChainId, inputMode]);

  const handleSwapTokens = () => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
    const tempAmount = amountIn;
    setAmountIn(amountOut);
    setAmountOut(tempAmount);
  };

  const handleSwap = () => {
    if (!selectedQuote) {
      alert("Please select a DEX quote");
      return;
    }
    // 실제 스왑 로직은 지갑 연결 후 구현
    alert(`Swapping via ${selectedQuote.dex}...`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-8 text-center text-4xl font-bold text-gray-900 dark:text-white">
            DEX Aggregator
          </h1>

          {/* Chain Selector */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Chain
            </label>
            <select
              value={selectedChainId}
              onChange={(e) => setSelectedChainId(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {chains.map((chain) => (
                <option key={chain.chainId} value={chain.chainId}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="space-y-4">
              {/* Token In */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    From
                  </label>
                  {inputMode === "in" && (
                    <span className="text-xs text-gray-500">Enter amount</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <TokenSelector
                    chainId={selectedChainId}
                    selectedToken={tokenIn}
                    onSelect={setTokenIn}
                    label="Token In"
                  />
                  <input
                    type="number"
                    placeholder="0.0"
                    value={amountIn}
                    onChange={(e) => {
                      setAmountIn(e.target.value);
                      setInputMode("in");
                    }}
                    onFocus={() => setInputMode("in")}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-right text-lg focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleSwapTokens}
                  className="rounded-full bg-gray-200 p-2 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                </button>
              </div>

              {/* Token Out */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    To
                  </label>
                  {inputMode === "out" && (
                    <span className="text-xs text-gray-500">Enter amount</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <TokenSelector
                    chainId={selectedChainId}
                    selectedToken={tokenOut}
                    onSelect={setTokenOut}
                    label="Token Out"
                  />
                  <input
                    type="number"
                    placeholder="0.0"
                    value={amountOut}
                    onChange={(e) => {
                      setAmountOut(e.target.value);
                      setInputMode("out");
                    }}
                    onFocus={() => setInputMode("out")}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-right text-lg focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quotes List */}
          {loading && (
            <div className="mt-4 text-center text-gray-500">
              Loading quotes...
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {!loading && !error && quotes.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Available Quotes ({quotes.length})
              </h2>
              <div className="space-y-3">
                {quotes.map((quote, index) => (
                  <QuoteCard
                    key={`${quote.dex}-${index}`}
                    quote={quote}
                    tokenOut={inputMode === "in" ? tokenOut : tokenIn}
                    isSelected={
                      selectedQuote?.dex === quote.dex &&
                      selectedQuote?.chainId === quote.chainId
                    }
                    onSelect={() => setSelectedQuote(quote)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Swap Button */}
          {selectedQuote && (
            <button
              type="button"
              onClick={handleSwap}
              className="mt-6 w-full rounded-lg bg-blue-600 px-6 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Swap via {selectedQuote.dex}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
