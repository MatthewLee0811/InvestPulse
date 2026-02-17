// components/markets/SparklineChart.tsx - 미니 스파크라인 차트
// v1.2.0 | 2026-02-17

'use client';

import { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, YAxis } from 'recharts';

interface SparklineChartProps {
  data: number[];
  positive: boolean;
}

export function SparklineChart({ data, positive }: SparklineChartProps) {
  const { chartData, domain } = useMemo(() => {
    if (data.length < 2) return { chartData: [], domain: [0, 0] as [number, number] };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const padding = (max - min) * 0.1 || max * 0.01;

    return {
      chartData: data.map((value, index) => ({ index, value })),
      domain: [min - padding, max + padding] as [number, number],
    };
  }, [data]);

  if (chartData.length < 2) {
    return (
      <div className="flex h-12 items-center justify-center text-xs text-gray-600">
        -
      </div>
    );
  }

  const color = positive ? '#10b981' : '#ef4444';
  const gradientId = `gradient-${positive ? 'up' : 'down'}-${Math.random().toString(36).slice(2, 6)}`;

  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <YAxis domain={domain} hide />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
