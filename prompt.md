# 투자 대시보드 웹사이트 구축 프롬프트

## 프로젝트 개요

투자자를 위한 올인원 대시보드 웹사이트 "InvestPulse"를 만들어줘. 주요 자산 지표, 경제 일정, 투자 뉴스를 한 화면에서 볼 수 있는 대시보드야. Next.js 15 (App Router) + TypeScript 기반으로 만들고, 무료 API들을 활용해서 실시간에 가까운 데이터를 보여줘야 해.

## 핵심 기능 3가지

### 1. 주요 자산 지표 (Market Overview)

상단에 카드 형태로 주요 자산의 현재가, 변동률, 미니 차트를 보여줘.

**포함할 자산:**
- **미국 주식 지수**: S&P 500, NASDAQ, DOW 30, VIX (공포지수)
- **암호화폐**: Bitcoin (BTC), Ethereum (ETH), Solana (SOL)
- **원자재**: Gold, Silver, Crude Oil (WTI)
- **환율**: USD/KRW, EUR/USD, USD/JPY, DXY (달러 인덱스)
- **채권**: US 10Y Treasury Yield, US 2Y Treasury Yield (장단기 금리차도 표시)

각 자산 카드에 표시할 정보:
- 자산명 + 티커
- 현재가 (또는 최근 종가)
- 24시간/일간 변동률 (%, 색상으로 상승/하락 구분)
- 7일 미니 스파크라인 차트
- 마지막 업데이트 시간

### 2. 경제 일정 캘린더 (Economic Calendar)

탭 형태로 "이번 주 / 이번 달 / 다음 달" 전환 가능.

**포함할 주요 일정:**
- CPI (소비자물가지수)
- PPI (생산자물가지수)
- Core PCE (핵심 개인소비지출)
- Non-Farm Payrolls (비농업 고용지수)
- 실업률 (Unemployment Rate)
- 신규 실업수당 청구건수 (Initial Jobless Claims)
- FOMC 금리 결정 & 의사록 공개
- GDP 성장률
- ISM 제조업/서비스업 PMI
- 소비자 신뢰지수
- 소매판매
- 연준 의장/이사 연설

각 일정에 표시할 정보:
- 날짜 + 시간 (한국 시간 KST 변환)
- 지표명 (한글 + 영문)
- 중요도 (🔴 High / 🟡 Medium / 🟢 Low) - 별 또는 불릿 형태
- 이전 값 (Previous)
- 예측 값 (Forecast)
- 실제 값 (Actual) - 발표 후
- 예측 대비 결과 (Beat/Miss/Meet) 색상 표시

### 3. 투자 뉴스 피드 (News Feed)

탭 형태로 "오늘 / 이번 주 / 이번 달" 전환 가능.

**뉴스 카테고리:**
- Market (시장 전반)
- Economy (경제)
- Crypto (암호화폐)
- Commodities (원자재)
- Fed & Policy (연준/정책)

각 뉴스 항목:
- 헤드라인 (클릭 시 원문 링크로 이동, target="_blank")
- 출처 (Reuters, Bloomberg, CNBC, CoinDesk 등)
- 발행 시간 (상대 시간: "2시간 전", "어제" 등)
- 카테고리 태그
- 짧은 요약 (1-2줄)

## 기술 스택

```
Framework: Next.js 15 (App Router, TypeScript)
Styling: Tailwind CSS 4
차트: Recharts 또는 lightweight-charts (TradingView)
상태관리: React Query (TanStack Query) - 데이터 캐싱 & 리페칭
날짜: date-fns
아이콘: Lucide React
배포: Vercel
```

## 무료 API 전략

실제 구현 시 다음 무료 API들을 우선 검토하고, 각 API의 rate limit과 제약을 확인한 후 최적의 조합을 선택해:

**자산 시세:**
- Yahoo Finance (비공식 API 또는 yahoo-finance2 npm 패키지) - 주식, 지수, 환율, 원자재
- CoinGecko API (무료 tier) - 암호화폐
- Alpha Vantage (무료 API key, 일 25회 제한) - 백업용
- Twelve Data 또는 Financial Modeling Prep - 대안

**경제 일정:**
- Trading Economics API 또는 웹 스크래핑
- Investing.com 경제 캘린더 (비공식)
- FinnHub 경제 캘린더 API (무료 tier)

**뉴스:**
- NewsAPI.org (무료 tier, 일 100회)
- Finnhub News API
- CryptoPanic API (크립토 뉴스)
- GNews API

> ⚠️ 무료 API는 제한이 많으므로, 서버 사이드에서 캐싱(Redis 또는 in-memory)을 적극 활용하고, ISR(Incremental Static Regeneration) 또는 Route Handler + revalidate를 사용해서 API 호출을 최소화해.

## 레이아웃 & 디자인

