// components/markets/MarketOverview.tsx - 카테고리별 자산 카드 그리드
// v1.4.0 | 2026-02-17

'use client';

import { useMemo } from 'react';
import { BarChart3, Bitcoin, Gem, DollarSign, Landmark } from 'lucide-react';
import { AssetCard } from './AssetCard';
import { CryptoMetricsPanel, METRIC_SYMBOLS } from './CryptoMetricsPanel';
import { AssetCardSkeleton } from '@/components/ui/Skeleton';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMarketData } from '@/hooks/useMarketData';
import type { AssetData, AssetCategory } from '@/lib/types';

const SECTIONS: {
  category: AssetCategory;
  label: string;
  icon: React.ReactNode;
  skeletonCount: number;
}[] = [
  { category: 'stock_index', label: '주식 지수', icon: <BarChart3 className="h-4 w-4 text-blue-400" />, skeletonCount: 4 },
  { category: 'crypto', label: '암호화폐', icon: <Bitcoin className="h-4 w-4 text-amber-400" />, skeletonCount: 2 },
  { category: 'commodity', label: '원자재', icon: <Gem className="h-4 w-4 text-emerald-400" />, skeletonCount: 3 },
  { category: 'forex', label: '환율', icon: <DollarSign className="h-4 w-4 text-purple-400" />, skeletonCount: 4 },
  { category: 'bond', label: '채권', icon: <Landmark className="h-4 w-4 text-gray-400" />, skeletonCount: 2 },
];

export function MarketOverview() {
  const { data, isLoading, error } = useMarketData();

  const grouped = useMemo(() => {
    if (!data) return null;
    const map = new Map<AssetCategory, AssetData[]>();
    for (const asset of data) {
      const list = map.get(asset.category) ?? [];
      list.push(asset);
      map.set(asset.category, list);
    }
    return map;
  }, [data]);

  if (error && !data) {
    return (
      <section className="px-4 py-6">
        <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-6 text-center">
          <p className="text-sm text-red-400">
            시세 데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 px-4 py-6">
      {SECTIONS.map((section) => {
        const assets = grouped?.get(section.category);

        // 암호화폐: BTC, ETH, ETH/BTC 차트 카드 + 하단 메트릭 패널
        if (section.category === 'crypto') {
          const chartAssets = assets?.filter((a) => !METRIC_SYMBOLS.includes(a.symbol));
          const allAssets = assets ?? [];

          return (
            <div key={section.category}>
              <div className="mb-3 flex items-center gap-2">
                {section.icon}
                <h3 className="text-sm font-semibold text-gray-300">
                  {section.label}
                </h3>
              </div>

              {/* 상단: BTC, ETH, ETH/BTC 차트 카드 */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {isLoading ? (
                  <>
                    <AssetCardSkeleton />
                    <AssetCardSkeleton />
                    <AssetCardSkeleton />
                  </>
                ) : (
                  chartAssets?.map((asset) => (
                    <AssetCard key={asset.symbol} asset={asset} />
                  ))
                )}
              </div>

              {/* 하단: BTC.D, USDT.D, KIMP, CBP 메트릭 */}
              <div className="mt-3">
                {isLoading ? (
                  <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-gray-800 bg-gray-800 sm:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-[#111827] px-4 py-3">
                        <Skeleton className="mb-1 h-3 w-16" />
                        <Skeleton className="h-5 w-14" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <CryptoMetricsPanel assets={allAssets} />
                )}
              </div>
            </div>
          );
        }

        // 그 외: 일반 그리드
        return (
          <div key={section.category}>
            <div className="mb-3 flex items-center gap-2">
              {section.icon}
              <h3 className="text-sm font-semibold text-gray-300">
                {section.label}
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {isLoading
                ? Array.from({ length: section.skeletonCount }).map((_, i) => (
                    <AssetCardSkeleton key={i} />
                  ))
                : assets?.map((asset) => (
                    <AssetCard key={asset.symbol} asset={asset} />
                  ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
