import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { completeOrder, getOrder } from "../api/orders.api";

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);

const getReservationDeadline = (reservedUntil: string | null) => {
  if (!reservedUntil) {
    return null;
  }

  return new Date(reservedUntil);
};

const CheckoutPage = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [timeLeftMs, setTimeLeftMs] = useState<number | null>(null);

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId!),
    enabled: Boolean(orderId),
  });

  const completeMutation = useMutation({
    mutationFn: () => completeOrder(orderId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["queue-status"] });
    },
  });

  const reservationDeadline = order?.tickets[0]?.reservedUntil
    ? getReservationDeadline(order.tickets[0].reservedUntil)
    : null;

  useEffect(() => {
    if (!reservationDeadline || order?.status !== "PENDING") {
      setTimeLeftMs(null);
      return;
    }

    const updateTimer = () => {
      setTimeLeftMs(Math.max(0, reservationDeadline.getTime() - Date.now()));
    };

    updateTimer();
    const intervalId = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(intervalId);
  }, [reservationDeadline, order?.status]);

  if (!orderId) {
    return (
      <section className="empty-state-panel">
        <span className="eyebrow">Checkout</span>
        <h1>No order selected</h1>
        <p>Reserve a ticket from an event page to start checkout.</p>
        <Link to="/events" className="button-primary">
          Browse events
        </Link>
      </section>
    );
  }

  if (isLoading) {
    return <div className="empty-state">Loading checkout...</div>;
  }

  if (error || !order) {
    return <div className="empty-state">Unable to load this order.</div>;
  }

  const event = order.tickets[0]?.event;
  const isExpired = timeLeftMs === 0 && order.status === "PENDING";
  const minutesLeft =
    timeLeftMs !== null ? Math.floor(timeLeftMs / 60000) : null;
  const secondsLeft =
    timeLeftMs !== null ? Math.floor((timeLeftMs % 60000) / 1000) : null;

  if (order.status === "COMPLETED" || completeMutation.isSuccess) {
    return (
      <section className="empty-state-panel">
        <span className="eyebrow">Payment complete</span>
        <h1>Thank you for your purchase</h1>
        <p>
          Order {order.id.slice(0, 8)} is confirmed. You have been removed from
          the waiting room and your tickets are marked as sold.
        </p>
        <Link to="/events" className="button-primary">
          Back to events
        </Link>
      </section>
    );
  }

  return (
    <div className="page-stack">
      <section className="event-hero">
        <div>
          <span className="eyebrow">Checkout</span>
          <h1>{event?.name ?? "Your order"}</h1>
          <p>
            Review your reservation and complete payment. This demo uses a mock
            payment button instead of a real gateway.
          </p>
        </div>
        <div className="event-summary">
          <div className="summary-item">
            <span>Order total</span>
            <strong>{formatPrice(order.totalCents)}</strong>
          </div>
          <div className="summary-item">
            <span>Tickets</span>
            <strong>{order.tickets.length}</strong>
          </div>
          <div className="summary-item">
            <span>Time left</span>
            <strong>
              {minutesLeft !== null && secondsLeft !== null
                ? `${minutesLeft}:${secondsLeft.toString().padStart(2, "0")}`
                : "—"}
            </strong>
          </div>
        </div>
      </section>

      <section>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Order summary</span>
            <h2>Reserved seats</h2>
          </div>
        </div>

        <ul className="event-grid">
          {order.tickets.map((ticket) => (
            <li key={ticket.id}>
              <article className="info-card">
                <h3>
                  Section {ticket.section}, Row {ticket.row}
                </h3>
                <p>Seat {ticket.seatLabel}</p>
                <strong>{formatPrice(ticket.priceCents)}</strong>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <section className="cta-panel">
        <div>
          <span className="eyebrow">Mock payment</span>
          <h2>Ready to finish checkout?</h2>
          <p>
            {isExpired
              ? "Your reservation expired. Tickets were released and your queue slot was freed."
              : "Click below to simulate a successful payment. You will leave the waiting room after completion."}
          </p>
          {completeMutation.isError && (
            <p className="error">
              {(completeMutation.error as Error).message ||
                "Payment could not be completed."}
            </p>
          )}
        </div>
        <button
          type="button"
          className="button-primary"
          disabled={
            completeMutation.isPending || isExpired || order.status !== "PENDING"
          }
          onClick={() => completeMutation.mutate()}
        >
          {completeMutation.isPending ? "Processing..." : "Complete payment"}
        </button>
      </section>
    </div>
  );
};

export default CheckoutPage;
