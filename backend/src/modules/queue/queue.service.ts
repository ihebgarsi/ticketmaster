import { getRedis } from "../../shared/redis";

const QUEUE_KEY = "waiting-room:queue";

export const addToQueue = async (sessionId: string, eventId: string) => {
  const redis = getRedis();
  const score = Date.now();
  await redis.zadd(`${QUEUE_KEY}:${eventId}`, score, sessionId);
  const rank = await redis.zrank(`${QUEUE_KEY}:${eventId}`, sessionId);
  const size = await redis.zcard(`${QUEUE_KEY}:${eventId}`);
  return {
    position: rank !== null ? rank + 1 : size,
    size
  };
};

export const getQueueStatus = async (sessionId: string, eventId: string) => {
  const redis = getRedis();
  const rank = await redis.zrank(`${QUEUE_KEY}:${eventId}`, sessionId);
  const size = await redis.zcard(`${QUEUE_KEY}:${eventId}`);
  return {
    position: rank !== null ? rank + 1 : null,
    size
  };
};

export const removeFromQueue = async (sessionId: string, eventId: string) => {
  const redis = getRedis();
  await redis.zrem(`${QUEUE_KEY}:${eventId}`, sessionId);
};
