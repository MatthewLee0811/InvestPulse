// ecosystem.config.cjs - PM2 설정
// v1.1.0 | 2026-02-17
// API 키는 PM2에 전달하지 않음 — Next.js가 .env 파일을 직접 로드

module.exports = {
  apps: [
    {
      name: 'InvestPulse',
      script: 'npm',
      args: 'run start',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
