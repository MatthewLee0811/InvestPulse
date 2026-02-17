// components/market-status/MarketStatusBar.tsx - 시장 상태 + Fear & Greed 컨테이너
// v1.1.0 | 2026-02-17

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
    <section className="px-4 pt-4 pb-2">
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 md:p-5">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          {/* 좌측: 시장 상태 2x2 그리드 */}
          <div className="grid w-full flex-1 grid-cols-2 gap-2">
            {statuses.map((market) => (
              <MarketStatusItem key={market.id} market={market} />
            ))}
          </div>

          {/* 우측: Fear & Greed 게이지 */}
          <div className="w-full shrink-0 md:w-auto">
            <div className="flex justify-center">
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
      </div>
    </section>
  );
}

function FearGreedSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-[70px] w-[140px] rounded-t-full" />
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
