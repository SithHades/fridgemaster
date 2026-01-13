const requiredVars = [
  'DATABASE_URL',
  'OPEN_ROUTER_API_KEY',
  'AUTH_SECRET',
  'AUTH_URL'
];

const missing = requiredVars.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(key => console.error(`   - ${key}`));
  process.exit(1);
}

console.log('✅ Environment check passed.');
