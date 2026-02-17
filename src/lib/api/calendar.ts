// lib/api/calendar.ts - 경제 일정 fetch 로직
// v1.0.0 | 2026-02-17

import type { EconomicEvent } from '../types';

// 주요 경제 지표 한글 매핑
const EVENT_NAME_MAP: Record<string, string> = {
  'CPI': '소비자물가지수',
  'Consumer Price Index': '소비자물가지수',
  'PPI': '생산자물가지수',
  'Producer Price Index': '생산자물가지수',
  'Core PCE': '핵심 개인소비지출',
  'PCE Price Index': '개인소비지출 물가지수',
  'Non-Farm Payrolls': '비농업 고용지수',
  'Nonfarm Payrolls': '비농업 고용지수',
  'Unemployment Rate': '실업률',
  'Initial Jobless Claims': '신규 실업수당 청구건수',
  'FOMC': 'FOMC 금리 결정',
  'Federal Funds Rate': 'FOMC 금리 결정',
  'FOMC Minutes': 'FOMC 의사록',
  'GDP': 'GDP 성장률',
  'Gross Domestic Product': 'GDP 성장률',
  'ISM Manufacturing PMI': 'ISM 제조업 PMI',
  'ISM Services PMI': 'ISM 서비스업 PMI',
  'ISM Non-Manufacturing PMI': 'ISM 서비스업 PMI',
  'Consumer Confidence': '소비자 신뢰지수',
  'CB Consumer Confidence': '소비자 신뢰지수',
  'Michigan Consumer Sentiment': '미시간 소비자심리지수',
  'Retail Sales': '소매판매',
  'Fed Chair': '연준 의장 연설',
  'Fed Speech': '연준 이사 연설',
  'Durable Goods Orders': '내구재 주문',
  'Housing Starts': '주택착공건수',
  'Existing Home Sales': '기존 주택 판매',
  'Industrial Production': '산업생산',
  'Empire State Manufacturing': '엠파이어스테이트 제조업지수',
  'Philadelphia Fed Manufacturing': '필라델피아 연은 제조업지수',
};

