// lib/api/news.ts - 뉴스 데이터 fetch 로직
// v1.0.0 | 2026-02-17

import type { NewsItem, NewsCategory } from '../types';

/** Finnhub 뉴스 카테고리를 내부 카테고리로 매핑 */
function mapCategory(category: string): NewsCategory {
  const lower = category.toLowerCase();
  if (lower.includes('crypto') || lower.includes('bitcoin')) return 'crypto';
  if (lower.includes('forex') || lower.includes('commodity') || lower.includes('oil') || lower.includes('gold')) return 'commodity';
  if (lower.includes('economy') || lower.includes('economic')) return 'economy';
  if (lower.includes('fed') || lower.includes('fomc') || lower.includes('policy') || lower.includes('central bank')) return 'fed_policy';
  return 'market';
}

interface FinnhubNewsItem {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number;
  category: string;
  image: string;
  related?: string;
}

/** Finnhub에서 시장 뉴스를 가져온다 */
async function fetchFinnhubNews(): Promise<NewsItem[]> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return [];
  }

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`
    );

    if (!res.ok) {
      console.error('[News] Finnhub 응답 에러:', res.status);
      return [];
    }

    const data: FinnhubNewsItem[] = await res.json();

    return data.slice(0, 30).map((item) => ({
      id: `finnhub-${item.id}`,
      headline: item.headline,
      summary: item.summary?.slice(0, 200) ?? '',
      source: item.source,
      url: item.url,
      publishedAt: new Date(item.datetime * 1000).toISOString(),
      category: mapCategory(item.category ?? item.related ?? ''),
      imageUrl: item.image || undefined,
    }));
  } catch (error) {
    console.error('[News] Finnhub 뉴스 로드 실패:', error);
    return [];
  }
}

/** CryptoPanic에서 크립토 뉴스를 가져온다 */
async function fetchCryptoNews(): Promise<NewsItem[]> {
  const apiKey = process.env.CRYPTOPANIC_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(
      `https://cryptopanic.com/api/v1/posts/?auth_token=${apiKey}&public=true&kind=news&filter=hot`
    );

    if (!res.ok) return [];

    const data = await res.json();
    const posts = data.results ?? [];

    return posts.slice(0, 10).map((item: { id: number; title: string; url: string; source: { title: string }; published_at: string }) => ({
      id: `crypto-${item.id}`,
      headline: item.title,
      summary: '',
      source: item.source?.title ?? 'CryptoPanic',
      url: item.url,
      publishedAt: item.published_at,
      category: 'crypto' as NewsCategory,
    }));
  } catch (error) {
    console.error('[News] CryptoPanic 뉴스 로드 실패:', error);
    return [];
  }
}

/** 전체 뉴스 데이터를 가져온다 */
export async function fetchAllNews(): Promise<NewsItem[]> {
  const [finnhubNews, cryptoNews] = await Promise.all([
    fetchFinnhubNews(),
    fetchCryptoNews(),
  ]);

  // 두 소스 합치고 시간순 정렬
  const allNews = [...finnhubNews, ...cryptoNews];

  if (allNews.length === 0) {
    return getMockNewsData();
  }

  allNews.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  // 중복 제거 (같은 헤드라인)
  const seen = new Set<string>();
  return allNews.filter((item) => {
    const key = item.headline.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** API 키 없을 때 Mock 데이터 */
function getMockNewsData(): NewsItem[] {
  const now = Date.now();
  return [
    {
      id: 'mock-1',
      headline: 'Fed Signals Potential Rate Cut in Coming Months',
      summary: 'Federal Reserve officials hinted at possible rate cuts as inflation shows signs of cooling down.',
      source: 'Reuters',
      url: 'https://reuters.com',
      publishedAt: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
      category: 'fed_policy',
    },
    {
      id: 'mock-2',
      headline: 'S&P 500 Hits New All-Time High Amid Tech Rally',
      summary: 'Major tech stocks drove the index to record levels as earnings beat expectations.',
      source: 'CNBC',
      url: 'https://cnbc.com',
      publishedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      category: 'market',
    },
    {
      id: 'mock-3',
      headline: 'Bitcoin Surges Past $100K on Institutional Demand',
      summary: 'Institutional investors continue to pour money into Bitcoin ETFs.',
      source: 'CoinDesk',
      url: 'https://coindesk.com',
      publishedAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      category: 'crypto',
    },
    {
      id: 'mock-4',
      headline: 'Gold Prices Rise as Dollar Weakens',
      summary: 'Gold futures climbed as the US dollar index declined following economic data release.',
      source: 'Bloomberg',
      url: 'https://bloomberg.com',
      publishedAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
      category: 'commodity',
    },
    {
      id: 'mock-5',
      headline: 'US GDP Growth Exceeds Expectations at 3.2%',
      summary: 'The US economy grew at a faster-than-expected pace in the latest quarter.',
      source: 'WSJ',
      url: 'https://wsj.com',
      publishedAt: new Date(now - 8 * 60 * 60 * 1000).toISOString(),
      category: 'economy',
    },
    {
      id: 'mock-6',
      headline: 'Oil Prices Surge on OPEC+ Supply Cut Extension',
      summary: 'OPEC+ members agreed to extend production cuts, pushing crude oil prices higher.',
      source: 'Reuters',
      url: 'https://reuters.com',
      publishedAt: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
      category: 'commodity',
    },
  ];
}
