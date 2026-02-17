// lib/api/openai-translate.ts - OpenAI gpt-4o-mini 폴백 번역
// v1.0.0 | 2026-02-17

interface OpenAIResult {
  translatedHeadline: string;
  koreanSummary: string;
}

/** OpenAI gpt-4o-mini로 뉴스를 한국어 번역/요약한다 (Gemini 실패 시 폴백) */
export async function translateWithOpenAI(
  headline: string,
  summary: string,
  articleText?: string | null,
): Promise<OpenAIResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY 미설정');
  }

  const content = articleText
    ? `제목: ${headline}\n요약: ${summary}\n본문: ${articleText.slice(0, 3000)}`
    : `제목: ${headline}\n요약: ${summary}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            '당신은 금융/투자 뉴스 전문 번역가입니다. 항상 JSON 형식으로만 응답합니다.',
        },
        {
          role: 'user',
          content: `아래 영어 뉴스를 한국어로 번역하고 요약해주세요.

${content}

다음 JSON 형식으로 응답:
{
  "translatedHeadline": "번역된 제목",
  "koreanSummary": "한국어 3줄 요약. 투자자 관점에서 핵심만 간결하게. 각 문장은 마침표로 끝냅니다."
}`,
        },
      ],
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API 오류: ${res.status}`);
  }

  const data = await res.json();
  const text: string | undefined = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error('OpenAI 응답에 텍스트 없음');
  }

  return JSON.parse(text) as OpenAIResult;
}
