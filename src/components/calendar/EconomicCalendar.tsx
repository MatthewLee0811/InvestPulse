// components/calendar/EconomicCalendar.tsx - 경제 일정 섹션
// v1.2.0 | 2026-02-17

'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { EventRow } from './EventRow';
import { EventRowSkeleton } from '@/components/ui/Skeleton';
import { useCalendar } from '@/hooks/useCalendar';
import type { CalendarTab } from '@/lib/types';

const CALENDAR_TABS = [
  { key: 'this_week', label: '이번 주' },
  { key: 'this_month', label: '이번 달' },
  { key: 'next_month', label: '다음 달' },
];

export function EconomicCalendar() {
  const [activeTab, setActiveTab] = useState<CalendarTab>('this_week');
  const { data, isLoading, error } = useCalendar(activeTab);

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-800 bg-[#111827]">
      {/* 헤더 */}
      <div className="flex flex-col gap-3 border-b border-gray-800 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-amber-400" />
          <h2 className="text-base font-semibold text-white">경제 일정</h2>
        </div>
        <Tabs
          tabs={CALENDAR_TABS}
          activeTab={activeTab}
          onTabChange={(key) => setActiveTab(key as CalendarTab)}
        />
      </div>

      {/* 테이블 헤더 */}
      <div className="hidden border-b border-gray-800/50 bg-gray-800/30 px-4 py-2 text-xs text-gray-500 sm:grid sm:grid-cols-[120px_60px_1fr_56px_56px_56px] sm:gap-2">
        <span>일시(KST)</span>
        <span className="text-center">중요도</span>
        <span>지표명</span>
        <span className="text-right">이전</span>
        <span className="text-right">예측</span>
        <span className="text-right">실제</span>
      </div>

      {/* 일정 리스트 */}
      <div className="flex-1 overflow-y-auto">
        {error && !data ? (
          <div className="p-6 text-center text-sm text-red-400">
            경제 일정을 불러올 수 없습니다.
          </div>
        ) : isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <EventRowSkeleton key={i} />
          ))
        ) : data && data.length > 0 ? (
          data.map((event) => <EventRow key={event.id} event={event} />)
        ) : (
          <div className="p-6 text-center text-sm text-gray-500">
            해당 기간에 예정된 일정이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
