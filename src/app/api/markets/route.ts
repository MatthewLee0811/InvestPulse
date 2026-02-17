// app/api/markets/route.ts - 시세 데이터 API Route
// v1.0.0 | 2026-02-17

import { NextResponse } from 'next/server';
import { fetchAllMarkets } from '@/lib/api/markets';
import { getCachedData, setCachedData, getStaleData } from '@/lib/cache';
import { CACHE_TTL } from '@/lib/constants';
import type { AssetData } from '@/lib/types';

const CACHE_KEY = 'markets';

export async function GET() {
  try {
    // 캐시 확인
    const cached = getCachedData<AssetData[]>(CACHE_KEY, CACHE_TTL.MARKETS);
    if (cached) {
      return NextResponse.json({
        data: cached,
        updatedAt: new Date().toISOString(),
      });
    }

    // 새로운 데이터 fetch
    const data = await fetchAllMarkets();
    setCachedData(CACHE_KEY, data);

    return NextResponse.json({
      data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API/Markets] 에러:', error);

    // 실패 시 이전 캐시 데이터 fallback
    const stale = getStaleData<AssetData[]>(CACHE_KEY);
    if (stale) {
      return NextResponse.json({
        data: stale,
        updatedAt: new Date().toISOString(),
        stale: true,
      });
    }

    return NextResponse.json(
      { error: '시세 데이터를 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}
