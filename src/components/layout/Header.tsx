// components/layout/Header.tsx - 헤더 컴포넌트
// v1.0.0 | 2026-02-17

'use client';

import { RefreshCw, TrendingUp } from 'lucide-react';

interface HeaderProps {
  lastUpdated?: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function Header({ lastUpdated, onRefresh, isRefreshing }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-[#0a0f1c]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-400" />
          <h1 className="text-xl font-bold text-white">
            Invest<span className="text-blue-400">Pulse</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="hidden text-xs text-gray-500 sm:block">
              마지막 업데이트: {lastUpdated}
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:border-gray-600 hover:text-white disabled:opacity-50"
            title="새로고침"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">새로고침</span>
          </button>
        </div>
      </div>
    </header>
  );
}
