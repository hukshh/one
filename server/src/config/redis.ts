import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Build connection config — supports both local Redis and Upstash (TLS/rediss://)
const getRedisConfig = () => {
  const url = process.env.REDIS_URL;

  if (url) {
    // Upstash uses rediss:// (TLS) — ioredis needs tls option enabled
    if (url.startsWith('rediss://')) {
      return {
        url,
        tls: { rejectUnauthorized: false },
        maxRetriesPerRequest: null,
        retryStrategy: (times: number) => Math.min(times * 100, 3000),
      };
    }
    // Plain redis:// URL (local or Render internal)
    return url;
  }

  // Fallback: host/port config for local dev without REDIS_URL
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
    retryStrategy: (times: number) => Math.min(times * 100, 3000),
  };
};

export const redisConnection = new Redis(getRedisConfig() as any);

export let isRedisConnected = false;

redisConnection.on('error', (err: any) => {
  isRedisConnected = false;
  if (err.code !== 'ECONNREFUSED') {
    console.error('Redis connection error:', err.message);
  }
});

redisConnection.on('connect', () => {
  isRedisConnected = true;
  console.log('✅ Connected to Redis');
});
