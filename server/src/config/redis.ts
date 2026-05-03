import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.REDIS_URL;

// ioredis accepts rediss:// URLs directly and handles TLS automatically
// Fallback to localhost only when no REDIS_URL is set (local dev)
export const redisConnection = url
  ? new Redis(url, { maxRetriesPerRequest: null, tls: url.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined })
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
    });

export let isRedisConnected = false;

redisConnection.on('error', (err: any) => {
  isRedisConnected = false;
  if (err.code !== 'ECONNREFUSED') {
    console.error('Redis error:', err.message);
  }
});

redisConnection.on('connect', () => {
  isRedisConnected = true;
  console.log('✅ Connected to Redis');
});
