// components/market-status/MarketStatusItem.tsx - 개별 시장 상태 미니 카드
// v1.1.0 | 2026-02-17

import { getStatusDotColor, getStatusTextColor } from '@/lib/market-hours';
import type { MarketStatus } from '@/lib/types';

interface MarketStatusItemProps {
  market: MarketStatus;
}

/** 시장명 매핑 (더 구체적인 라벨) */
const MARKET_LABELS: Record<string, string> = {
  us: '미국 증시',
  kr: '한국 증시',
  crypto: '크립토',
  eu: '유럽 증시',
};

export function MarketStatusItem({ market }: MarketStatusItemProps) {
  const dotColor = getStatusDotColor(market.status);
  const textColor = getStatusTextColor(market.status);
  const isOpen = market.status === 'open';

  return (
    <div className="rounded-lg bg-white/5 p-3">
      {/* 1행: 국기 + 시장명 */}
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="text-sm leading-none">{market.flag}</span>
        <span className="text-sm font-medium text-gray-200">
          {MARKET_LABELS[market.id] ?? market.name}
        </span>
      </div>

      {/* 2행: 상태 dot + 상태 텍스트 */}
      <div className="mb-1 flex items-center gap-1.5">
        <span
          className={`inline-block h-2 w-2 rounded-full ${dotColor} ${isOpen ? 'animate-pulse' : ''}`}
        />
        <span className={`text-xs font-medium ${textColor}`}>
          {market.statusLabel}
        </span>
      </div>

      {/* 3행: 카운트다운 */}
      {market.timeLabel ? (
        <p className="text-xs tabular-nums text-gray-500">{market.timeLabel}</p>
      ) : (
        <p className="text-xs text-gray-500">상시 운영</p>
      )}
    </div>
  );
}
