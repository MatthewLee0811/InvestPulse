// hooks/useMarketStatus.ts - 시장 상태 훅 (1분마다 갱신)
// v1.0.0 | 2026-02-17

'use client';

import { useState, useEffect } from 'react';
import { getAllMarketStatuses } from '@/lib/market-hours';
import type { MarketStatus } from '@/lib/types';

const REFRESH_INTERVAL = 60_000; // 1분

export function useMarketStatus() {
  const [statuses, setStatuses] = useState<MarketStatus[]>(() =>
    getAllMarketStatuses()
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setStatuses(getAllMarketStatuses());
    }, REFRESH_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  return statuses;
}
