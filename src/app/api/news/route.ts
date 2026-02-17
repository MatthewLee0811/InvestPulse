// app/api/news/route.ts - 뉴스 API Route
// v1.0.0 | 2026-02-17

import { NextResponse } from 'next/server';
import { fetchAllNews } from '@/lib/api/news';
import { getCachedData, setCachedData, getStaleData } from '@/lib/cache';
import { CACHE_TTL } from '@/lib/constants';
import type { NewsItem } from '@/lib/types';

const CACHE_KEY = 'news';

export async function GET() {
  try {
    // 캐시 확인
    const cached = getCachedData<NewsItem[]>(CACHE_KEY, CACHE_TTL.NEWS);
    if (cached) {
      return NextResponse.json({
        data: cached,
        updatedAt: new Date().toISOString(),
      });
    }

    const data = await fetchAllNews();
    setCachedData(CACHE_KEY, data);

    return NextResponse.json({
      data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API/News] 에러:', error);

    const stale = getStaleData<NewsItem[]>(CACHE_KEY);
    if (stale) {
      return NextResponse.json({
        data: stale,
        updatedAt: new Date().toISOString(),
        stale: true,
      });
    }

    return NextResponse.json(
      { error: '뉴스를 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}
