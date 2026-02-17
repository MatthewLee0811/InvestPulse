// components/news/NewsCard.tsx - 개별 뉴스 카드 (AI 요약 기능 포함)
// v1.1.0 | 2026-02-17

'use client';

import { useState, useCallback } from 'react';
import { ExternalLink, Sparkles, Loader2, Check, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { NewsSummaryPanel } from './NewsSummaryPanel';
import { API_ENDPOINTS, NEWS_CATEGORY_LABELS } from '@/lib/constants';
import { formatRelativeTime } from '@/lib/utils';
import type { NewsItem, NewsSummaryResult, NewsSummarizeResponse } from '@/lib/types';

interface NewsCardProps {
  item: NewsItem;
}

const CATEGORY_COLORS: Record<string, string> = {
  market: 'bg-blue-500/20 text-blue-400',
  economy: 'bg-purple-500/20 text-purple-400',
  crypto: 'bg-amber-500/20 text-amber-400',
  commodity: 'bg-emerald-500/20 text-emerald-400',
  fed_policy: 'bg-red-500/20 text-red-400',
};

type SummaryState = 'idle' | 'loading' | 'done' | 'error';

export function NewsCard({ item }: NewsCardProps) {
  const [state, setState] = useState<SummaryState>('idle');
  const [data, setData] = useState<NewsSummaryResult | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isMock = item.id.startsWith('mock-');

  const handleSummarize = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // 이미 로드됨 → 토글만
      if (data) {
        setIsExpanded((prev) => !prev);
        return;
      }

      setState('loading');
      try {
        const res = await fetch(API_ENDPOINTS.NEWS_SUMMARIZE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            newsId: item.id,
            headline: item.headline,
            summary: item.summary,
            url: item.url,
          }),
        });

        const json: NewsSummarizeResponse = await res.json();

        if (json.success && json.data) {
          setData(json.data);
          setState('done');
          setIsExpanded(true);
        } else {
          setErrorMsg(json.error ?? '요약 실패');
          setState('error');
        }
      } catch {
        setErrorMsg('네트워크 오류');
        setState('error');
      }
    },
    [data, item],
  );

  return (
    <div className="border-b border-gray-800/50">
      {/* 뉴스 카드 본문 (링크) */}
      <div className="group flex items-start gap-2 px-4 py-3 transition-colors hover:bg-gray-800/20">
        {/* 헤드라인 + 요약 + 메타 */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 flex-1"
        >
          {/* 헤드라인 */}
          <h3 className="mb-1.5 text-sm font-medium leading-snug text-gray-200 group-hover:text-white">
            {item.headline}
          </h3>

          {/* 요약 */}
          {item.summary && (
            <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-gray-500">
              {item.summary}
            </p>
          )}

          {/* 메타: 출처, 시간, 카테고리 */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400">
              {item.source}
            </span>
            <span className="text-gray-700">&middot;</span>
            <span className="text-xs text-gray-500">
              {formatRelativeTime(item.publishedAt)}
            </span>
            <Badge
              className={
                CATEGORY_COLORS[item.category] ??
                'bg-gray-500/20 text-gray-400'
              }
            >
              {NEWS_CATEGORY_LABELS[item.category] ?? item.category}
            </Badge>
          </div>
        </a>

        {/* 우측 버튼 영역 */}
        <div className="flex shrink-0 items-start gap-1 pt-0.5">
          {/* AI 요약 버튼 — Mock 뉴스는 비활성 */}
          {!isMock && (
            <button
              onClick={handleSummarize}
              disabled={state === 'loading'}
              title={
                state === 'done'
                  ? '요약 접기/펼치기'
                  : '한국어로 번역/요약'
              }
              className="rounded-md p-1 text-gray-600 transition-colors hover:bg-gray-700/50 hover:text-blue-400 disabled:cursor-wait disabled:opacity-50"
            >
              {state === 'loading' && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
              )}
              {state === 'idle' && (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {state === 'done' && (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              )}
              {state === 'error' && (
                <RotateCcw className="h-3.5 w-3.5 text-red-400" />
              )}
            </button>
          )}

          {/* 외부 링크 아이콘 */}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md p-1 text-gray-600 transition-colors hover:text-gray-400"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* 에러 메시지 */}
      {state === 'error' && (
        <div className="px-4 pb-2">
          <p className="text-xs text-red-400">{errorMsg}</p>
        </div>
      )}

      {/* 요약 펼침 영역 */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isExpanded && data ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          {data && <NewsSummaryPanel data={data} />}
        </div>
      </div>
    </div>
  );
}
