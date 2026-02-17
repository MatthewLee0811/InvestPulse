// components/market-status/FearGreedGauge.tsx - 반원형 게이지 차트
// v1.0.0 | 2026-02-17

'use client';

import type { FearGreedData } from '@/lib/types';

interface FearGreedGaugeProps {
  data: FearGreedData;
}

/** 0~100 값에 대한 색상 반환 */
function getValueColor(value: number): string {
  if (value <= 25) return '#ef4444';  // 빨강
  if (value <= 45) return '#f97316';  // 주황
  if (value <= 55) return '#eab308';  // 노랑
  if (value <= 75) return '#84cc16';  // 연두
  return '#10b981';                    // 초록
}

/** 0~100 값을 게이지 각도로 변환 (180도 = 반원) */
function valueToAngle(value: number): number {
  return (Math.max(0, Math.min(100, value)) / 100) * 180;
}

export function FearGreedGauge({ data }: FearGreedGaugeProps) {
  const angle = valueToAngle(data.value);
  const color = getValueColor(data.value);

  // 반원형 게이지 SVG 파라미터
  const cx = 100;
  const cy = 90;
  const r = 70;
  const strokeWidth = 12;

  // 배경 호 (반원)
  const bgArcD = describeArc(cx, cy, r, 180, 360);
  // 값 호 (0~value에 해당하는 부분)
  const valueArcD = describeArc(cx, cy, r, 180, 180 + angle);

  // 바늘 위치 계산
  const needleAngle = 180 + angle;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleLen = r - 20;
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = cy + needleLen * Math.sin(needleRad);

  // 어제 대비 변화
  const diff = data.previousValue !== undefined ? data.value - data.previousValue : null;

  return (
    <div className="flex flex-col items-center">
      <h4 className="mb-1 text-xs font-medium text-gray-400">
        크립토 공포/탐욕 지수
      </h4>

      <div className="relative">
        <svg width="200" height="110" viewBox="0 0 200 110">
          {/* 배경 반원 호 */}
          <path
            d={bgArcD}
            fill="none"
            stroke="#374151"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* 값 호 — 색상 그라데이션 효과 */}
          <path
            d={valueArcD}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />

          {/* 바늘 */}
          <line
            x1={cx}
            y1={cy}
            x2={nx}
            y2={ny}
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <circle cx={cx} cy={cy} r="4" fill={color} />

          {/* 라벨: 0, 50, 100 */}
          <text x="22" y="98" fill="#6b7280" fontSize="10" textAnchor="middle">0</text>
          <text x="100" y="16" fill="#6b7280" fontSize="10" textAnchor="middle">50</text>
          <text x="178" y="98" fill="#6b7280" fontSize="10" textAnchor="middle">100</text>
        </svg>
      </div>

      {/* 수치 + 라벨 */}
      <div className="-mt-4 text-center">
        <span className="text-2xl font-bold" style={{ color }}>
          {data.value}
        </span>
        <span className="ml-1.5 text-sm font-medium" style={{ color }}>
          {data.labelKo}
        </span>
      </div>

      {/* 어제 대비 */}
      {diff !== null && (
        <p className="mt-1 text-xs text-gray-500">
          어제: {data.previousValue}{' '}
          <span className={diff >= 0 ? 'text-emerald-400' : 'text-red-400'}>
            ({diff >= 0 ? '+' : ''}{diff})
          </span>
        </p>
      )}
    </div>
  );
}

/** SVG 호(arc) 경로를 생성한다 */
function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}
