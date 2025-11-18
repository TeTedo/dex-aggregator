"use client";

import { useState, useEffect } from "react";
import { Token } from "@/lib/api";
import { getPopularTokens } from "@/lib/api";

interface TokenSelectorProps {
  chainId: number;
  selectedToken: Token | null;
  onSelect: (token: Token) => void;
  disabled?: boolean;
  label: string;
}

export default function TokenSelector({
  chainId,
  selectedToken,
  onSelect,
  disabled = false,
  label,
}: TokenSelectorProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (chainId && isOpen) {
      getPopularTokens(chainId).then(setTokens).catch(console.error);
    }
  }, [chainId, isOpen]);

  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-left hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800"
      >
        <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
        <div className="mt-1 text-lg font-semibold">
          {selectedToken ? selectedToken.symbol : "Select token"}
        </div>
        {selectedToken && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {selectedToken.name}
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 right-0 z-50 mt-2 max-h-96 overflow-hidden rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
            <div className="sticky top-0 border-b border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
              <input
                type="text"
                placeholder="Search token..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                autoFocus
              />
            </div>
            <div className="max-h-80 overflow-y-auto">
              {filteredTokens.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No tokens found
                </div>
              ) : (
                filteredTokens.map((token) => (
                  <button
                    key={token.address}
                    type="button"
                    onClick={() => {
                      onSelect(token);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="font-semibold">{token.symbol}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {token.name}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
