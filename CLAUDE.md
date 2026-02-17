# CLAUDE.md - InvestPulse 프로젝트 가이드

## 프로젝트 개요

InvestPulse는 투자자를 위한 올인원 대시보드 웹앱이다. 주요 자산 시세, 경제 지표 발표 일정, 투자 관련 뉴스를 한 화면에서 확인할 수 있다.

## 기술 스택

- **Framework**: Next.js 15 (App Router, TypeScript, Server Components 적극 활용)
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts 또는 lightweight-charts
- **Data Fetching**: TanStack Query (React Query) v5 - 클라이언트 캐싱 & 자동 리페칭
- **Date**: date-fns (한국 시간 KST 변환에 date-fns-tz 포함)
- **Icons**: Lucide React
- **Deployment**: Vercel

## 코딩 컨벤션

### 일반 규칙
- 모든 컴포넌트는 TypeScript로 작성하고 Props 타입을 명시한다
- `any` 타입 사용 금지. 반드시 구체적 타입 또는 `unknown` 사용
- 컴포넌트 파일명은 PascalCase, 유틸/훅은 camelCase
- import 순서: React/Next → 외부 라이브러리 → 내부 모듈 → 타입 → 스타일
- 매직 넘버 금지. `constants.ts`에 상수로 정의

### 컴포넌트 규칙
- Server Component가 기본. 클라이언트 상태/이벤트가 필요한 경우에만 `"use client"` 사용
- 컴포넌트 하나의 역할은 하나. 200줄 초과 시 분리 검토
- UI 컴포넌트(`/components/ui/`)는 비즈니스 로직 없이 순수 표현만 담당
- 로딩 상태는 반드시 Skeleton UI로 처리

### 데이터 페칭 규칙
- 외부 API 호출은 반드시 Route Handler(`/app/api/`)를 통해 서버에서 수행
- API 키는 절대 클라이언트에 노출하지 않는다
- 모든 API 응답은 서버 사이드에서 캐싱 (in-memory cache, 최소 5분)
- React Query의 `staleTime`, `refetchInterval`을 활용한 클라이언트 캐싱도 병행
- API 호출 실패 시 이전 캐시 데이터를 fallback으로 사용

### 에러 핸들링
- 모든 API Route에 try-catch 적용
- fetch 실패 시 의미있는 에러 메시지 반환 (status code + message)
- 클라이언트에서 에러 시 사용자 친화적 fallback UI 표시
- console.error로 디버그 정보 남기기

## API 전략

### 자산 시세 (Markets)
- **1순위**: yahoo-finance2 (npm 패키지, 키 불필요, 주식/지수/환율/원자재 커버)
- **크립토**: CoinGecko API (무료, 분당 10-30회 제한)
- **백업**: Alpha Vantage (일 25회), Twelve Data
- 캐시: 시세 데이터는 3-5분 캐시. 장 마감 후에는 30분까지 늘려도 됨

### 경제 일정 (Calendar)
- **1순위**: Finnhub 경제 캘린더 API (무료 API key 필요, 일 60회)
- **대안**: Trading Economics, Investing.com 비공식 API
- 캐시: 경제 일정은 1시간 캐시 (일정은 자주 안 바뀜)
- 시간대: 모든 시간을 UTC → KST로 변환하여 표시

### 뉴스 (News)
- **1순위**: Finnhub News API (무료)
- **크립토 뉴스**: CryptoPanic API (무료 tier)
- **대안**: NewsAPI.org (개발 환경에서만 무료), GNews API
- 캐시: 뉴스는 15-30분 캐시

### 캐시 구현 패턴
```typescript
// lib/cache.ts 패턴
const cache = new Map<string, { data: unknown; timestamp: number }>();

function getCachedData<T>(key: string, ttlMs: number): T | null { ... }
function setCachedData<T>(key: string, data: T): void { ... }
```

## 디자인 시스템

### 컬러 팔레트
```
--bg-primary: #0a0f1c       /* 메인 배경 */
--bg-card: #111827           /* 카드 배경 */
--bg-card-hover: #1f2937     /* 카드 호버 */
--border: #1f2937            /* 보더 */
--text-primary: #f9fafb      /* 주 텍스트 */
--text-secondary: #9ca3af    /* 보조 텍스트 */
--accent-blue: #3b82f6       /* 액센트 */
--accent-gold: #f59e0b       /* 골드 액센트 */
--positive: #10b981          /* 상승 */
--negative: #ef4444          /* 하락 */
--neutral: #6b7280           /* 보합 */
```

### 중요도 표시
- 🔴 High → `bg-red-500/20 text-red-400`
- 🟡 Medium → `bg-yellow-500/20 text-yellow-400`  
- 🟢 Low → `bg-green-500/20 text-green-400`

### 반응형 브레이크포인트
- Mobile: < 768px (카드 1열, 섹션 세로 스택)
- Tablet: 768px ~ 1024px (카드 2열, 하단 2컬럼)
- Desktop: > 1024px (카드 3-4열, 하단 2컬럼)

## 주요 타입 정의

```typescript
// lib/types.ts에 정의할 핵심 타입들

interface AssetData {
  symbol: string;
  name: string;
  nameKo: string;
  category: 'stock_index' | 'crypto' | 'commodity' | 'forex' | 'bond';
  price: number;
  change: number;
  changePercent: number;
  sparkline: number[];    // 7일 가격 배열
  updatedAt: string;      // ISO 8601
}

interface EconomicEvent {
  id: string;
  name: string;
  nameKo: string;
  datetime: string;       // KST ISO 8601
  country: string;
  impact: 'high' | 'medium' | 'low';
  actual?: number | string;
  forecast?: number | string;
  previous?: number | string;
  unit?: string;          // '%', 'K' 등
}

interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  category: 'market' | 'economy' | 'crypto' | 'commodity' | 'fed_policy';
  imageUrl?: string;
}
```

## 커맨드

```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# 린트
npm run lint

# 타입 체크
npx tsc --noEmit
```

## 환경 변수 (.env.local)

```
# 필수
FINNHUB_API_KEY=           # https://finnhub.io 에서 무료 발급
COINGECKO_API_KEY=         # https://www.coingecko.com/en/api (선택, 없어도 동작)

# 선택 (백업/추가 소스)
ALPHA_VANTAGE_API_KEY=     # https://www.alphavantage.co
NEWS_API_KEY=              # https://newsapi.org
CRYPTOPANIC_API_KEY=       # https://cryptopanic.com/developers/api/
```

## 배포 체크리스트

- [ ] 모든 API 키가 Vercel 환경 변수에 설정되었는가
- [ ] 빌드 에러 없는가 (`npm run build`)
- [ ] 타입 에러 없는가 (`npx tsc --noEmit`)
- [ ] 모바일 반응형 확인했는가
- [ ] API rate limit 초과하지 않는 캐시 전략이 적용되었는가
- [ ] 모든 외부 링크에 `rel="noopener noreferrer"` 적용되었는가
- [ ] 에러 상태에서 fallback UI가 정상 동작하는가
- [ ] KST 시간 변환이 정확한가

## 알려진 제약사항

- 무료 API는 실시간 데이터가 아닌 15분~1시간 지연 데이터일 수 있음
- Yahoo Finance 비공식 API는 언제든 변경/차단될 수 있으므로 fallback 필수
- NewsAPI 무료 플랜은 localhost에서만 동작 (프로덕션은 Finnhub 뉴스 사용)
- CoinGecko 무료 tier는 분당 10-30회 제한
