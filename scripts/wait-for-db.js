import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function waitForDatabase(maxRetries = 30, delay = 2000) {
  console.log('🔄 Waiting for PostgreSQL to be ready...');
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Check if container is running
      const { stdout } = await execAsync('docker ps --filter name=shipment_quotes_db --format "{{.Status}}"');
      
      if (stdout.includes('Up')) {
        // Check if PostgreSQL is ready
        try {
          await execAsync('docker exec shipment_quotes_db pg_isready -U postgres');
          console.log('✅ PostgreSQL is ready!');
          return;
        } catch (error) {
          // Container is up but PostgreSQL not ready yet
          if (i < maxRetries - 1) {
            process.stdout.write('.');
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
      } else {
        // Container not up yet
        if (i < maxRetries - 1) {
          process.stdout.write('.');
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    } catch (error) {
      // Container might not exist yet or docker command failed
      if (i < maxRetries - 1) {
        process.stdout.write('.');
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('\n❌ PostgreSQL failed to start after maximum retries');
        console.error('Please check: docker-compose ps');
        process.exit(1);
      }
    }
  }
  
  console.error('\n❌ PostgreSQL failed to start after maximum retries');
  console.error('Please check: docker-compose ps');
  process.exit(1);
}

waitForDatabase().catch((error) => {
  console.error('Error waiting for database:', error.message);
  process.exit(1);
});

