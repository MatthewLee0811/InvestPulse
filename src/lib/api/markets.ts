// lib/api/markets.ts - 시세 데이터 fetch 로직
// v1.1.0 | 2026-02-17

import YahooFinance from 'yahoo-finance2';
import { ASSETS, COINGECKO_IDS } from '../constants';
import type { AssetData } from '../types';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

interface YahooQuote {
  symbol?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  [key: string]: unknown;
}

interface YahooChartQuote {
  date: Date;
  close: number | null;
  [key: string]: unknown;
}

/** Yahoo Finance에서 시세 데이터를 가져온다 (yahooSymbol이 있는 자산만) */
async function fetchYahooQuotes(): Promise<Map<string, AssetData>> {
  const results = new Map<string, AssetData>();
  const yahooAssets = ASSETS.filter((a) => a.yahooSymbol !== '');

  const quotePromises = yahooAssets.map(async (assetConfig) => {
    try {
      const q = (await yahooFinance.quote(assetConfig.yahooSymbol)) as YahooQuote;
      if (!q) return;

      const price = q.regularMarketPrice ?? 0;
      const change = q.regularMarketChange ?? 0;
      const changePercent = q.regularMarketChangePercent ?? 0;

      results.set(assetConfig.symbol, {
        symbol: assetConfig.symbol,
        name: assetConfig.name,
        nameKo: assetConfig.nameKo,
        category: assetConfig.category,
        price,
        change,
        changePercent,
        sparkline: [],
        updatedAt: new Date().toISOString(),
      });
    } catch {
      // 개별 심볼 실패 무시
    }
  });

  try {
    await Promise.allSettled(quotePromises);
  } catch (error) {
    console.error('[Markets] Yahoo Finance 호출 실패:', error);
  }

  return results;
}

