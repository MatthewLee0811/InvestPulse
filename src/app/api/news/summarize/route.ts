// app/api/news/summarize/route.ts - 뉴스 번역/요약 API
// v1.0.0 | 2026-02-17

import { NextResponse } from 'next/server';
import { translateWithGemini } from '@/lib/api/gemini';
import { translateWithOpenAI } from '@/lib/api/openai-translate';
import { getCachedData, setCachedData } from '@/lib/cache';
import { CACHE_TTL } from '@/lib/constants';

interface SummarizeRequest {
  newsId: string;
  headline: string;
  summary: string;
  url: string;
}

interface CachedSummary {
  translatedHeadline: string;
  koreanSummary: string;
  provider: 'gemini' | 'openai';
}

/** HTML에서 본문 텍스트를 추출한다 (간단한 방식) */
function extractMainText(html: string): string {
  // <script>, <style> 제거
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  // <article> 태그 내용 우선 추출
  const articleMatch = text.match(/<article[\s\S]*?>([\s\S]*?)<\/article>/i);
  if (articleMatch) {
    text = articleMatch[1];
  }

  // <p> 태그 내용만 추출
  const paragraphs: string[] = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = pRegex.exec(text)) !== null) {
    const clean = match[1].replace(/<[^>]+>/g, '').trim();
    if (clean.length > 30) {
      paragraphs.push(clean);
    }
  }

  return paragraphs.join('\n').slice(0, 3000);
}

/** 뉴스 원문 가져오기 (선택적, 실패해도 OK) */
async function fetchArticleText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const html = await res.text();
    const text = extractMainText(html);
    return text.length > 50 ? text : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body: SummarizeRequest = await request.json();
    const { newsId, headline, summary, url } = body;

    if (!newsId || !headline) {
      return NextResponse.json(
        { success: false, error: '필수 파라미터 누락' },
        { status: 400 },
      );
    }

    // 1. 캐시 확인
    const cacheKey = `news-summary:${newsId}`;
    const cached = getCachedData<CachedSummary>(cacheKey, CACHE_TTL.NEWS_SUMMARY);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: { ...cached, cached: true },
      });
    }

    // 2. 원문 가져오기 (선택적)
    let articleText: string | null = null;
    try {
      articleText = await fetchArticleText(url);
    } catch {
      // 무시
    }

    // 3. Gemini Flash 시도
    let result: { translatedHeadline: string; koreanSummary: string };
    let provider: 'gemini' | 'openai' = 'gemini';

    const hasGemini = !!process.env.GEMINI_API_KEY;
    const hasOpenAI = !!process.env.OPENAI_API_KEY;

    if (!hasGemini && !hasOpenAI) {
      return NextResponse.json(
        { success: false, error: 'AI API 키가 설정되지 않았습니다.' },
        { status: 503 },
      );
    }

    try {
      if (hasGemini) {
        result = await translateWithGemini(headline, summary, articleText);
      } else {
        // Gemini 키 없으면 바로 OpenAI
        result = await translateWithOpenAI(headline, summary, articleText);
        provider = 'openai';
      }
    } catch (geminiError) {
      console.error('[Summarize] Gemini 실패, OpenAI 폴백:', geminiError);

      if (!hasOpenAI) {
        return NextResponse.json(
          { success: false, error: '번역 서비스를 일시적으로 사용할 수 없습니다.' },
          { status: 503 },
        );
      }

      // 4. OpenAI 폴백
      try {
        result = await translateWithOpenAI(headline, summary, articleText);
        provider = 'openai';
      } catch (openaiError) {
        console.error('[Summarize] OpenAI도 실패:', openaiError);
        return NextResponse.json(
          { success: false, error: '번역 서비스를 일시적으로 사용할 수 없습니다.' },
          { status: 503 },
        );
      }
    }

    // 5. 캐시 저장 + 반환
    const cacheData: CachedSummary = { ...result, provider };
    setCachedData(cacheKey, cacheData);

    return NextResponse.json({
      success: true,
      data: { ...cacheData, cached: false },
    });
  } catch (error) {
    console.error('[Summarize] 에러:', error);
    return NextResponse.json(
      { success: false, error: '요약 처리 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
