// lib/api/gemini.ts - Gemini 2.0 Flash API 호출
// v1.0.0 | 2026-02-17

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface GeminiResult {
  translatedHeadline: string;
  koreanSummary: string;
}

/** Gemini Flash로 뉴스를 한국어 번역/요약한다 */
export async function translateWithGemini(
  headline: string,
  summary: string,
  articleText?: string | null,
): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY 미설정');
  }

  const content = articleText
    ? `제목: ${headline}\n요약: ${summary}\n본문: ${articleText.slice(0, 3000)}`
    : `제목: ${headline}\n요약: ${summary}`;

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `당신은 금융/투자 뉴스 전문 번역가입니다.

아래 영어 뉴스를 한국어로 번역하고 요약해주세요.

${content}

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "translatedHeadline": "번역된 제목",
  "koreanSummary": "한국어 3줄 요약. 투자자 관점에서 핵심만 간결하게. 각 문장은 마침표로 끝냅니다."
}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500,
      },
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`Gemini API 오류: ${res.status}`);
  }

  const data = await res.json();
  const text: string | undefined =
    data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Gemini 응답에 텍스트 없음');
  }

  // JSON 파싱 (```json 래핑 제거)
  const cleaned = text.replace(/```json\n?|```\n?/g, '').trim();
  return JSON.parse(cleaned) as GeminiResult;
}
