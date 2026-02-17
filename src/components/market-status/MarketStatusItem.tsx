// components/market-status/MarketStatusItem.tsx - 개별 시장 상태
// v1.0.0 | 2026-02-17

import { getStatusDotColor, getStatusTextColor } from '@/lib/market-hours';
import type { MarketStatus } from '@/lib/types';

interface MarketStatusItemProps {
  market: MarketStatus;
}

export function MarketStatusItem({ market }: MarketStatusItemProps) {
  const dotColor = getStatusDotColor(market.status);
  const textColor = getStatusTextColor(market.status);

  return (
    <div className="flex items-center gap-2 rounded-lg bg-gray-800/40 px-3 py-2">
      <span className="text-sm">{market.flag}</span>
      <span className="text-xs font-medium text-gray-300">{market.name}</span>
      <span className={`inline-block h-2 w-2 rounded-full ${dotColor}`} />
      <span className={`text-xs font-medium ${textColor}`}>
        {market.statusLabel}
      </span>
      {market.timeLabel && (
        <span className="text-xs text-gray-500">{market.timeLabel}</span>
      )}
    </div>
  );
}
