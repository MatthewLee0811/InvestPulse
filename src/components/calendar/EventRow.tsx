// components/calendar/EventRow.tsx - 개별 경제 일정 행
// v1.3.0 | 2026-02-17

import { Badge } from '@/components/ui/Badge';
import type { EconomicEvent } from '@/lib/types';
import {
  formatKSTDateTime,
  getImpactStyle,
  getResultStatus,
} from '@/lib/utils';

interface EventRowProps {
  event: EconomicEvent;
}

export function EventRow({ event }: EventRowProps) {
  const result = getResultStatus(event.actual, event.forecast);

  return (
    <div className="border-b border-gray-800/50 px-4 py-3 transition-colors hover:bg-gray-800/20">
      {/* 데스크탑: 그리드 */}
      <div className="hidden sm:grid sm:grid-cols-[120px_60px_1fr_56px_56px_56px] sm:items-center sm:gap-2">
        {/* 날짜/시간 */}
        <span className="font-mono text-xs text-gray-400">
          {formatKSTDateTime(event.datetime)}
        </span>

        {/* 중요도 */}
        <div className="flex justify-center">
          <Badge className={getImpactStyle(event.impact)}>
            {event.impact === 'high' ? 'HIGH' : event.impact === 'medium' ? 'MID' : 'LOW'}
          </Badge>
        </div>

        {/* 지표명 */}
        <div className="min-w-0 px-1">
          <p className="truncate text-sm font-medium text-gray-200">
            {event.nameKo}
          </p>
          <p className="truncate text-xs text-gray-500">{event.name}</p>
        </div>

        {/* 이전 */}
        <span className="text-right font-mono text-xs text-gray-400">
          {event.previous ?? '-'}
        </span>

        {/* 예측 */}
        <span className="text-right font-mono text-xs text-gray-300">
          {event.forecast ?? '-'}
        </span>

        {/* 실제 + Beat/Miss */}
        <div className="text-right">
          <p className={`font-mono text-xs font-semibold ${result?.color ?? 'text-gray-500'}`}>
            {event.actual ?? '-'}
          </p>
          {result && (
            <p className={`text-[10px] font-bold ${result.color}`}>
              {result.label}
            </p>
          )}
        </div>
      </div>

      {/* 모바일: 스택 */}
      <div className="flex flex-col gap-1.5 sm:hidden">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-gray-400">
            {formatKSTDateTime(event.datetime)}
          </span>
          <Badge className={getImpactStyle(event.impact)}>
            {event.impact === 'high' ? 'HIGH' : event.impact === 'medium' ? 'MID' : 'LOW'}
          </Badge>
        </div>
        <p className="text-sm font-medium text-gray-200">{event.nameKo}</p>
        <div className="flex gap-4 text-xs">
          <div>
            <span className="text-gray-500">이전 </span>
            <span className="font-mono text-gray-400">{event.previous ?? '-'}</span>
          </div>
          <div>
            <span className="text-gray-500">예측 </span>
            <span className="font-mono text-gray-300">{event.forecast ?? '-'}</span>
          </div>
          <div>
            <span className="text-gray-500">실제 </span>
            <span className={`font-mono font-semibold ${result?.color ?? 'text-gray-500'}`}>
              {event.actual ?? '-'}
            </span>
            {result && (
              <span className={`ml-1 text-[10px] font-bold ${result.color}`}>{result.label}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
