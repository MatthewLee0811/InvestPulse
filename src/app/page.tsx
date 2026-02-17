// app/page.tsx - 메인 대시보드 페이지
// v1.0.0 | 2026-02-17

'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MarketOverview } from '@/components/markets/MarketOverview';
import { EconomicCalendar } from '@/components/calendar/EconomicCalendar';
import { NewsFeed } from '@/components/news/NewsFeed';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function Home() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setLastUpdated(format(new Date(), 'HH:mm:ss', { locale: ko }));
    setIsRefreshing(false);
  }, [queryClient]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <main className="mx-auto w-full max-w-7xl flex-1">
        {/* 상단: 자산 카드 그리드 */}
        <MarketOverview />

        {/* 하단: 경제 일정 + 뉴스 2컬럼 */}
        <div className="grid grid-cols-1 gap-4 px-4 pb-6 lg:grid-cols-2">
          <EconomicCalendar />
          <NewsFeed />
        </div>
      </main>

      <Footer />
    </div>
  );
}
