import { db } from "../../shared/db";
import { getRedis } from "../../shared/redis";

const CACHE_TTL_SECONDS = 20;

const availabilityCacheKey = (eventId: string) =>
  `event-availability:${eventId}`;

export const listEvents = async () => {
  return db.event.findMany({
    orderBy: { date: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      date: true,
      venue: true,
      description: true,
    },
  });
};

export const getEventDetails = async (eventId: string) => {
  const [event, counts] = await Promise.all([
    db.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
        slug: true,
        date: true,
        venue: true,
        description: true,
      },
    }),
    getAvailabilityCounts(eventId),
  ]);

  if (!event) {
    return null;
  }

  return { ...event, availability: counts };
};

export const getAvailabilityCounts = async (eventId: string) => {
  const cacheKey = availabilityCacheKey(eventId);
  const redis = getRedis();
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached) as Record<string, number>;
  }

  const counts = await db.ticket.groupBy({
    by: ["status"],
    where: { eventId },
    _count: { status: true },
  });

  const payload = counts.reduce((acc, item) => {
    acc[item.status] = item._count.status;
    return acc;
  }, {} as Record<string, number>);

  await redis.set(cacheKey, JSON.stringify(payload), "EX", CACHE_TTL_SECONDS);
  return payload;
};
