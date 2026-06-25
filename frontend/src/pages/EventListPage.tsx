import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "../api/events.api";
import { Link } from "react-router-dom";

const EventListPage = () => {
  const {
    data: events,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  if (isLoading) return <div className="empty-state">Loading events...</div>;
  if (error) return <div className="empty-state">Unable to load events.</div>;

  return (
    <section>
      <div className="section-heading">
        <div>
          <span className="eyebrow">Upcoming schedule</span>
          <h1>Upcoming Matches</h1>
          <p>Choose an event to view timing, venue details, and ticket status.</p>
        </div>
      </div>

      {events?.length ? (
        <ul className="event-grid">
          {events.map((event) => (
            <li key={event.id}>
              <Link to={`/events/${event.id}`} className="card-link event-card">
                <span className="event-card__date">
                  {new Date(event.date).toLocaleDateString()}
                </span>
                <strong>{event.name}</strong>
                <p>{event.venue}</p>
                <span className="event-card__meta">
                  {new Date(event.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">No events are available yet.</div>
      )}
    </section>
  );
};

export default EventListPage;
