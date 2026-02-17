// components/news/NewsFeed.tsx - 뉴스 피드 섹션
// v1.0.0 | 2026-02-17

'use client';

import { useState, useMemo } from 'react';
import { Newspaper } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { NewsCard } from './NewsCard';
import { NewsCardSkeleton } from '@/components/ui/Skeleton';
import { useNews } from '@/hooks/useNews';
import type { NewsTab } from '@/lib/types';
import { isToday, isThisWeek, isThisMonth } from 'date-fns';

const NEWS_TABS = [
  { key: 'today', label: '오늘' },
  { key: 'this_week', label: '이번 주' },
  { key: 'this_month', label: '이번 달' },
];

export function NewsFeed() {
  const [activeTab, setActiveTab] = useState<NewsTab>('today');
  const { data, isLoading, error } = useNews();

  const filteredNews = useMemo(() => {
    if (!data) return [];

    return data.filter((item) => {
      const date = new Date(item.publishedAt);
      switch (activeTab) {
        case 'today':
          return isToday(date);
        case 'this_week':
          return isThisWeek(date, { weekStartsOn: 1 });
        case 'this_month':
          return isThisMonth(date);
        default:
          return true;
      }
    });
  }, [data, activeTab]);

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-800 bg-[#111827]">
      {/* 헤더 */}
      <div className="flex flex-col gap-3 border-b border-gray-800 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-semibold text-white">투자 뉴스</h2>
        </div>
        <Tabs
          tabs={NEWS_TABS}
          activeTab={activeTab}
          onTabChange={(key) => setActiveTab(key as NewsTab)}
        />
      </div>

      {/* 뉴스 리스트 */}
      <div className="flex-1 overflow-y-auto">
        {error && !data ? (
          <div className="p-6 text-center text-sm text-red-400">
            뉴스를 불러올 수 없습니다.
          </div>
        ) : isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <NewsCardSkeleton key={i} />
          ))
        ) : filteredNews.length > 0 ? (
          filteredNews.map((item) => <NewsCard key={item.id} item={item} />)
        ) : (
          <div className="p-6 text-center text-sm text-gray-500">
            해당 기간의 뉴스가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
