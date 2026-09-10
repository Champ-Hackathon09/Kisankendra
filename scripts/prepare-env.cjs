const fs = require('fs');
const path = require('path');

const backendEnvPath = path.resolve(__dirname, '../backend/.env');

if (!fs.existsSync(backendEnvPath)) {
  const defaultEnv = [
    'PORT=5000',
    'DATABASE_URL="file:./dev.db"',
    'JWT_SECRET="kisankendra_super_secure_jwt_secret_key_2026"',
    ''
  ].join('\n');
  fs.writeFileSync(backendEnvPath, defaultEnv, 'utf8');
  console.log('[Setup] Created backend/.env with default settings for build.');
} else {
  console.log('[Setup] backend/.env is already present.');
}