### 전체 구조 (단일 페이지 대시보드)
```
┌─────────────────────────────────────────────────────┐
│  Header: InvestPulse 로고 + 마지막 업데이트 시간     │
│  + 다크/라이트 모드 토글                              │
├─────────────────────────────────────────────────────┤
│  [Market Overview] 자산 카드 그리드                   │
│  S&P500 | NASDAQ | DOW | VIX | BTC | ETH | SOL     │
│  Gold | Silver | Oil | USD/KRW | DXY | 10Y | 2Y    │
├──────────────────────┬──────────────────────────────┤
│  [Economic Calendar]  │  [News Feed]                │
│  이번주/이번달/다음달  │  오늘/이번주/이번달          │
│                       │                              │
│  일정 리스트           │  뉴스 카드 리스트            │
│  (중요도 색상 표시)    │  (클릭→원문 이동)           │
│                       │                              │
└──────────────────────┴──────────────────────────────┘
```

### 디자인 방향
- **다크 모드 기본** (투자/트레이딩 대시보드 느낌)
- 배경: 깊은 네이비/차콜 (#0a0f1c ~ #111827)
- 상승: 초록 (#10B981), 하락: 빨강 (#EF4444)
- 액센트: 블루 (#3B82F6) 또는 골드 (#F59E0B)
- 카드: 글래스모피즘 또는 미세한 보더의 다크 카드
- 폰트: 숫자에는 모노스페이스 계열 (Tabular nums), 본문은 깔끔한 산세리프
- 반응형: 모바일에서도 잘 보여야 함 (카드 1열, 섹션 세로 배치)

### 인터랙션
- 자산 카드 호버 시 살짝 확대 + 그림자
- 숫자 변동 시 색상 플래시 애니메이션
- 스켈레톤 UI (데이터 로딩 중)
- Pull-to-refresh 느낌의 수동 새로고침 버튼

## 디렉토리 구조

```
investpulse/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   ├── page.tsx            # 메인 대시보드
│   │   ├── api/
│   │   │   ├── markets/route.ts    # 시세 데이터 API
│   │   │   ├── calendar/route.ts   # 경제 일정 API
│   │   │   └── news/route.ts       # 뉴스 API
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── markets/
│   │   │   ├── MarketOverview.tsx   # 자산 카드 그리드
│   │   │   ├── AssetCard.tsx        # 개별 자산 카드
│   │   │   └── SparklineChart.tsx   # 미니 차트
│   │   ├── calendar/
│   │   │   ├── EconomicCalendar.tsx # 캘린더 섹션
│   │   │   └── EventRow.tsx         # 개별 일정 행
│   │   ├── news/
│   │   │   ├── NewsFeed.tsx         # 뉴스 섹션
│   │   │   └── NewsCard.tsx         # 개별 뉴스 카드
│   │   └── ui/
│   │       ├── Tabs.tsx
│   │       ├── Skeleton.tsx
│   │       └── Badge.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── markets.ts      # 시세 데이터 fetch 로직
│   │   │   ├── calendar.ts     # 경제 일정 fetch 로직
│   │   │   └── news.ts         # 뉴스 fetch 로직
│   │   ├── cache.ts            # 서버 사이드 캐시 유틸
│   │   ├── constants.ts        # 자산 목록, 카테고리 등 상수
│   │   ├── types.ts            # TypeScript 타입 정의
│   │   └── utils.ts            # 유틸리티 함수
│   └── hooks/
│       ├── useMarketData.ts
│       ├── useCalendar.ts
│       └── useNews.ts
├── public/
├── CLAUDE.md
├── .env.local.example          # API 키 템플릿
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 구현 순서

1. **프로젝트 초기 세팅**: Next.js 15 + TypeScript + Tailwind CSS + 필요 패키지 설치
2. **타입 정의 & 상수**: types.ts, constants.ts 먼저 작성
3. **API Route 구현**: /api/markets, /api/calendar, /api/news (캐싱 포함)
4. **UI 컴포넌트**: 레이아웃 → 자산 카드 → 캘린더 → 뉴스 순서
5. **데이터 연결**: React Query 훅으로 API 연결 + 자동 리페칭
6. **반응형 & 폴리싱**: 모바일 대응, 스켈레톤 UI, 애니메이션
7. **환경 변수 & 배포 설정**: .env.local, Vercel 배포 준비

## 주의사항

- API 키가 필요한 서비스는 반드시 서버 사이드(Route Handler)에서만 호출
- 무료 API rate limit 고려해서 캐싱 전략 필수 (최소 5분 캐시)
- 경제 일정의 시간은 반드시 KST로 변환해서 표시
- 뉴스 링크는 반드시 `target="_blank" rel="noopener noreferrer"` 적용
- SEO 메타데이터 기본 설정 포함
- Error boundary + fallback UI 구현
- `.env.local.example` 파일에 필요한 API 키 목록 문서화
