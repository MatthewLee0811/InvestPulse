// lib/types.ts - InvestPulse 핵심 타입 정의
// v1.0.0 | 2026-02-17

export interface AssetData {
  symbol: string;
  name: string;
  nameKo: string;
  category: 'stock_index' | 'crypto' | 'commodity' | 'forex' | 'bond';
  price: number;
  change: number;
  changePercent: number;
  sparkline: number[];
  updatedAt: string;
}

export interface EconomicEvent {
  id: string;
  name: string;
  nameKo: string;
  datetime: string;
  country: string;
  impact: 'high' | 'medium' | 'low';
  actual?: string;
  forecast?: string;
  previous?: string;
  unit?: string;
}

export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  category: 'market' | 'economy' | 'crypto' | 'commodity' | 'fed_policy';
  imageUrl?: string;
}

export interface MarketApiResponse {
  data: AssetData[];
  updatedAt: string;
}

export interface CalendarApiResponse {
  data: EconomicEvent[];
  updatedAt: string;
}

export interface NewsApiResponse {
  data: NewsItem[];
  updatedAt: string;
}

export type CalendarTab = 'this_week' | 'this_month' | 'next_month';
export type NewsTab = 'today' | 'this_week' | 'this_month';
export type AssetCategory = AssetData['category'];
export type NewsCategory = NewsItem['category'];
export type Impact = EconomicEvent['impact'];
