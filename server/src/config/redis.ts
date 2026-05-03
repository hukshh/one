import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Parse REDIS_URL into ioredis options object.
 * BullMQ internally duplicates the Redis connection — passing an options
 * object (not a URL string) ensures credentials survive duplication correctly.
 * Upstash also requires enableReadyCheck: false.
 */
const buildRedisOptions = () => {
  const url = process.env.REDIS_URL;

  if (url) {
    const parsed = new URL(url);
    const isTLS = url.startsWith('rediss://');

    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || '6379'),
      username: parsed.username || 'default',
      password: decodeURIComponent(parsed.password),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,        // Required for Upstash
      connectTimeout: 10000,
      ...(isTLS ? { tls: { rejectUnauthorized: false } } : {}),
    };
  }

  // Local dev fallback (no REDIS_URL set)
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
};

export const redisOptions = buildRedisOptions();
export const redisConnection = new Redis(redisOptions as any);

export let isRedisConnected = false;

redisConnection.on('error', (err: any) => {
  isRedisConnected = false;
  if (err.code !== 'ECONNREFUSED') {
    console.error('Redis error:', err.message);
  }
});

redisConnection.on('ready', () => {
  isRedisConnected = true;
  console.log('✅ Connected to Redis');
});
