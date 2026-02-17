// ecosystem.config.cjs - PM2 설정
// v1.0.0 | 2026-02-17

const fs = require('fs');
const path = require('path');

// .env 파일에서 환경 변수 로드
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  const env = { NODE_ENV: 'production' };
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed === '' || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (val) env[key] = val;
    }
  } catch {
    // .env 파일이 없으면 기본값만 사용
  }
  return env;
}

module.exports = {
  apps: [
    {
      name: 'InvestPulse',
      script: 'npm',
      args: 'run start',
      cwd: __dirname,
      env: loadEnv(),
    },
  ],
};
