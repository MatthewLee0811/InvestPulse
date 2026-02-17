// hooks/useSummary.ts - 시장 요약 데이터 훅
// v1.0.0 | 2026-02-17

'use client';

import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS, QUERY_CONFIG } from '@/lib/constants';
import type { MarketSummaryData, SummaryApiResponse } from '@/lib/types';

async function fetchSummary(): Promise<MarketSummaryData> {
  const res = await fetch(API_ENDPOINTS.SUMMARY);
  if (!res.ok) throw new Error('시장 요약 로드 실패');
  const json: SummaryApiResponse = await res.json();
  return json.data;
}

export function useSummary() {
  return useQuery({
    queryKey: ['summary'],
    queryFn: fetchSummary,
    staleTime: QUERY_CONFIG.SUMMARY.staleTime,
    refetchInterval: QUERY_CONFIG.SUMMARY.refetchInterval,
  });
}
