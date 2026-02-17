// lib/constants.ts - 상수 정의
// v1.0.0 | 2026-02-17

import type { AssetCategory, NewsCategory, Impact } from './types';

// 자산 목록 정의
export interface AssetConfig {
  symbol: string;
  yahooSymbol: string;
  name: string;
  nameKo: string;
  category: AssetCategory;
}

export const ASSETS: AssetConfig[] = [
  // 미국 주식 지수
  { symbol: 'SPX', yahooSymbol: '^GSPC', name: 'S&P 500', nameKo: 'S&P 500', category: 'stock_index' },
  { symbol: 'NDX', yahooSymbol: '^IXIC', name: 'NASDAQ', nameKo: '나스닥', category: 'stock_index' },
  { symbol: 'DJI', yahooSymbol: '^DJI', name: 'DOW 30', nameKo: '다우 30', category: 'stock_index' },
  { symbol: 'VIX', yahooSymbol: '^VIX', name: 'VIX', nameKo: '공포지수', category: 'stock_index' },

  // 암호화폐 (CoinGecko용 ID)
  { symbol: 'BTC', yahooSymbol: 'BTC-USD', name: 'Bitcoin', nameKo: '비트코인', category: 'crypto' },
  { symbol: 'ETH', yahooSymbol: 'ETH-USD', name: 'Ethereum', nameKo: '이더리움', category: 'crypto' },
  { symbol: 'ETHBTC', yahooSymbol: '', name: 'ETH/BTC', nameKo: 'ETH/BTC', category: 'crypto' },
  { symbol: 'BTC.D', yahooSymbol: '', name: 'BTC Dominance', nameKo: 'BTC 도미넌스', category: 'crypto' },
  { symbol: 'USDT.D', yahooSymbol: '', name: 'USDT Dominance', nameKo: 'USDT 도미넌스', category: 'crypto' },
  { symbol: 'KIMP', yahooSymbol: '', name: 'Tether Kimchi Premium', nameKo: '테더 김프', category: 'crypto' },
  { symbol: 'CBP', yahooSymbol: '', name: 'Coinbase Premium', nameKo: '코베 프리미엄', category: 'crypto' },

  // 원자재
  { symbol: 'GOLD', yahooSymbol: 'GC=F', name: 'Gold', nameKo: '금', category: 'commodity' },
  { symbol: 'SILVER', yahooSymbol: 'SI=F', name: 'Silver', nameKo: '은', category: 'commodity' },
  { symbol: 'OIL', yahooSymbol: 'CL=F', name: 'Crude Oil WTI', nameKo: '원유(WTI)', category: 'commodity' },

  // 환율
  { symbol: 'USDKRW', yahooSymbol: 'KRW=X', name: 'USD/KRW', nameKo: '달러/원', category: 'forex' },
  { symbol: 'EURUSD', yahooSymbol: 'EURUSD=X', name: 'EUR/USD', nameKo: '유로/달러', category: 'forex' },
  { symbol: 'USDJPY', yahooSymbol: 'JPY=X', name: 'USD/JPY', nameKo: '달러/엔', category: 'forex' },
  { symbol: 'DXY', yahooSymbol: 'DX-Y.NYB', name: 'DXY', nameKo: '달러 인덱스', category: 'forex' },

  // 채권
  { symbol: 'US10Y', yahooSymbol: '^TNX', name: 'US 10Y Yield', nameKo: '미국 10년 국채', category: 'bond' },
  { symbol: 'US2Y', yahooSymbol: '^IRX', name: 'US 2Y Yield', nameKo: '미국 2년 국채', category: 'bond' },
];

// CoinGecko 매핑
export const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
};

// 카테고리 라벨
export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  stock_index: '주식 지수',
  crypto: '암호화폐',
  commodity: '원자재',
  forex: '환율',
  bond: '채권',
};

// 뉴스 카테고리 라벨
export const NEWS_CATEGORY_LABELS: Record<NewsCategory, string> = {
  market: '시장',
  economy: '경제',
  crypto: '암호화폐',
  commodity: '원자재',
  fed_policy: '연준/정책',
};

// 중요도 라벨
export const IMPACT_LABELS: Record<Impact, string> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
};

// 캐시 TTL (밀리초)
export const CACHE_TTL = {
  MARKETS: 5 * 60 * 1000,         // 5분
  MARKETS_CLOSED: 30 * 60 * 1000, // 30분 (장 마감 후)
  CALENDAR: 60 * 60 * 1000,       // 1시간
  NEWS: 15 * 60 * 1000,           // 15분
  FEAR_GREED: 60 * 60 * 1000,     // 1시간 (하루 1회 업데이트)
  SUMMARY: 10 * 60 * 1000,        // 10분
  NEWS_SUMMARY: 24 * 60 * 60 * 1000, // 24시간 (번역/요약 캐시)
} as const;

// React Query 설정
export const QUERY_CONFIG = {
  MARKETS: {
    staleTime: 3 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  },
  CALENDAR: {
    staleTime: 30 * 60 * 1000,
    refetchInterval: 60 * 60 * 1000,
  },
  NEWS: {
    staleTime: 10 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  },
  FEAR_GREED: {
    staleTime: 30 * 60 * 1000,
    refetchInterval: 60 * 60 * 1000,
  },
  SUMMARY: {
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  },
} as const;

// API 엔드포인트
export const API_ENDPOINTS = {
  MARKETS: '/api/markets',
  CALENDAR: '/api/calendar',
  NEWS: '/api/news',
  FEAR_GREED: '/api/fear-greed',
  SUMMARY: '/api/summary',
  NEWS_SUMMARIZE: '/api/news/summarize',
} as const;
