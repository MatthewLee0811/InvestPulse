// hooks/useNews.ts - 뉴스 훅
// v1.0.0 | 2026-02-17

'use client';

import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS, QUERY_CONFIG } from '@/lib/constants';
import type { NewsItem, NewsApiResponse } from '@/lib/types';

async function fetchNews(): Promise<NewsItem[]> {
  const res = await fetch(API_ENDPOINTS.NEWS);
  if (!res.ok) throw new Error('뉴스 로드 실패');
  const json: NewsApiResponse = await res.json();
  return json.data;
}

export function useNews() {
  return useQuery({
    queryKey: ['news'],
    queryFn: fetchNews,
    staleTime: QUERY_CONFIG.NEWS.staleTime,
    refetchInterval: QUERY_CONFIG.NEWS.refetchInterval,
  });
}
