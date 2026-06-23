import Redlock from "redlock";
import { getRedis } from "./redis";

let redlock: Redlock;

export const initializeRedlock = () => {
  const client = getRedis() as unknown as Redlock.CompatibleRedisClient;
  redlock = new Redlock([client], {
    retryCount: 3,
    retryDelay: 200,
    retryJitter: 100,
  });
};

export const acquireLock = async (key: string, ttl = 10000) => {
  if (!redlock) {
    initializeRedlock();
  }
  return redlock.acquire([key], ttl);
};

export const releaseLock = async (lock: Redlock.Lock) => {
  await lock.unlock();
};
