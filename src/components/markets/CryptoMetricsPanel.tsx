// components/markets/CryptoMetricsPanel.tsx - 도미넌스/프리미엄 컴팩트 패널
// v1.0.0 | 2026-02-17

'use client';

import type { AssetData } from '@/lib/types';

const METRIC_SYMBOLS = ['BTC.D', 'USDT.D', 'KIMP', 'CBP'];

interface CryptoMetricsPanelProps {
  assets: AssetData[];
}

function getPriceColor(symbol: string, price: number): string {
  if (symbol === 'KIMP' || symbol === 'CBP') {
    if (price > 0) return 'text-emerald-400';
    if (price < 0) return 'text-red-400';
  }
  return 'text-white';
}

function formatPrice(symbol: string, price: number): string {
  const sign = (symbol === 'KIMP' || symbol === 'CBP') && price >= 0 ? '+' : '';
  return `${sign}${price.toFixed(2)}%`;
}

export function CryptoMetricsPanel({ assets }: CryptoMetricsPanelProps) {
  const metrics = METRIC_SYMBOLS
    .map((s) => assets.find((a) => a.symbol === s))
    .filter((a): a is AssetData => a != null);

  if (metrics.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-gray-800 bg-gray-800">
      {metrics.map((m) => (
        <div
          key={m.symbol}
          className="flex flex-col justify-center bg-[#111827] px-4 py-3 transition-colors hover:bg-[#1f2937]"
        >
          <span className="text-xs text-gray-400">{m.nameKo}</span>
          <span className={`font-mono text-base font-bold ${getPriceColor(m.symbol, m.price)}`}>
            {formatPrice(m.symbol, m.price)}
          </span>
        </div>
      ))}
    </div>
  );
}

export { METRIC_SYMBOLS };
