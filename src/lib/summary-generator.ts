// lib/summary-generator.ts - 템플릿 기반 시장 요약 생성
// v1.0.0 | 2026-02-17

import type { AssetData, EconomicEvent, FearGreedData, MarketSummaryData } from './types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';

/** 변동률에 따른 표현 */
function describeTrend(percent: number): string {
  const abs = Math.abs(percent);
  if (abs >= 3) return percent > 0 ? '급등' : '급락';
  if (abs >= 1) return percent > 0 ? '큰 폭 상승' : '큰 폭 하락';
  if (abs >= 0.5) return percent > 0 ? '상승' : '하락';
  if (abs >= 0.1) return percent > 0 ? '소폭 상승' : '소폭 하락';
  return '보합';
}

/** 시장 전반 방향 판단 */
function getOverallTrend(sp500: AssetData | undefined, nasdaq: AssetData | undefined): string {
  if (!sp500 || !nasdaq) return '데이터 수집 중';

  const bothUp = sp500.changePercent > 0.1 && nasdaq.changePercent > 0.1;
  const bothDown = sp500.changePercent < -0.1 && nasdaq.changePercent < -0.1;

  if (bothUp) return '상승세';
  if (bothDown) return '하락세';
  if (Math.abs(sp500.changePercent) < 0.1 && Math.abs(nasdaq.changePercent) < 0.1) return '보합세';
  return '혼조세';
}

/** 한국어 조사 (은/는) — 받침 유무로 판단 */
function postfix(name: string, withFinal: string, withoutFinal: string): string {
  const lastChar = name.charAt(name.length - 1);
  const code = lastChar.charCodeAt(0);
  // 한글 유니코드 범위 체크 후 받침 유무 판단
  if (code >= 0xAC00 && code <= 0xD7A3) {
    return ((code - 0xAC00) % 28 !== 0) ? withFinal : withoutFinal;
  }
  // 숫자/영문 끝: 간단 매핑
  return withoutFinal;
}

/** 가격 포맷 */
function fmtPrice(asset: AssetData): string {
  if (asset.category === 'forex' && asset.symbol === 'USDKRW') {
    return `₩${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${asset.price.toLocaleString('en-US', { minimumFractionDigits: asset.price >= 100 ? 0 : 2, maximumFractionDigits: asset.price >= 100 ? 0 : 2 })}`;
}

/** 변동률 포맷 */
function fmtChange(asset: AssetData): string {
  const sign = asset.changePercent >= 0 ? '+' : '';
  return `${sign}${asset.changePercent.toFixed(2)}%`;
}

/** 이번 주 내 날짜인지 확인 */
function isThisWeek(dateStr: string): boolean {
  const now = new Date();
  const target = new Date(dateStr);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return target >= startOfWeek && target < endOfWeek;
}

/** 요약 텍스트 생성 */
export function generateSummary(
  markets: AssetData[],
  events: EconomicEvent[],
  fearGreed: FearGreedData | null,
): MarketSummaryData {
  const kstNow = toZonedTime(new Date(), 'Asia/Seoul');
  const dateStr = format(kstNow, 'M/d (EEE)', { locale: ko });

  const sp500 = markets.find((m) => m.symbol === 'SPX');
  const nasdaq = markets.find((m) => m.symbol === 'NDX');
  const btc = markets.find((m) => m.symbol === 'BTC');
  const gold = markets.find((m) => m.symbol === 'GOLD');
  const oil = markets.find((m) => m.symbol === 'OIL');
  const usdkrw = markets.find((m) => m.symbol === 'USDKRW');

  const trend = getOverallTrend(sp500, nasdaq);

  // 1. 미국 증시 요약
  let text = '';
  if (sp500 && nasdaq) {
    text += `미국 증시는 S&P 500 ${fmtChange(sp500)}, 나스닥 ${fmtChange(nasdaq)}으로 ${trend}를 보이고 있습니다. `;
  }

  // 2. 주요 자산 변동 (BTC, 금, 원유 중 변동폭 큰 순서)
  const movers = [btc, gold, oil].filter(Boolean) as AssetData[];
  movers.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));

  for (const asset of movers.slice(0, 2)) {
    const trendWord = describeTrend(asset.changePercent);
    const subj = postfix(asset.nameKo, '은', '는');
    text += `${asset.nameKo}${subj} ${fmtPrice(asset)} (${fmtChange(asset)})로 ${trendWord}, `;
  }
  // 마지막 콤마를 마침표로 교체
  if (text.endsWith(', ')) {
    text = text.slice(0, -2) + '했습니다. ';
  }

  // 3. 환율
  if (usdkrw) {
    text += `달러/원 환율은 ${fmtPrice(usdkrw)} (${fmtChange(usdkrw)})입니다.`;
  }

  // 이번 주 HIGH 중요도 일정
  const highEvents = events
    .filter((e) => e.impact === 'high' && isThisWeek(e.datetime))
    .slice(0, 3);

  let eventsText = '';
  if (highEvents.length > 0) {
    const names = highEvents.map((e) => {
      const d = format(toZonedTime(new Date(e.datetime), 'Asia/Seoul'), 'M/d', { locale: ko });
      return `${e.nameKo} (${d})`;
    });
    eventsText = `이번 주 주요 일정: ${names.join(', ')}`;
  }

  // 시장 심리
  let sentimentText = '';
  if (fearGreed) {
    const mood =
      fearGreed.value >= 75
        ? '시장 심리가 매우 낙관적입니다.'
        : fearGreed.value >= 55
          ? '시장 심리가 낙관적입니다.'
          : fearGreed.value >= 45
            ? '시장 심리가 중립적입니다.'
            : fearGreed.value >= 25
              ? '시장 심리가 위축되어 있습니다.'
              : '시장에 극심한 공포가 감지됩니다.';
    sentimentText = `공포/탐욕 지수: ${fearGreed.value} (${fearGreed.labelKo}) — ${mood}`;
  }

  return {
    text: text.trim(),
    events: eventsText,
    sentiment: sentimentText,
    date: dateStr,
  };
}
