// hooks/useCalendar.ts - 경제 일정 훅
// v1.0.0 | 2026-02-17

'use client';

import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS, QUERY_CONFIG } from '@/lib/constants';
import type { EconomicEvent, CalendarTab, CalendarApiResponse } from '@/lib/types';

async function fetchCalendar(tab: CalendarTab): Promise<EconomicEvent[]> {
  const res = await fetch(`${API_ENDPOINTS.CALENDAR}?tab=${tab}`);
  if (!res.ok) throw new Error('경제 일정 로드 실패');
  const json: CalendarApiResponse = await res.json();
  return json.data;
}

export function useCalendar(tab: CalendarTab) {
  return useQuery({
    queryKey: ['calendar', tab],
    queryFn: () => fetchCalendar(tab),
    staleTime: QUERY_CONFIG.CALENDAR.staleTime,
    refetchInterval: QUERY_CONFIG.CALENDAR.refetchInterval,
  });
}
