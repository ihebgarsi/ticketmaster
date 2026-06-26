import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchEventDetails } from "../api/events.api";
import { getQueueStatus } from "../api/queue.api";
import { reserveFirstAvailable } from "../api/tickets";
import { useAuth } from "../context/AuthContext";
import { EventDetails } from "../types/Event";

const EventDetailsPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { isAuthenticated } = useAuth();

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

  const reserveMutation = useMutation({
    mutationFn: () => reserveFirstAvailable(eventId!),
    onSuccess: (result) => {
      navigate(`/checkout?orderId=${result.orderId}`);
    },
  });

  if (isLoading) return <div className="empty-state">Loading event details...</div>;
  if (error || !event) return <div className="empty-state">Event not found.</div>;

  const isAdmitted = queueStatus?.admitted;
  const isInQueue = queueStatus?.position !== null;

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
              <h2>You are admitted. Reserve a ticket to continue.</h2>
              <p>
                Your queue slot stays active until payment completes or your
                reservation expires.
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
          {reserveMutation.isError && (
            <p className="error">
              {(reserveMutation.error as Error).message ||
                "Unable to reserve a ticket."}
            </p>
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
              reserveMutation.isPending || (event.availability.AVAILABLE ?? 0) < 1
            }
            onClick={() => reserveMutation.mutate()}
          >
            {reserveMutation.isPending ? "Reserving..." : "Reserve ticket & checkout"}
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
