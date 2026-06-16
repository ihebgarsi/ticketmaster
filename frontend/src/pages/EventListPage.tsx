import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "../api/events";
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

  if (isLoading) return <div>Loading events…</div>;
  if (error) return <div>Unable to load events.</div>;

  return (
    <section>
      <h1>Upcoming Matches</h1>
      <ul>
        {events?.map((event) => (
          <li key={event.id}>
            <Link to={`/events/${event.id}`}>
              <strong>{event.name}</strong>
              <p>{new Date(event.date).toLocaleString()}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default EventListPage;
