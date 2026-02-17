// hooks/useMarketData.ts - 시세 데이터 훅
// v1.0.0 | 2026-02-17

'use client';

import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS, QUERY_CONFIG } from '@/lib/constants';
import type { AssetData, MarketApiResponse } from '@/lib/types';

async function fetchMarkets(): Promise<AssetData[]> {
  const res = await fetch(API_ENDPOINTS.MARKETS);
  if (!res.ok) throw new Error('시세 데이터 로드 실패');
  const json: MarketApiResponse = await res.json();
  return json.data;
}

export function useMarketData() {
  return useQuery({
    queryKey: ['markets'],
    queryFn: fetchMarkets,
    staleTime: QUERY_CONFIG.MARKETS.staleTime,
    refetchInterval: QUERY_CONFIG.MARKETS.refetchInterval,
  });
}
