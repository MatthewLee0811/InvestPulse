// app/api/calendar/route.ts - 경제 일정 API Route
// v1.0.0 | 2026-02-17

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { fetchEconomicCalendar } from '@/lib/api/calendar';
import { getCachedData, setCachedData, getStaleData } from '@/lib/cache';
import { CACHE_TTL } from '@/lib/constants';
import type { EconomicEvent } from '@/lib/types';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addMonths,
  format,
} from 'date-fns';

function getDateRange(tab: string): { from: string; to: string } {
  const today = new Date();

  switch (tab) {
    case 'this_week': {
      const start = startOfWeek(today, { weekStartsOn: 1 });
      const end = endOfWeek(today, { weekStartsOn: 1 });
      return { from: format(start, 'yyyy-MM-dd'), to: format(end, 'yyyy-MM-dd') };
    }
    case 'this_month': {
      const start = startOfMonth(today);
      const end = endOfMonth(today);
      return { from: format(start, 'yyyy-MM-dd'), to: format(end, 'yyyy-MM-dd') };
    }
    case 'next_month': {
      const next = addMonths(today, 1);
      const start = startOfMonth(next);
      const end = endOfMonth(next);
      return { from: format(start, 'yyyy-MM-dd'), to: format(end, 'yyyy-MM-dd') };
    }
    default:
      return getDateRange('this_week');
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const tab = searchParams.get('tab') ?? 'this_week';
    const { from, to } = getDateRange(tab);

    const cacheKey = `calendar-${from}-${to}`;

    // 캐시 확인
    const cached = getCachedData<EconomicEvent[]>(cacheKey, CACHE_TTL.CALENDAR);
    if (cached) {
      return NextResponse.json({
        data: cached,
        updatedAt: new Date().toISOString(),
      });
    }

    const data = await fetchEconomicCalendar(from, to);
    setCachedData(cacheKey, data);

    return NextResponse.json({
      data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API/Calendar] 에러:', error);

    const stale = getStaleData<EconomicEvent[]>('calendar-stale');
    if (stale) {
      return NextResponse.json({
        data: stale,
        updatedAt: new Date().toISOString(),
        stale: true,
      });
    }

    return NextResponse.json(
      { error: '경제 일정을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}
