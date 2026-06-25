import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchEventDetails } from "../api/events.api";
import { EventDetails } from "../types/Event";

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const {
    data: event,
    isLoading,
    error,
  } = useQuery<EventDetails>({
    queryKey: ["event", eventId],
    queryFn: () => fetchEventDetails(eventId!),
    enabled: Boolean(eventId),
  });

  if (isLoading) return <div className="empty-state">Loading event details...</div>;
  if (error || !event) return <div className="empty-state">Event not found.</div>;

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
          <h2>Join the waiting room to reserve tickets.</h2>
          <p>
            High-demand events require queue admission before ticket
            reservations are allowed.
          </p>
        </div>
        <Link
          to={`/queue?eventId=${event.id}`}
          className="button-primary"
        >
          Join waiting room
        </Link>
      </section>
    </div>
  );
};

export default EventDetailsPage;
