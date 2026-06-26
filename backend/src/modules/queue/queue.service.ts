import { AppError } from "../../shared/errors";
import { getRedis } from "../../shared/redis";

const QUEUE_KEY = "waiting-room:queue";

export const getQueueAdmissionLimit = () =>
  Number(process.env.QUEUE_ADMISSION_LIMIT ?? 50);

const queueKey = (eventId: string) => `${QUEUE_KEY}:${eventId}`;

const buildQueueStatus = (position: number | null, size: number) => {
  const admissionLimit = getQueueAdmissionLimit();

  return {
    position,
    size,
    admitted: position !== null && position <= admissionLimit,
    admissionLimit,
  };
};

export const addToQueue = async (sessionId: string, eventId: string) => {
  const redis = getRedis();
  const key = queueKey(eventId);
  const existingRank = await redis.zrank(key, sessionId);

  if (existingRank === null) {
    await redis.zadd(key, Date.now(), sessionId);
  }

  const rank = await redis.zrank(key, sessionId);
  const size = await redis.zcard(key);
  const position = rank !== null ? rank + 1 : size;

  return buildQueueStatus(position, size);
};

export const getQueueStatus = async (sessionId: string, eventId: string) => {
  const redis = getRedis();
  const key = queueKey(eventId);
  const rank = await redis.zrank(key, sessionId);
  const size = await redis.zcard(key);
  const position = rank !== null ? rank + 1 : null;

  return buildQueueStatus(position, size);
};

export const assertQueueAdmission = async (
  sessionId: string,
  eventId: string
) => {
  const status = await getQueueStatus(sessionId, eventId);

  if (status.position === null) {
    throw new AppError(
      "Join the waiting room before reserving tickets",
      403,
      status
    );
  }

  if (!status.admitted) {
    throw new AppError("You are still in the waiting room", 403, status);
  }

  return status;
};

export const removeFromQueue = async (sessionId: string, eventId: string) => {
  const redis = getRedis();
  await redis.zrem(queueKey(eventId), sessionId);
};
