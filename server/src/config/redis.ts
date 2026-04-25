import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

// Disabled Redis for clean logs
export const redisConnection = null as any; 

export let isRedisConnected = false;

if (redisConnection) {
  redisConnection.on('error', (err: any) => {
    isRedisConnected = false;
    if (err.code === 'ECONNREFUSED') {
      // Silent in logs, but status is updated
    } else {
      console.error('Redis connection error:', err);
    }
  });

  redisConnection.on('connect', () => {
    isRedisConnected = true;
    console.log('✅ Connected to Redis');
  });
}
