// components/layout/Footer.tsx - 푸터 컴포넌트
// v1.0.0 | 2026-02-17

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-[#0a0f1c] px-4 py-4">
      <div className="mx-auto max-w-7xl text-center text-xs text-gray-500">
        <p>
          InvestPulse &copy; {new Date().getFullYear()} &middot;
          데이터는 15분~1시간 지연될 수 있습니다 &middot;
          투자 조언이 아닙니다
        </p>
      </div>
    </footer>
  );
}
