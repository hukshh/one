import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
};

export const redisConnection = process.env.MOCK_SERVICES === 'true' 
  ? null as any 
  : new Redis(redisConfig);

if (redisConnection) {
  redisConnection.on('error', (err: any) => {
    console.error('Redis connection error:', err);
  });

  redisConnection.on('connect', () => {
    console.log('✅ Connected to Redis');
  });
} else {
  console.log('⚠️ Running in MOCK MODE - Redis connection skipped');
}
