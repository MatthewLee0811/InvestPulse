// components/markets/AssetCard.tsx - 개별 자산 카드
// v1.0.0 | 2026-02-17

'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SparklineChart } from './SparklineChart';
import type { AssetData } from '@/lib/types';
import {
  formatNumber,
  formatChangePercent,
  getChangeColor,
  getChangeBgColor,
} from '@/lib/utils';

interface AssetCardProps {
  asset: AssetData;
}

export function AssetCard({ asset }: AssetCardProps) {
  const isDominance = asset.symbol === 'BTC.D' || asset.symbol === 'USDT.D';
  const isPremium = asset.symbol === 'KIMP' || asset.symbol === 'CBP';
  const isRatio = asset.symbol === 'ETHBTC';
  const isPercentOnly = isDominance || isPremium;
  const isPositive = asset.changePercent >= 0;
  const isNeutral = asset.changePercent === 0;
  const changeColor = getChangeColor(asset.changePercent);
  const changeBg = getChangeBgColor(asset.changePercent);

  const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="group rounded-xl border border-gray-800 bg-[#111827] p-4 transition-all duration-200 hover:border-gray-700 hover:bg-[#1f2937] hover:shadow-lg hover:shadow-black/20">
      {/* 상단: 자산명 + 티커 */}
      <div className="mb-2 flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-gray-200">
            {asset.nameKo}
          </span>
          <span className="ml-1.5 text-xs text-gray-500">{asset.symbol}</span>
        </div>
        <div className={`rounded-full p-1 ${changeBg}`}>
          <TrendIcon className={`h-3.5 w-3.5 ${changeColor}`} />
        </div>
      </div>

      {/* 현재가 */}
      <div className="mb-1">
        <span className={`font-mono text-lg font-bold ${isPremium ? (asset.price >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-white'}`}>
          {isPercentOnly
            ? `${asset.price >= 0 && isPremium ? '+' : ''}${asset.price.toFixed(2)}%`
            : isRatio
              ? formatNumber(asset.price, 5)
              : asset.category === 'forex' && asset.symbol === 'USDKRW'
                ? `₩${formatNumber(asset.price)}`
                : asset.category === 'bond'
                  ? `${formatNumber(asset.price)}%`
                  : `$${formatNumber(asset.price)}`}
        </span>
      </div>

      {/* 변동률 */}
      {isPercentOnly ? (
        <div className="mb-3 h-5" />
      ) : (
        <div className={`mb-3 flex items-center gap-1 text-sm ${changeColor}`}>
          <span className="font-mono">
            {asset.change >= 0 ? '+' : ''}
            {isRatio ? formatNumber(asset.change, 5) : formatNumber(asset.change)}
          </span>
          <span className={`rounded px-1 py-0.5 font-mono text-xs ${changeBg}`}>
            {formatChangePercent(asset.changePercent)}
          </span>
        </div>
      )}

      {/* 스파크라인 차트 */}
      <SparklineChart data={asset.sparkline} positive={isPositive} />
    </div>
  );
}
