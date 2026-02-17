// components/market-status/MarketStatusBar.tsx - 시장 상태 + Fear & Greed 컨테이너
// v1.0.0 | 2026-02-17

'use client';

import { useMarketStatus } from '@/hooks/useMarketStatus';
import { useFearGreed } from '@/hooks/useFearGreed';
import { MarketStatusItem } from './MarketStatusItem';
import { FearGreedGauge } from './FearGreedGauge';
import { Skeleton } from '@/components/ui/Skeleton';

export function MarketStatusBar() {
  const statuses = useMarketStatus();
  const { data: fearGreed, isLoading: fngLoading } = useFearGreed();

  return (
    <section className="px-4 py-4">
      <div className="rounded-xl border border-gray-800 bg-[#111827] p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* 좌측: 시장 상태 2x2 그리드 */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {statuses.map((market) => (
              <MarketStatusItem key={market.id} market={market} />
            ))}
          </div>

          {/* 우측: Fear & Greed 게이지 */}
          <div className="flex justify-center lg:justify-end">
            {fngLoading ? (
              <FearGreedSkeleton />
            ) : fearGreed ? (
              <FearGreedGauge data={fearGreed} />
            ) : (
              <FearGreedSkeleton />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FearGreedSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-[90px] w-[200px] rounded-t-full" />
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}
