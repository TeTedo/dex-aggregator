"use client";

import { SwapQuote } from "@/lib/api";
import { formatTokenAmount } from "@/lib/utils";
import { Token } from "@/lib/api";

interface QuoteCardProps {
  quote: SwapQuote;
  tokenOut: Token | null;
  isSelected: boolean;
  onSelect: () => void;
}

export default function QuoteCard({
  quote,
  tokenOut,
  isSelected,
  onSelect,
}: QuoteCardProps) {
  const amountOutFormatted = tokenOut
    ? formatTokenAmount(quote.amountOut, tokenOut.decimals)
    : quote.amountOut;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{quote.dex}</h3>
            {isSelected && (
              <span className="rounded bg-blue-500 px-2 py-0.5 text-xs text-white">
                Selected
              </span>
            )}
          </div>
          <div className="mt-2 text-2xl font-bold">
            {amountOutFormatted} {tokenOut?.symbol || ""}
          </div>
        </div>
        <div className="ml-4">
          <svg
            className="h-6 w-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </button>
  );
}
