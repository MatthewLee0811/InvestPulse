// components/news/NewsCard.tsx - 개별 뉴스 카드
// v1.0.0 | 2026-02-17

import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { NewsItem } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';
import { NEWS_CATEGORY_LABELS } from '@/lib/constants';

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

export function NewsCard({ item }: NewsCardProps) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block border-b border-gray-800/50 px-4 py-3 transition-colors hover:bg-gray-800/20"
    >
      {/* 헤드라인 */}
      <div className="mb-1.5 flex items-start gap-2">
        <h3 className="flex-1 text-sm font-medium leading-snug text-gray-200 group-hover:text-white">
          {item.headline}
        </h3>
        <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-600 group-hover:text-gray-400" />
      </div>

      {/* 요약 */}
      {item.summary && (
        <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-gray-500">
          {item.summary}
        </p>
      )}

      {/* 메타: 출처, 시간, 카테고리 */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-400">{item.source}</span>
        <span className="text-gray-700">&middot;</span>
        <span className="text-xs text-gray-500">
          {formatRelativeTime(item.publishedAt)}
        </span>
        <Badge className={CATEGORY_COLORS[item.category] ?? 'bg-gray-500/20 text-gray-400'}>
          {NEWS_CATEGORY_LABELS[item.category] ?? item.category}
        </Badge>
      </div>
    </a>
  );
}
