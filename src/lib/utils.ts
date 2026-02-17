// lib/utils.ts - 유틸리티 함수
// v1.0.0 | 2026-02-17

import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';

const KST_TIMEZONE = 'Asia/Seoul';

/** UTC ISO 문자열을 KST Date 객체로 변환 */
export function toKST(dateStr: string): Date {
  return toZonedTime(new Date(dateStr), KST_TIMEZONE);
}

/** KST 기준 날짜 + 시간 포맷 */
export function formatKSTDateTime(dateStr: string): string {
  const kst = toKST(dateStr);
  return format(kst, 'M/d (EEE) HH:mm', { locale: ko });
}

/** KST 기준 날짜만 포맷 */
export function formatKSTDate(dateStr: string): string {
  const kst = toKST(dateStr);
  return format(kst, 'M월 d일 (EEE)', { locale: ko });
}

/** 상대 시간 표시 ("2시간 전", "어제" 등) */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return formatDistanceToNow(date, { addSuffix: true, locale: ko });
  }
  if (isYesterday(date)) {
    return '어제';
  }
  return format(date, 'M/d', { locale: ko });
}

/** 숫자 포맷 (천 단위 콤마) */
export function formatNumber(num: number, decimals?: number): string {
  const d = decimals ?? (num >= 100 ? 2 : num >= 1 ? 2 : 4);
  return num.toLocaleString('en-US', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

/** 변동률 포맷 (+0.52%, -1.23%) */
export function formatChangePercent(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

/** 변동 색상 클래스 반환 */
export function getChangeColor(change: number): string {
  if (change > 0) return 'text-emerald-400';
  if (change < 0) return 'text-red-400';
  return 'text-gray-400';
}

/** 변동 배경 색상 클래스 반환 */
export function getChangeBgColor(change: number): string {
  if (change > 0) return 'bg-emerald-500/10';
  if (change < 0) return 'bg-red-500/10';
  return 'bg-gray-500/10';
}

/** 중요도에 따른 스타일 클래스 */
export function getImpactStyle(impact: 'high' | 'medium' | 'low'): string {
  switch (impact) {
    case 'high':
      return 'bg-red-500/20 text-red-400';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'low':
      return 'bg-green-500/20 text-green-400';
  }
}

/** 중요도 아이콘 */
export function getImpactIcon(impact: 'high' | 'medium' | 'low'): string {
  switch (impact) {
    case 'high': return '🔴';
    case 'medium': return '🟡';
    case 'low': return '🟢';
  }
}

/** Beat/Miss/Meet 판정 */
export function getResultStatus(
  actual?: string,
  forecast?: string
): { label: string; color: string } | null {
  if (!actual || !forecast) return null;

  const a = parseFloat(actual);
  const f = parseFloat(forecast);
  if (isNaN(a) || isNaN(f)) return null;

  if (a > f) return { label: 'Beat', color: 'text-emerald-400' };
  if (a < f) return { label: 'Miss', color: 'text-red-400' };
  return { label: 'Meet', color: 'text-yellow-400' };
}
