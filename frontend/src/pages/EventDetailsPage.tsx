import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAvailableTickets, fetchEventDetails } from "../api/events.api";
import { getQueueStatus } from "../api/queue.api";
import { reserveTickets } from "../api/tickets";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { EventDetails } from "../types/Event";
import { getErrorMessage } from "../utils/getErrorMessage";

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);

const formatSeatLabel = (ticket: {
  section: string;
  row: string;
  seatLabel: string;
  priceCents: number;
}) =>
  `Section ${ticket.section}, Row ${ticket.row}, Seat ${ticket.seatLabel} — ${formatPrice(ticket.priceCents)}`;

const EventDetailsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { eventId } = useParams();
  const { isAuthenticated } = useAuth();
  const [selectedTicketId, setSelectedTicketId] = useState("");

  const {
    data: event,
    isLoading,
    error,
  } = useQuery<EventDetails>({
    queryKey: ["event", eventId],
    queryFn: () => fetchEventDetails(eventId!),
    enabled: Boolean(eventId),
  });

  const { data: queueStatus } = useQuery({
    queryKey: ["queue-status", eventId],
    queryFn: () => getQueueStatus(eventId!),
    enabled: isAuthenticated && Boolean(eventId),
  });

  const isAdmitted = queueStatus?.admitted;
  const isInQueue = queueStatus?.position !== null;

  const {
    data: availableTickets = [],
    isLoading: isTicketsLoading,
    error: ticketsError,
  } = useQuery({
    queryKey: ["available-tickets", eventId],
    queryFn: () => fetchAvailableTickets(eventId!),
    enabled: Boolean(eventId),
    refetchInterval: isAdmitted ? 5000 : false,
  });

  const reserveMutation = useMutation({
    mutationFn: (ticketIds: string[]) => reserveTickets({ ticketIds }),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      await queryClient.invalidateQueries({
        queryKey: ["available-tickets", eventId],
      });
      await queryClient.invalidateQueries({ queryKey: ["queue-status", eventId] });
      showToast("success", "Seat reserved. Complete checkout to confirm.");
      navigate(`/checkout?orderId=${result.orderId}`);
    },
    onError: (mutationError) => {
      showToast(
        "error",
        getErrorMessage(mutationError, "Unable to reserve this seat right now.")
      );
    },
  });

  if (isLoading) return <div className="empty-state">Loading event details...</div>;
  if (error || !event) return <div className="empty-state">Event not found.</div>;

  const selectedTicket = availableTickets.find(
    (ticket) => ticket.id === selectedTicketId
  );

  const handleReserve = () => {
    if (!selectedTicketId) {
      showToast("error", "Choose a seat before reserving.");
      return;
    }
    reserveMutation.mutate([selectedTicketId]);
  };

  return (
    <div className="page-stack">
      <section className="event-hero">
        <div>
          <span className="eyebrow">Event overview</span>
          <h1>{event.name}</h1>
          <p>{event.description}</p>
        </div>
        <div className="event-summary">
          <div className="summary-item">
            <span>Date</span>
            <strong>{new Date(event.date).toLocaleDateString()}</strong>
          </div>
          <div className="summary-item">
            <span>Time</span>
            <strong>
              {new Date(event.date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </strong>
          </div>
          <div className="summary-item">
            <span>Venue</span>
            <strong>{event.venue}</strong>
          </div>
        </div>
      </section>

      <section>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Ticket availability</span>
            <h2>Live inventory snapshot</h2>
          </div>
        </div>
        <div className="status-grid">
          <div className="status-card">
            <strong>{event.availability.AVAILABLE ?? 0}</strong>
            <span>Available</span>
          </div>
          <div className="status-card">
            <strong>{event.availability.RESERVED ?? 0}</strong>
            <span>Reserved</span>
          </div>
          <div className="status-card">
            <strong>{event.availability.SOLD ?? 0}</strong>
            <span>Sold</span>
          </div>
        </div>
      </section>

      <section className="form-card">
        <div className="section-heading compact">
          <div>
            <span className="eyebrow">Seat selection</span>
            <h2>Choose a remaining seat</h2>
            <p>
              {isTicketsLoading
                ? "Loading available seats..."
                : availableTickets.length
                  ? `${availableTickets.length} seat${availableTickets.length === 1 ? "" : "s"} still available.`
                  : "No seats are currently available for this event."}
            </p>
          </div>
        </div>

        {ticketsError ? (
          <p className="error">Unable to load available seats.</p>
        ) : (
          <div className="form-field seat-select-field">
            <label htmlFor="seat-select">Available seat</label>
            <select
              id="seat-select"
              value={selectedTicketId}
              onChange={(event) => setSelectedTicketId(event.target.value)}
              disabled={
                !isAdmitted ||
                isTicketsLoading ||
                availableTickets.length === 0 ||
                reserveMutation.isPending
              }
            >
              <option value="">
                {availableTickets.length
                  ? "Select a seat"
                  : "No seats available"}
              </option>
              {availableTickets.map((ticket) => (
                <option key={ticket.id} value={ticket.id}>
                  {formatSeatLabel(ticket)}
                </option>
              ))}
            </select>
            {selectedTicket && (
              <p className="seat-select-hint">
                You selected {formatSeatLabel(selectedTicket)}.
              </p>
            )}
            {!isAuthenticated && (
              <p className="seat-select-hint">
                Sign in and join the waiting room to reserve a seat.
              </p>
            )}
            {isAuthenticated && !isAdmitted && (
              <p className="seat-select-hint">
                {isInQueue
                  ? "Wait for queue admission before you can reserve a seat."
                  : "Join the waiting room to unlock seat selection."}
              </p>
            )}
          </div>
        )}
      </section>

      <section className="cta-panel">
        <div>
          <span className="eyebrow">Next step</span>
          {!isAuthenticated ? (
            <>
              <h2>Sign in to join the waiting room.</h2>
              <p>Authentication is required before you can queue or checkout.</p>
            </>
          ) : isAdmitted ? (
            <>
              <h2>You are admitted. Reserve your seat.</h2>
              <p>
                Pick an available seat above, then continue to checkout to
                complete your reservation.
              </p>
            </>
          ) : isInQueue ? (
            <>
              <h2>You are still in the waiting room.</h2>
              <p>
                You are #{queueStatus?.position} of {queueStatus?.size}. Wait for
                admission before reserving tickets.
              </p>
            </>
          ) : (
            <>
              <h2>Join the waiting room to reserve tickets.</h2>
              <p>
                High-demand events require queue admission before ticket
                reservations are allowed.
              </p>
            </>
          )}
        </div>

        {!isAuthenticated ? (
          <Link to="/login" className="button-primary">
            Login
          </Link>
        ) : isAdmitted ? (
          <button
            type="button"
            className="button-primary"
            disabled={
              reserveMutation.isPending ||
              !selectedTicketId ||
              availableTickets.length === 0
            }
            onClick={handleReserve}
          >
            {reserveMutation.isPending ? "Reserving..." : "Reserve seat & checkout"}
          </button>
        ) : isInQueue ? (
          <Link to={`/queue?eventId=${event.id}`} className="button-primary">
            View queue status
          </Link>
        ) : (
          <Link to={`/queue?eventId=${event.id}`} className="button-primary">
            Join waiting room
          </Link>
        )}
      </section>
    </div>
  );
};

export default EventDetailsPage;
