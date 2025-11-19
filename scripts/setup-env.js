import { existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Backend .env configuration
const backendEnvPath = join(rootDir, 'backend', '.env');
const backendEnvContent = `# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_NAME=shipment_quotes
DB_USER=postgres
DB_PASSWORD=postgres

# Server Configuration
PORT=3000
NODE_ENV=development
`;

// Frontend .env.local configuration
const frontendEnvPath = join(rootDir, 'frontend', '.env.local');
const frontendEnvContent = `# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# Frontend Server Port
PORT=3001
`;

function setupEnvFiles() {
  console.log('🔧 Setting up environment files...');
  
  let created = false;
  
  // Create backend .env if it doesn't exist
  if (!existsSync(backendEnvPath)) {
    writeFileSync(backendEnvPath, backendEnvContent, 'utf8');
    console.log('✅ Created backend/.env');
    created = true;
  } else {
    console.log('ℹ️  backend/.env already exists');
  }
  
  // Create frontend .env.local if it doesn't exist
  if (!existsSync(frontendEnvPath)) {
    writeFileSync(frontendEnvPath, frontendEnvContent, 'utf8');
    console.log('✅ Created frontend/.env.local');
    created = true;
  } else {
    console.log('ℹ️  frontend/.env.local already exists');
  }
  
  if (!created) {
    console.log('✨ Environment files are already set up');
  } else {
    console.log('✨ Environment files setup complete!');
  }
}

setupEnvFiles();

