// components/news/NewsSummaryPanel.tsx - 뉴스 요약 결과 표시
// v1.0.0 | 2026-02-17

import type { NewsSummaryResult } from '@/lib/types';

interface NewsSummaryPanelProps {
  data: NewsSummaryResult;
}

const PROVIDER_LABELS: Record<string, string> = {
  gemini: 'Gemini Flash',
  openai: 'GPT-4o-mini',
};

export function NewsSummaryPanel({ data }: NewsSummaryPanelProps) {
  return (
    <div className="border-l-2 border-blue-500 bg-slate-800/50 px-4 py-3">
      {/* 번역 제목 */}
      <p className="mb-2 text-sm font-semibold text-gray-200">
        {data.translatedHeadline}
      </p>

      {/* 한국어 요약 */}
      <p className="mb-2 whitespace-pre-line text-sm leading-relaxed text-gray-300">
        {data.koreanSummary}
      </p>

      {/* 메타 */}
      <p className="text-[11px] text-gray-600">
        {PROVIDER_LABELS[data.provider] ?? data.provider}
        {data.cached ? ' · 캐시됨' : ''}
      </p>
    </div>
  );
}
