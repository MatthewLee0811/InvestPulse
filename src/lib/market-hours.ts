// lib/market-hours.ts - 시장 개장/마감 시간 판단 로직
// v1.0.0 | 2026-02-17

import type { MarketStatus, MarketStatusType } from './types';

interface MarketDef {
  id: string;
  name: string;
  flag: string;
  timezone: string;
  /** 정규장 시작/종료 (현지 시간, HH:mm) */
  regularOpen: string;
  regularClose: string;
  /** 프리마켓 시작 (현지 시간) — 없으면 null */
  preMarketOpen: string | null;
  /** 애프터마켓 종료 (현지 시간) — 없으면 null */
  afterMarketClose: string | null;
  /** 24시간 시장 여부 */
  is24h: boolean;
  /** 주말 마감 여부 */
  weekendClosed: boolean;
}

const MARKETS: MarketDef[] = [
  {
    id: 'us',
    name: '미국',
    flag: '🇺🇸',
    timezone: 'America/New_York',
    regularOpen: '09:30',
    regularClose: '16:00',
    preMarketOpen: '04:00',
    afterMarketClose: '20:00',
    is24h: false,
    weekendClosed: true,
  },
  {
    id: 'kr',
    name: '한국',
    flag: '🇰🇷',
    timezone: 'Asia/Seoul',
    regularOpen: '09:00',
    regularClose: '15:30',
    preMarketOpen: null,
    afterMarketClose: null,
    is24h: false,
    weekendClosed: true,
  },
  {
    id: 'crypto',
    name: '크립토',
    flag: '🪙',
    timezone: 'UTC',
    regularOpen: '00:00',
    regularClose: '23:59',
    preMarketOpen: null,
    afterMarketClose: null,
    is24h: true,
    weekendClosed: false,
  },
  {
    id: 'eu',
    name: '유럽',
    flag: '🇪🇺',
    timezone: 'Europe/London',
    regularOpen: '08:00',
    regularClose: '16:30',
    preMarketOpen: null,
    afterMarketClose: null,
    is24h: false,
    weekendClosed: true,
  },
];

/** 특정 타임존의 현재 시간 정보를 구한다 */
function getLocalTime(now: Date, timezone: string): { hours: number; minutes: number; dayOfWeek: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'short',
    hour12: false,
  }).formatToParts(now);

  let hours = 0;
  let minutes = 0;
  let weekday = '';

  for (const part of parts) {
    if (part.type === 'hour') hours = parseInt(part.value, 10);
    if (part.type === 'minute') minutes = parseInt(part.value, 10);
    if (part.type === 'weekday') weekday = part.value;
  }

  // Intl hour12:false에서 24시가 0으로 올 수 있음
  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { hours, minutes, dayOfWeek: dayMap[weekday] ?? 0 };
}

/** "HH:mm" 문자열을 분 단위로 변환 */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** 분 차이를 "X시간 Y분" 형태로 표시 */
function formatMinuteDiff(diffMin: number): string {
  if (diffMin <= 0) return '';
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

/** 단일 시장의 상태를 계산한다 */
function getMarketStatus(market: MarketDef, now: Date): MarketStatus {
  // 24시간 시장
  if (market.is24h) {
    return {
      id: market.id,
      name: market.name,
      flag: market.flag,
      status: 'open',
      statusLabel: '24/7 개장',
      timeLabel: '',
    };
  }

  const { hours, minutes, dayOfWeek } = getLocalTime(now, market.timezone);
  const currentMin = hours * 60 + minutes;
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // 주말 마감
  if (market.weekendClosed && isWeekend) {
    // 월요일 개장까지 남은 시간 대략 계산
    const daysUntilMon = dayOfWeek === 6 ? 2 : 1;
    const openMin = timeToMinutes(market.regularOpen);
    const remainMin = (daysUntilMon * 24 * 60) - currentMin + openMin;
    return {
      id: market.id,
      name: market.name,
      flag: market.flag,
      status: 'closed',
      statusLabel: '마감 (주말)',
      timeLabel: `개장까지 ${formatMinuteDiff(remainMin)}`,
    };
  }

  const openMin = timeToMinutes(market.regularOpen);
  const closeMin = timeToMinutes(market.regularClose);

  // 정규장 개장 중
  if (currentMin >= openMin && currentMin < closeMin) {
    const remain = closeMin - currentMin;
    return {
      id: market.id,
      name: market.name,
      flag: market.flag,
      status: 'open',
      statusLabel: '개장 중',
      timeLabel: `마감까지 ${formatMinuteDiff(remain)}`,
    };
  }

  // 프리마켓
  if (market.preMarketOpen) {
    const preOpen = timeToMinutes(market.preMarketOpen);
    if (currentMin >= preOpen && currentMin < openMin) {
      const remain = openMin - currentMin;
      return {
        id: market.id,
        name: market.name,
        flag: market.flag,
        status: 'pre_market',
        statusLabel: '프리마켓',
        timeLabel: `정규장까지 ${formatMinuteDiff(remain)}`,
      };
    }
  }

  // 애프터마켓
  if (market.afterMarketClose) {
    const afterClose = timeToMinutes(market.afterMarketClose);
    if (currentMin >= closeMin && currentMin < afterClose) {
      const remain = afterClose - currentMin;
      return {
        id: market.id,
        name: market.name,
        flag: market.flag,
        status: 'after_market',
        statusLabel: '애프터마켓',
        timeLabel: `종료까지 ${formatMinuteDiff(remain)}`,
      };
    }
  }

  // 마감
  // 다음 세션 시작까지 남은 시간 계산
  let nextSessionMin: number;
  if (market.preMarketOpen) {
    nextSessionMin = timeToMinutes(market.preMarketOpen);
  } else {
    nextSessionMin = openMin;
  }

  let remain: number;
  if (currentMin >= closeMin) {
    // 오늘 마감 후 → 내일 개장까지
    remain = (24 * 60 - currentMin) + nextSessionMin;
  } else {
    // 오늘 개장 전
    remain = nextSessionMin - currentMin;
  }

  return {
    id: market.id,
    name: market.name,
    flag: market.flag,
    status: 'closed',
    statusLabel: '마감',
    timeLabel: `개장까지 ${formatMinuteDiff(remain)}`,
  };
}

/** 모든 시장 상태를 계산한다 */
export function getAllMarketStatuses(now?: Date): MarketStatus[] {
  const current = now ?? new Date();
  return MARKETS.map((m) => getMarketStatus(m, current));
}

/** 상태별 색상 dot 클래스 */
export function getStatusDotColor(status: MarketStatusType): string {
  switch (status) {
    case 'open': return 'bg-emerald-400';
    case 'pre_market': return 'bg-yellow-400';
    case 'after_market': return 'bg-yellow-400';
    case 'closed': return 'bg-red-400';
  }
}

/** 상태별 텍스트 색상 */
export function getStatusTextColor(status: MarketStatusType): string {
  switch (status) {
    case 'open': return 'text-emerald-400';
    case 'pre_market': return 'text-yellow-400';
    case 'after_market': return 'text-yellow-400';
    case 'closed': return 'text-red-400';
  }
}