/** 이벤트 이름에서 한글명 추출 */
function getKoreanName(name: string): string {
  for (const [key, value] of Object.entries(EVENT_NAME_MAP)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  return name;
}

/** 이벤트 중요도 판정 */
function determineImpact(event: { impact?: string; name?: string }): 'high' | 'medium' | 'low' {
  if (event.impact === 'high' || event.impact === '3') return 'high';
  if (event.impact === 'medium' || event.impact === '2') return 'medium';
  if (event.impact === 'low' || event.impact === '1') return 'low';

  // 이름으로 판정
  const name = (event.name ?? '').toLowerCase();
  const highImpact = ['cpi', 'ppi', 'nonfarm', 'non-farm', 'fomc', 'gdp', 'unemployment rate', 'pce'];
  const mediumImpact = ['ism', 'retail sales', 'consumer confidence', 'jobless claims', 'durable goods'];

  if (highImpact.some((k) => name.includes(k))) return 'high';
  if (mediumImpact.some((k) => name.includes(k))) return 'medium';
  return 'low';
}

/** Finnhub 경제 캘린더 API에서 데이터를 가져온다 */
export async function fetchEconomicCalendar(
  from: string,
  to: string
): Promise<EconomicEvent[]> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    console.error('[Calendar] FINNHUB_API_KEY가 설정되지 않음');
    return getMockCalendarData(from, to);
  }

  try {
    const url = `https://finnhub.io/api/v1/calendar/economic?from=${from}&to=${to}&token=${apiKey}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.error('[Calendar] Finnhub 응답 에러:', res.status);
      return getMockCalendarData(from, to);
    }

    const json = await res.json();
    const events = json.economicCalendar ?? [];

    // 미국 이벤트만 필터링하고 중요도 높은 것 우선
    const usEvents = events
      .filter((e: Record<string, string>) => e.country === 'US')
      .map((e: Record<string, string>, idx: number): EconomicEvent => ({
        id: `finnhub-${idx}-${e.event}`,
        name: e.event ?? '',
        nameKo: getKoreanName(e.event ?? ''),
        datetime: e.time
          ? `${e.date}T${e.time}:00Z`
          : `${e.date}T00:00:00Z`,
        country: 'US',
        impact: determineImpact({ impact: e.impact, name: e.event }),
        actual: e.actual !== undefined && e.actual !== null ? String(e.actual) : undefined,
        forecast: e.estimate !== undefined && e.estimate !== null ? String(e.estimate) : undefined,
        previous: e.prev !== undefined && e.prev !== null ? String(e.prev) : undefined,
        unit: e.unit ?? '',
      }))
      .sort((a: EconomicEvent, b: EconomicEvent) => {
        const impactOrder = { high: 0, medium: 1, low: 2 };
        const timeDiff = new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
        if (timeDiff !== 0) return timeDiff;
        return impactOrder[a.impact] - impactOrder[b.impact];
      });

    return usEvents;
  } catch (error) {
    console.error('[Calendar] 경제 일정 로드 실패:', error);
    return getMockCalendarData(from, to);
  }
}

/** API 키 없을 때 날짜 범위 기반 Mock 데이터 */
function getMockCalendarData(from: string, to: string): EconomicEvent[] {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  // 전체 Mock 일정 풀 (월 기준으로 다양한 날짜에 배치)
  const allMockEvents: Omit<EconomicEvent, 'id' | 'datetime'>[] = [
    { name: 'ISM Manufacturing PMI', nameKo: 'ISM 제조업 PMI', country: 'US', impact: 'high', actual: '49.2', forecast: '49.5', previous: '49.3' },
    { name: 'JOLTS Job Openings', nameKo: '구인건수(JOLTS)', country: 'US', impact: 'medium', forecast: '8.85M', previous: '8.79M' },
    { name: 'ADP Nonfarm Employment', nameKo: 'ADP 비농업 고용', country: 'US', impact: 'medium', forecast: '150K', previous: '143K' },
    { name: 'ISM Services PMI', nameKo: 'ISM 서비스업 PMI', country: 'US', impact: 'high', forecast: '53.0', previous: '52.8' },
    { name: 'Non-Farm Payrolls', nameKo: '비농업 고용지수', country: 'US', impact: 'high', forecast: '170K', previous: '256K' },
    { name: 'Unemployment Rate', nameKo: '실업률', country: 'US', impact: 'high', forecast: '4.1%', previous: '4.1%' },
    { name: 'Consumer Price Index (CPI)', nameKo: '소비자물가지수', country: 'US', impact: 'high', forecast: '3.1%', previous: '3.2%' },
    { name: 'Core CPI MoM', nameKo: '근원 소비자물가(MoM)', country: 'US', impact: 'high', forecast: '0.3%', previous: '0.2%' },
    { name: 'Initial Jobless Claims', nameKo: '신규 실업수당 청구건수', country: 'US', impact: 'medium', forecast: '215K', previous: '218K' },
    { name: 'Producer Price Index (PPI)', nameKo: '생산자물가지수', country: 'US', impact: 'high', forecast: '0.2%', previous: '0.2%' },
    { name: 'Retail Sales MoM', nameKo: '소매판매', country: 'US', impact: 'medium', forecast: '0.3%', previous: '0.4%' },
    { name: 'FOMC Rate Decision', nameKo: 'FOMC 금리 결정', country: 'US', impact: 'high', forecast: '4.50%', previous: '4.50%' },
    { name: 'FOMC Minutes', nameKo: 'FOMC 의사록', country: 'US', impact: 'high', previous: '-' },
    { name: 'GDP Growth Rate QoQ', nameKo: 'GDP 성장률', country: 'US', impact: 'high', forecast: '3.2%', previous: '3.1%' },
    { name: 'Core PCE Price Index', nameKo: '핵심 개인소비지출', country: 'US', impact: 'high', forecast: '2.8%', previous: '2.8%' },
    { name: 'CB Consumer Confidence', nameKo: '소비자 신뢰지수', country: 'US', impact: 'medium', forecast: '105.0', previous: '104.1' },
    { name: 'Michigan Consumer Sentiment', nameKo: '미시간 소비자심리지수', country: 'US', impact: 'medium', forecast: '71.7', previous: '71.1' },
    { name: 'Durable Goods Orders', nameKo: '내구재 주문', country: 'US', impact: 'medium', forecast: '-0.5%', previous: '-2.0%' },
    { name: 'Existing Home Sales', nameKo: '기존 주택 판매', country: 'US', impact: 'low', forecast: '4.20M', previous: '4.24M' },
    { name: 'Fed Chair Speech', nameKo: '연준 의장 연설', country: 'US', impact: 'high', previous: '-' },
  ];

  const times = ['13:30', '14:00', '15:00', '15:45', '19:00', '21:00'];
  const totalDays = Math.max(1, Math.round((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)));

  // 날짜 범위 내에 이벤트를 분산 배치
  const results: EconomicEvent[] = [];
  const eventsToUse = totalDays <= 7
    ? allMockEvents.slice(0, 8)   // 이번 주: 8개
    : totalDays <= 31
      ? allMockEvents.slice(0, 15) // 이번 달: 15개
      : allMockEvents;             // 다음 달: 전체

  eventsToUse.forEach((event, idx) => {
    const dayOffset = Math.round((idx / eventsToUse.length) * totalDays);
    const eventDate = new Date(fromDate);
    eventDate.setDate(eventDate.getDate() + dayOffset);
    const dateStr = eventDate.toISOString().split('T')[0];
    const time = times[idx % times.length];

    results.push({
      ...event,
      id: `mock-${from}-${idx}`,
      datetime: `${dateStr}T${time}:00Z`,
    });
  });

  return results.sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  );
}
