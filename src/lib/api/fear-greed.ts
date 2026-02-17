// lib/api/fear-greed.ts - 크립토 공포/탐욕 지수 fetch 로직
// v1.0.0 | 2026-02-17

import type { FearGreedData } from '../types';

interface AlternativeMeEntry {
  value: string;
  value_classification: string;
  timestamp: string;
}

interface AlternativeMeResponse {
  data: AlternativeMeEntry[];
}

/** 영문 분류를 한국어로 매핑 */
function classificationToKo(classification: string): string {
  const lower = classification.toLowerCase();
  if (lower.includes('extreme fear')) return '극심한 공포';
  if (lower.includes('extreme greed')) return '극심한 탐욕';
  if (lower.includes('fear')) return '공포';
  if (lower.includes('greed')) return '탐욕';
  return '중립';
}

/** Alternative.me Crypto Fear & Greed Index API 호출 */
export async function fetchFearGreed(): Promise<FearGreedData> {
  const res = await fetch('https://api.alternative.me/fng/?limit=2');

  if (!res.ok) {
    throw new Error(`Fear & Greed API 오류: ${res.status}`);
  }

  const json: AlternativeMeResponse = await res.json();
  const entries = json.data;

  if (!entries || entries.length === 0) {
    throw new Error('Fear & Greed 데이터 없음');
  }

  const current = entries[0];
  const previous = entries.length > 1 ? entries[1] : undefined;

  return {
    value: parseInt(current.value, 10),
    label: current.value_classification,
    labelKo: classificationToKo(current.value_classification),
    timestamp: new Date(parseInt(current.timestamp, 10) * 1000).toISOString(),
    previousValue: previous ? parseInt(previous.value, 10) : undefined,
    previousLabel: previous ? previous.value_classification : undefined,
  };
}
