import Redis from "ioredis";

let redis: Redis;

export const initializeRedis = async () => {
  const url = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
  redis = new Redis(url);
  await redis.ping();
};

export const getRedis = (): Redis => {
  if (!redis) {
    throw new Error("Redis client is not initialized");
  }
  return redis;
};
