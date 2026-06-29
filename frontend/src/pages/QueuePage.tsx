import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enterQueue, getQueueStatus, leaveQueue } from "../api/queue.api";
import { fetchEventDetails } from "../api/events.api";

const POLL_INTERVAL_MS = 3000;

const QueuePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");

  const {
    data: event,
    isLoading: isEventLoading,
    error: eventError,
  } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => fetchEventDetails(eventId!),
    enabled: Boolean(eventId),
  });

  const enterQuery = useQuery({
    queryKey: ["queue-enter", eventId],
    queryFn: () => enterQueue(eventId!),
    enabled: Boolean(eventId),
    staleTime: Infinity,
    retry: 1,
  });

  const {
    data: queueStatus,
    isLoading: isStatusLoading,
    error: statusError,
  } = useQuery({
    queryKey: ["queue-status", eventId],
    queryFn: () => getQueueStatus(eventId!),
    enabled: Boolean(eventId) && enterQuery.isSuccess,
    refetchInterval: (query) =>
      query.state.data?.admitted ? false : POLL_INTERVAL_MS,
  });

  const leaveMutation = useMutation({
    mutationFn: () => leaveQueue(eventId!),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["queue-status", eventId] });
      queryClient.removeQueries({ queryKey: ["queue-enter", eventId] });
      navigate("/events");
    },
  });

  if (!eventId) {
    return (
      <section className="empty-state-panel">
        <span className="eyebrow">Traffic management</span>
        <h1>Waiting Room</h1>
        <p>Select an event first, then join the queue from its details page.</p>
        <Link to="/events" className="button-primary">
          Browse events
        </Link>
      </section>
    );
  }

  if (isEventLoading || enterQuery.isLoading) {
    return <div className="empty-state">Joining the waiting room...</div>;
  }

  if (eventError || !event) {
    return <div className="empty-state">Event not found.</div>;
  }

  if (enterQuery.isError) {
    return (
      <div className="empty-state">
        Unable to join the waiting room. Please try again.
      </div>
    );
  }

  const status = queueStatus ?? enterQuery.data;
  const isWaiting = status && !status.admitted;

  return (
    <div className="page-stack">
      <section className="event-hero">
        <div>
          <span className="eyebrow">Waiting room</span>
          <h1>{event.name}</h1>
          <p>
            {status?.soldOut
              ? "This event is sold out. You can leave the queue or wait in case a reservation expires."
              : status?.admitted
                ? "You are admitted. You can now continue to ticket selection."
                : status?.position != null &&
                    status.effectiveAdmissionLimit != null &&
                    status.position > status.effectiveAdmissionLimit
                  ? `Only ${status.effectiveAdmissionLimit} shoppers can enter at a time because ${status.ticketsUnsold ?? 0} ticket${status.ticketsUnsold === 1 ? "" : "s"} remain. You are behind the current shopping window.`
                  : "High demand is active. We are holding your place in line until a spot opens."}
          </p>
        </div>
        <div className="event-summary">
          <div className="summary-item">
            <span>Your position</span>
            <strong>
              {isStatusLoading && !status
                ? "..."
                : status?.position ?? "Not in queue"}
            </strong>
          </div>
          <div className="summary-item">
            <span>People waiting</span>
            <strong>{status?.size ?? 0}</strong>
          </div>
          <div className="summary-item">
            <span>Seats left</span>
            <strong>{status?.ticketsAvailable ?? 0}</strong>
          </div>
          <div className="summary-item">
            <span>Shopping window</span>
            <strong>Top {status?.effectiveAdmissionLimit ?? 0}</strong>
          </div>
        </div>
      </section>

      <section>
        {statusError ? (
          <p className="error">Unable to refresh queue status.</p>
        ) : status?.soldOut ? (
          <div className="cta-panel">
            <div>
              <span className="eyebrow">Sold out</span>
              <h2>All tickets have been reserved or sold.</h2>
              <p>
                If a reservation expires, seats may reopen and the next users in
                line will be admitted automatically.
              </p>
            </div>
            <button
              type="button"
              className="button-secondary"
              disabled={leaveMutation.isPending}
              onClick={() => leaveMutation.mutate()}
            >
              {leaveMutation.isPending ? "Leaving..." : "Leave queue"}
            </button>
          </div>
        ) : status?.admitted ? (
          <div className="cta-panel">
            <div>
              <span className="eyebrow">You are in</span>
              <h2>Your turn has arrived.</h2>
              <p>
                You are within the first {status.effectiveAdmissionLimit} shoppers
                and {status.ticketsAvailable} seat
                {status.ticketsAvailable === 1 ? "" : "s"} are ready to reserve.
              </p>
            </div>
            <Link to={`/events/${eventId}`} className="button-primary">
              Continue to event
            </Link>
          </div>
        ) : (
          <div className="cta-panel">
            <div>
              <span className="eyebrow">Please wait</span>
              <h2>We will refresh your position automatically.</h2>
              <p>
                {isWaiting && status
                  ? status.position != null &&
                    status.effectiveAdmissionLimit != null &&
                    status.position > status.effectiveAdmissionLimit
                    ? `You are #${status.position} of ${status.size}. Only the first ${status.effectiveAdmissionLimit} can shop while ${status.ticketsUnsold} ticket${status.ticketsUnsold === 1 ? "" : "s"} remain.`
                    : `You are #${status.position} of ${status.size}. Stay on this page while we move you forward.`
                  : "Checking your place in line..."}
              </p>
            </div>
            <button
              type="button"
              className="button-secondary"
              disabled={leaveMutation.isPending}
              onClick={() => leaveMutation.mutate()}
            >
              {leaveMutation.isPending ? "Leaving..." : "Leave queue"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default QueuePage;
