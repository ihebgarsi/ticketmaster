import { OrderStatus, TicketStatus } from "@prisma/client";
import { removeFromQueue } from "../queue/queue.service";
import { db } from "../../shared/db";
import { AppError } from "../../shared/errors";
import { getRedis } from "../../shared/redis";

export const getOrderForUser = async (userId: string, orderId: string) => {
  const order = await db.order.findFirst({
    where: { id: orderId, userId },
    include: {
      tickets: {
        include: {
          event: {
            select: {
              id: true,
              name: true,
              date: true,
              venue: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return order;
};

export const completeOrder = async (userId: string, orderId: string) => {
  const order = await getOrderForUser(userId, orderId);

  if (order.status !== OrderStatus.PENDING) {
    throw new AppError("Only pending orders can be completed", 400);
  }

  const eventId = order.tickets[0]?.eventId;
  if (!eventId) {
    throw new AppError("Order has no tickets", 400);
  }

  const expiredTickets = order.tickets.some(
    (ticket) =>
      ticket.status === TicketStatus.RESERVED &&
      ticket.reservedUntil &&
      ticket.reservedUntil.getTime() < Date.now()
  );

  if (expiredTickets) {
    throw new AppError(
      "Reservation expired. Your tickets were released and your queue slot was freed.",
      409
    );
  }

  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.COMPLETED },
    });

    await tx.ticket.updateMany({
      where: { orderId },
      data: {
        status: TicketStatus.SOLD,
        reservedUntil: null,
      },
    });
  });

  await removeFromQueue(userId, eventId);
  await getRedis().del(`event-availability:${eventId}`);

  return getOrderForUser(userId, orderId);
};
