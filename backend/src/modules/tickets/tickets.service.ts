import { TicketStatus } from "@prisma/client";
import { assertQueueAdmission, removeFromQueue } from "../queue/queue.service";
import { db } from "../../shared/db";
import { AppError } from "../../shared/errors";
import { acquireLock, releaseLock } from "../../shared/lock";
import { getRedis } from "../../shared/redis";

const RESERVATION_TTL_SECONDS = Number(
  process.env.RESERVATION_TTL_SECONDS ?? 600
);

export const reserveTickets = async (userId: string, ticketIds: string[]) => {
  if (!ticketIds.length) {
    throw new AppError("No ticket IDs provided", 400);
  }

  const fetchedTickets = await db.ticket.findMany({
    where: { id: { in: ticketIds } },
    include: { event: true },
  });

  if (fetchedTickets.length !== ticketIds.length) {
    throw new AppError("One or more tickets do not exist", 404);
  }

  const eventId = fetchedTickets[0].eventId;
  if (fetchedTickets.some((ticket) => ticket.eventId !== eventId)) {
    throw new AppError("All tickets must belong to the same event", 400);
  }

  await assertQueueAdmission(userId, eventId);

  const lock = await acquireLock(`locks:event:${eventId}`, 15000);
  try {
    const order = await db.$transaction(async (tx) => {
      const totalCents = fetchedTickets.reduce(
        (sum, ticket) => sum + ticket.priceCents,
        0
      );
      const reservationExpiry = new Date(
        Date.now() + RESERVATION_TTL_SECONDS * 1000
      );

      const createdOrder = await tx.order.create({
        data: {
          userId,
          totalCents,
          status: "PENDING",
        },
      });

      const result = await tx.ticket.updateMany({
        where: {
          id: { in: ticketIds },
          status: TicketStatus.AVAILABLE,
        },
        data: {
          status: TicketStatus.RESERVED,
          reservedUntil: reservationExpiry,
          orderId: createdOrder.id,
        },
      });

      if (result.count !== ticketIds.length) {
        throw new AppError("Selected tickets are no longer available", 409);
      }

      return createdOrder;
    });

    await getRedis().del(`event-availability:${eventId}`);
    return {
      orderId: order.id,
      reservedUntil: new Date(
        Date.now() + RESERVATION_TTL_SECONDS * 1000
      ).toISOString(),
      ticketIds,
    };
  } finally {
    await releaseLock(lock);
  }
};

export const reserveFirstAvailableForEvent = async (
  userId: string,
  eventId: string
) => {
  await assertQueueAdmission(userId, eventId);

  const ticket = await db.ticket.findFirst({
    where: { eventId, status: TicketStatus.AVAILABLE },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!ticket) {
    throw new AppError("No tickets available for this event", 404);
  }

  return reserveTickets(userId, [ticket.id]);
};

export const releaseExpiredReservations = async () => {
  const now = new Date();
  const expiredTickets = await db.ticket.findMany({
    where: {
      status: TicketStatus.RESERVED,
      reservedUntil: { lt: now },
    },
    include: {
      order: {
        select: {
          id: true,
          userId: true,
          status: true,
        },
      },
    },
  });

  if (!expiredTickets.length) {
    return;
  }

  const orderIds = [
    ...new Set(
      expiredTickets
        .map((ticket) => ticket.orderId)
        .filter((orderId): orderId is string => Boolean(orderId))
    ),
  ];

  const queueReleases = new Map<string, string>();
  for (const ticket of expiredTickets) {
    if (ticket.order?.userId) {
      queueReleases.set(ticket.order.userId, ticket.eventId);
    }
  }

  await db.$transaction(async (tx) => {
    await tx.ticket.updateMany({
      where: {
        status: TicketStatus.RESERVED,
        reservedUntil: { lt: now },
      },
      data: {
        status: TicketStatus.AVAILABLE,
        reservedUntil: null,
        orderId: null,
      },
    });

    if (orderIds.length) {
      await tx.order.updateMany({
        where: {
          id: { in: orderIds },
          status: "PENDING",
        },
        data: { status: "CANCELLED" },
      });
    }
  });

  const redis = getRedis();
  for (const [userId, eventId] of queueReleases) {
    await removeFromQueue(userId, eventId);
    await redis.del(`event-availability:${eventId}`);
  }
};
