import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchEventDetails } from "../api/events.api";
import { Event } from "../types/Event";
const EventDetailsPage = () => {
  const { eventId } = useParams();
  const {
    data: event,
    isLoading,
    error,
  } = useQuery<Event>({
    queryKey: ["event", eventId],
    queryFn: () => fetchEventDetails(eventId!),
    enabled: Boolean(eventId),
  });

  if (isLoading) return <div>Loading event details…</div>;
  if (error || !event) return <div>Event not found.</div>;

  return (
    <section>
      <h1>{event.name}</h1>
      <p>{event.description}</p>
      <p>{new Date(event.date).toLocaleString()}</p>
      <p>Venue: {event.venue}</p>
      <div>
        <h2>Availability</h2>
        <p>Available: {event.availability.AVAILABLE ?? 0}</p>
        <p>Reserved: {event.availability.RESERVED ?? 0}</p>
        <p>Sold: {event.availability.SOLD ?? 0}</p>
      </div>
      <div>
        <button disabled>Choose seats</button>
        <p>Seat selection and checkout are under active development.</p>
      </div>
    </section>
  );
};

export default EventDetailsPage;
