// app/api/fear-greed/route.ts - Fear & Greed API Route
// v1.0.0 | 2026-02-17

import { NextResponse } from 'next/server';
import { fetchFearGreed } from '@/lib/api/fear-greed';
import { getCachedData, setCachedData, getStaleData } from '@/lib/cache';
import { CACHE_TTL } from '@/lib/constants';
import type { FearGreedData } from '@/lib/types';

const CACHE_KEY = 'fear-greed';

export async function GET() {
  try {
    const cached = getCachedData<FearGreedData>(CACHE_KEY, CACHE_TTL.FEAR_GREED);
    if (cached) {
      return NextResponse.json({
        data: cached,
        updatedAt: new Date().toISOString(),
      });
    }

    const data = await fetchFearGreed();
    setCachedData(CACHE_KEY, data);

    return NextResponse.json({
      data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API/FearGreed] 에러:', error);

    const stale = getStaleData<FearGreedData>(CACHE_KEY);
    if (stale) {
      return NextResponse.json({
        data: stale,
        updatedAt: new Date().toISOString(),
        stale: true,
      });
    }

    return NextResponse.json(
      { error: '공포/탐욕 지수를 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}
