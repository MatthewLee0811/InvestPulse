// components/summary/MarketSummary.tsx - 시장 요약 텍스트 섹션
// v1.0.0 | 2026-02-17

'use client';

import { useState } from 'react';
import { BarChart3, Calendar, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { useSummary } from '@/hooks/useSummary';
import { Skeleton } from '@/components/ui/Skeleton';

export function MarketSummary() {
  const { data, isLoading } = useSummary();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isLoading) {
    return (
      <section className="px-4">
        <div className="rounded-xl border border-gray-800 bg-[#111827] p-5">
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-2 h-4 w-5/6" />
          <Skeleton className="mb-3 h-4 w-3/4" />
          <Skeleton className="mb-2 h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </section>
    );
  }

  if (!data) return null;

  return (
    <section className="px-4">
      <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-[#111827]">
        {/* 좌측 액센트 바 */}
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-emerald-500" />

        <div className="p-5 pl-6">
          {/* 헤더 */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-gray-200">
                오늘의 시장 요약
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{data.date}</span>
              {/* 모바일 접기/펼치기 */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300 sm:hidden"
                aria-label={isCollapsed ? '펼치기' : '접기'}
              >
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* 본문 — 모바일에서 접기 가능 */}
          <div className={isCollapsed ? 'hidden sm:block' : ''}>
            {/* 시장 요약 텍스트 */}
            <p className="mb-3 text-sm leading-relaxed text-gray-300">
              {data.text}
            </p>

            {/* 이번 주 일정 */}
            {data.events && (
              <div className="mb-2 flex items-start gap-2">
                <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                <p className="text-xs leading-relaxed text-gray-400">
                  {data.events}
                </p>
              </div>
            )}

            {/* 시장 심리 */}
            {data.sentiment && (
              <div className="flex items-start gap-2">
                <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple-400" />
                <p className="text-xs leading-relaxed text-gray-400">
                  {data.sentiment}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
