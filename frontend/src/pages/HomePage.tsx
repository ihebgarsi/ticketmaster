import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <section>
      <h1>Welcome to Ticket Master</h1>
      <p>
        Browse upcoming matches, check availability, and reserve your seats.
      </p>
      <div>
        <Link to="/events">View Upcoming Events</Link>
      </div>
    </section>
  );
};

export default HomePage;
