// components/market-status/FearGreedGauge.tsx - 반원형 게이지 차트 (컴팩트)
// v1.1.0 | 2026-02-17

'use client';

import type { FearGreedData } from '@/lib/types';

interface FearGreedGaugeProps {
  data: FearGreedData;
}

/** 0~100 값에 대한 색상 반환 (5구간) */
function getValueColor(value: number): string {
  if (value <= 20) return '#EF4444';  // 빨강 — 극심한 공포
  if (value <= 40) return '#F97316';  // 주황 — 공포
  if (value <= 60) return '#EAB308';  // 노랑 — 중립
  if (value <= 80) return '#84CC16';  // 연두 — 탐욕
  return '#22C55E';                    // 초록 — 극심한 탐욕
}

/** 0~100 값을 게이지 각도로 변환 (180도 = 반원) */
function valueToAngle(value: number): number {
  return (Math.max(0, Math.min(100, value)) / 100) * 180;
}

/** SVG 호(arc) 경로를 생성한다 */
function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
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

export function FearGreedGauge({ data }: FearGreedGaugeProps) {
  const angle = valueToAngle(data.value);
  const color = getValueColor(data.value);

  // 컴팩트 게이지 SVG 파라미터
  const cx = 70;
  const cy = 65;
  const r = 50;
  const strokeWidth = 10;

  const bgArcD = describeArc(cx, cy, r, 180, 360);
  const valueArcD = describeArc(cx, cy, r, 180, 180 + angle);

  // 바늘 위치
  const needleRad = ((180 + angle) * Math.PI) / 180;
  const needleLen = r - 16;
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = cy + needleLen * Math.sin(needleRad);

  // 어제 대비
  const diff =
    data.previousValue !== undefined ? data.value - data.previousValue : null;

  return (
    <div className="flex flex-col items-center">
      <h4 className="mb-1 text-xs font-medium text-gray-400">
        크립토 공포/탐욕 지수
      </h4>

      <svg width="140" height="80" viewBox="0 0 140 80">
        {/* 배경 반원 호 */}
        <path
          d={bgArcD}
          fill="none"
          stroke="#1f2937"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* 값 호 */}
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
          strokeWidth="2"
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <circle cx={cx} cy={cy} r="3" fill={color} />

        {/* 라벨: 0, 50, 100 */}
        <text x="15" y="73" fill="#4b5563" fontSize="9" textAnchor="middle">
          0
        </text>
        <text x="70" y="11" fill="#4b5563" fontSize="9" textAnchor="middle">
          50
        </text>
        <text x="125" y="73" fill="#4b5563" fontSize="9" textAnchor="middle">
          100
        </text>
      </svg>

      {/* 수치 + 라벨 */}
      <div className="-mt-2 text-center">
        <span className="text-2xl font-bold" style={{ color }}>
          {data.value}
        </span>
        <span className="ml-1.5 text-sm font-medium" style={{ color }}>
          {data.labelKo}
        </span>
      </div>

      {/* 어제 대비 */}
      {diff !== null && (
        <p className="mt-0.5 text-xs text-gray-500">
          어제: {data.previousValue}{' '}
          <span className={diff >= 0 ? 'text-emerald-400' : 'text-red-400'}>
            ({diff >= 0 ? '+' : ''}
            {diff})
          </span>
        </p>
      )}
    </div>
  );
}
