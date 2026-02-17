// app/api/summary/route.ts - 시장 요약 API Route
// v1.0.0 | 2026-02-17

import { NextResponse } from 'next/server';
import { fetchAllMarkets } from '@/lib/api/markets';
import { fetchEconomicCalendar } from '@/lib/api/calendar';
import { fetchFearGreed } from '@/lib/api/fear-greed';
import { generateSummary } from '@/lib/summary-generator';
import { getCachedData, setCachedData, getStaleData } from '@/lib/cache';
import { CACHE_TTL } from '@/lib/constants';
import type { AssetData, EconomicEvent, FearGreedData, MarketSummaryData } from '@/lib/types';
import { startOfWeek, endOfWeek, format } from 'date-fns';

const CACHE_KEY = 'summary';

export async function GET() {
  try {
    const cached = getCachedData<MarketSummaryData>(CACHE_KEY, CACHE_TTL.SUMMARY);
    if (cached) {
      return NextResponse.json({
        data: cached,
        updatedAt: new Date().toISOString(),
      });
    }

    // 이번 주 날짜 범위
    const today = new Date();
    const from = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const to = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');

    // 시세 캐시 우선 확인 → 없으면 직접 fetch
    let markets: AssetData[] =
      getCachedData<AssetData[]>('markets', CACHE_TTL.MARKETS) ?? [];
    let events: EconomicEvent[] =
      getCachedData<EconomicEvent[]>(`calendar-${from}-${to}`, CACHE_TTL.CALENDAR) ?? [];
    let fearGreed: FearGreedData | null =
      getCachedData<FearGreedData>('fear-greed', CACHE_TTL.FEAR_GREED) ?? null;

    // 캐시에 없으면 병렬 fetch
    const promises: Promise<void>[] = [];

    if (markets.length === 0) {
      promises.push(
        fetchAllMarkets()
          .then((d) => { markets = d; })
          .catch(() => { /* 실패 시 빈 배열 유지 */ })
      );
    }
    if (events.length === 0) {
      promises.push(
        fetchEconomicCalendar(from, to)
          .then((d) => { events = d; })
          .catch(() => {})
      );
    }
    if (!fearGreed) {
      promises.push(
        fetchFearGreed()
          .then((d) => { fearGreed = d; })
          .catch(() => {})
      );
    }

    await Promise.all(promises);

    const data = generateSummary(markets, events, fearGreed);
    setCachedData(CACHE_KEY, data);

    return NextResponse.json({
      data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API/Summary] 에러:', error);

    const stale = getStaleData<MarketSummaryData>(CACHE_KEY);
    if (stale) {
      return NextResponse.json({
        data: stale,
        updatedAt: new Date().toISOString(),
        stale: true,
      });
    }

    return NextResponse.json(
      { error: '시장 요약을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}
