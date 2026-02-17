// app/layout.tsx - 루트 레이아웃
// v1.0.0 | 2026-02-17

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { QueryProvider } from '@/components/QueryProvider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'InvestPulse - 투자 대시보드',
  description:
    '주요 자산 시세, 경제 지표 발표 일정, 투자 뉴스를 한 화면에서 확인하세요.',
  keywords: ['투자', '대시보드', '주식', '암호화폐', '경제지표', '뉴스'],
  openGraph: {
    title: 'InvestPulse - 투자 대시보드',
    description:
      '주요 자산 시세, 경제 지표 발표 일정, 투자 뉴스를 한 화면에서 확인하세요.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#0a0f1c] font-sans text-gray-100 antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
