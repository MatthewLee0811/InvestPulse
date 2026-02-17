// hooks/useFearGreed.ts - Fear & Greed 데이터 훅
// v1.0.0 | 2026-02-17

'use client';

import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS, QUERY_CONFIG } from '@/lib/constants';
import type { FearGreedData, FearGreedApiResponse } from '@/lib/types';

async function fetchFearGreed(): Promise<FearGreedData> {
  const res = await fetch(API_ENDPOINTS.FEAR_GREED);
  if (!res.ok) throw new Error('Fear & Greed 데이터 로드 실패');
  const json: FearGreedApiResponse = await res.json();
  return json.data;
}

export function useFearGreed() {
  return useQuery({
    queryKey: ['fear-greed'],
    queryFn: fetchFearGreed,
    staleTime: QUERY_CONFIG.FEAR_GREED.staleTime,
    refetchInterval: QUERY_CONFIG.FEAR_GREED.refetchInterval,
  });
}