/** CoinGecko에서 BTC/USDT 도미넌스 데이터를 가져온다 */
async function fetchDominanceData(): Promise<Map<string, AssetData>> {
  const results = new Map<string, AssetData>();

  try {
    const apiKey = process.env.COINGECKO_API_KEY;
    const headers: Record<string, string> = { accept: 'application/json' };
    if (apiKey) {
      headers['x-cg-demo-api-key'] = apiKey;
    }

    const res = await fetch('https://api.coingecko.com/api/v3/global', { headers });
    if (!res.ok) return results;

    const json = await res.json();
    const pct = json.data?.market_cap_percentage;
    if (!pct) return results;

    const btcDom = pct.btc ?? 0;
    const usdtDom = pct.usdt ?? 0;

    const btcConfig = ASSETS.find((a) => a.symbol === 'BTC.D');
    const usdtConfig = ASSETS.find((a) => a.symbol === 'USDT.D');

    if (btcConfig) {
      results.set('BTC.D', {
        symbol: 'BTC.D',
        name: btcConfig.name,
        nameKo: btcConfig.nameKo,
        category: 'crypto',
        price: btcDom,
        change: 0,
        changePercent: 0,
        sparkline: [],
        updatedAt: new Date().toISOString(),
      });
    }
    if (usdtConfig) {
      results.set('USDT.D', {
        symbol: 'USDT.D',
        name: usdtConfig.name,
        nameKo: usdtConfig.nameKo,
        category: 'crypto',
        price: usdtDom,
        change: 0,
        changePercent: 0,
        sparkline: [],
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('[Markets] 도미넌스 데이터 로드 실패:', error);
  }

  return results;
}

/** 테더 김프 + 코인베이스 프리미엄을 계산한다 */
async function fetchPremiumData(
  yahooData: Map<string, AssetData>
): Promise<Map<string, AssetData>> {
  const results = new Map<string, AssetData>();
  const now = new Date().toISOString();

  // 테더 김프: 업비트 USDT/KRW vs 실제 USD/KRW
  try {
    const [upbitRes, usdKrw] = await Promise.all([
      fetch('https://api.upbit.com/v1/ticker?markets=KRW-USDT'),
      Promise.resolve(yahooData.get('USDKRW')?.price ?? 0),
    ]);

    if (upbitRes.ok && usdKrw > 0) {
      const upbitData = await upbitRes.json();
      const usdtKrw = upbitData[0]?.trade_price ?? 0;
      if (usdtKrw > 0) {
        const kimchiPremium = ((usdtKrw / usdKrw) - 1) * 100;
        const kimpConfig = ASSETS.find((a) => a.symbol === 'KIMP');
        if (kimpConfig) {
          results.set('KIMP', {
            symbol: 'KIMP',
            name: kimpConfig.name,
            nameKo: kimpConfig.nameKo,
            category: 'crypto',
            price: kimchiPremium,
            change: 0,
            changePercent: 0,
            sparkline: [],
            updatedAt: now,
          });
        }
      }
    }
  } catch (error) {
    console.error('[Markets] 테더 김프 계산 실패:', error);
  }

  // 코인베이스 프리미엄: Coinbase BTC vs Binance BTC
  try {
    const [coinbaseRes, binanceRes] = await Promise.all([
      fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot'),
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'),
    ]);

    if (coinbaseRes.ok && binanceRes.ok) {
      const coinbaseData = await coinbaseRes.json();
      const binanceData = await binanceRes.json();
      const cbPrice = parseFloat(coinbaseData.data?.amount ?? '0');
      const bnPrice = parseFloat(binanceData.price ?? '0');

      if (cbPrice > 0 && bnPrice > 0) {
        const cbPremium = ((cbPrice / bnPrice) - 1) * 100;
        const cbpConfig = ASSETS.find((a) => a.symbol === 'CBP');
        if (cbpConfig) {
          results.set('CBP', {
            symbol: 'CBP',
            name: cbpConfig.name,
            nameKo: cbpConfig.nameKo,
            category: 'crypto',
            price: cbPremium,
            change: 0,
            changePercent: 0,
            sparkline: [],
            updatedAt: now,
          });
        }
      }
    }
  } catch (error) {
    console.error('[Markets] 코인베이스 프리미엄 계산 실패:', error);
  }

  return results;
}

/** CoinGecko에서 암호화폐 데이터를 가져온다 */
async function fetchCryptoData(): Promise<Map<string, Partial<AssetData>>> {
  const results = new Map<string, Partial<AssetData>>();
  const ids = Object.values(COINGECKO_IDS).join(',');

  try {
    const apiKey = process.env.COINGECKO_API_KEY;
    const headers: Record<string, string> = { accept: 'application/json' };
    if (apiKey) {
      headers['x-cg-demo-api-key'] = apiKey;
    }

    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&sparkline=true&price_change_percentage=24h`,
      { headers }
    );

    if (!res.ok) {
      console.error('[Markets] CoinGecko 응답 에러:', res.status);
      return results;
    }

    const data = await res.json();

    for (const coin of data) {
      const symbol = Object.entries(COINGECKO_IDS).find(
        ([, id]) => id === coin.id
      )?.[0];
      if (!symbol) continue;

      results.set(symbol, {
        price: coin.current_price,
        change: coin.price_change_24h,
        changePercent: coin.price_change_percentage_24h,
        sparkline: coin.sparkline_in_7d?.price?.filter(
          (_: number, i: number) => i % 8 === 0
        ) ?? [],
      });
    }
  } catch (error) {
    console.error('[Markets] CoinGecko 호출 실패:', error);
  }

  return results;
}

/** Yahoo Finance에서 30일 히스토리 데이터를 가져와 sparkline을 생성한다 */
async function fetchSparklines(): Promise<Map<string, number[]>> {
  const results = new Map<string, number[]>();
  const nonCryptoAssets = ASSETS.filter((a) => a.category !== 'crypto' && a.yahooSymbol !== '');

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const sparkPromises = nonCryptoAssets.map(async (asset) => {
    try {
      const history = (await yahooFinance.chart(asset.yahooSymbol, {
        period1: startDate,
        period2: endDate,
        interval: '1d',
      })) as { quotes?: YahooChartQuote[] };

      const prices = history.quotes
        ?.map((q: YahooChartQuote) => q.close)
        .filter((p): p is number => p != null) ?? [];

      if (prices.length > 0) {
        results.set(asset.symbol, prices);
      }
    } catch {
      // sparkline 실패는 무시
    }
  });

  await Promise.allSettled(sparkPromises);
  return results;
}

/** 전체 시세 데이터를 조합하여 반환한다 */
export async function fetchAllMarkets(): Promise<AssetData[]> {
  const [yahooData, cryptoData, dominanceData, sparklines] = await Promise.all([
    fetchYahooQuotes(),
    fetchCryptoData(),
    fetchDominanceData(),
    fetchSparklines(),
  ]);

  // 도미넌스 데이터 병합
  for (const [symbol, data] of dominanceData) {
    yahooData.set(symbol, data);
  }

  // 프리미엄 데이터 (USD/KRW가 필요하므로 Yahoo 이후 호출)
  const premiumData = await fetchPremiumData(yahooData);
  for (const [symbol, data] of premiumData) {
    yahooData.set(symbol, data);
  }

  // CoinGecko 데이터로 암호화폐 보강
  for (const [symbol, cryptoInfo] of cryptoData) {
    const existing = yahooData.get(symbol);
    if (existing) {
      if (cryptoInfo.price != null) existing.price = cryptoInfo.price;
      if (cryptoInfo.change != null) existing.change = cryptoInfo.change;
      if (cryptoInfo.changePercent != null) existing.changePercent = cryptoInfo.changePercent;
      if (cryptoInfo.sparkline?.length) existing.sparkline = cryptoInfo.sparkline;
    }
  }

  // sparkline 데이터 병합
  for (const [symbol, prices] of sparklines) {
    const existing = yahooData.get(symbol);
    if (existing) {
      existing.sparkline = prices;
    }
  }

  // ASSETS 순서대로 정렬하여 반환
  const result: AssetData[] = [];
  for (const asset of ASSETS) {
    const data = yahooData.get(asset.symbol);
    if (data) {
      result.push(data);
    } else {
      // fallback: 빈 데이터
      result.push({
        symbol: asset.symbol,
        name: asset.name,
        nameKo: asset.nameKo,
        category: asset.category,
        price: 0,
        change: 0,
        changePercent: 0,
        sparkline: [],
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return result;
}
