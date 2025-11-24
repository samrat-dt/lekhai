import { writeFile } from 'fs/promises';
import { createInterface } from 'readline';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { resolve } from 'path';

const execAsync = promisify(exec);

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt: string): Promise<string> =>
  new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });

async function getPostgresURL(): Promise<string> {
  console.log('\n📦 Step 1: Setting up PostgreSQL');
  console.log(
    'You can use any PostgreSQL provider (Railway, Neon, AWS RDS, etc.)'
  );
  console.log('Example: postgresql://user:password@localhost:5432/lekhai\n');

  return await question('Enter your PostgreSQL connection URL: ');
}

function generateAuthSecret(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('base64');
}

async function writeEnvFile(config: Record<string, string>) {
  const envContent = `# ===== DATABASE =====
POSTGRES_URL=${config.POSTGRES_URL}

# ===== AUTHENTICATION =====
AUTH_SECRET=${config.AUTH_SECRET}

# ===== BASE URL =====
NEXT_PUBLIC_APP_URL=${config.BASE_URL}
BASE_URL=${config.BASE_URL}

# ===== EMAIL SERVICE (Resend) =====
# Get from https://resend.com
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@lekhai.com

# ===== PAYMENTS (Razorpay) =====
# Get from https://razorpay.com
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_here
RAZORPAY_WEBHOOK_SECRET=whsec_your_razorpay_webhook_secret_here

# ===== ERROR TRACKING (Sentry) =====
# Get from https://sentry.io
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# ===== AI & DOCUMENT GENERATION =====
# OpenRouter API Key (FREE - Get from https://openrouter.ai/keys)
OPENROUTER_API_KEY=sk-or-v1-your_openrouter_api_key_here

# ===== ENCRYPTION =====
ENCRYPTION_KEY=your_generated_encryption_key_here

# ===== REDIS / CACHING (Optional) =====
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
`;

  const envPath = resolve(process.cwd(), '.env');
  
  if (existsSync(envPath)) {
    console.log('⚠️  .env file already exists. Skipping...');
    return;
  }

  await writeFile(envPath, envContent);
  console.log('✅ .env file created successfully!\n');
}

async function main() {
  console.log('\n🚀 Lekhai Setup');
  console.log('===============\n');

  const POSTGRES_URL = await getPostgresURL();
  const BASE_URL = 'http://localhost:3000';
  const AUTH_SECRET = generateAuthSecret();

  await writeEnvFile({
    POSTGRES_URL,
    BASE_URL,
    AUTH_SECRET,
  });

  console.log('✅ Setup completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Run: npm run db:migrate');
  console.log('2. Run: npm run db:seed');
  console.log('3. Run: npm run dev');
  console.log('\n📝 Update .env with your actual API keys when ready.\n');
  
  rl.close();
}

main().catch(console.error);
