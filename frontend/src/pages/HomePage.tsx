import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="page-stack">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Ticketing platform</span>
          <h1>Discover high-demand events with a cleaner, faster experience.</h1>
          <p>
            Browse upcoming matches, monitor live availability, and move from
            discovery to checkout with less friction.
          </p>
          <div className="hero-actions">
            <Link to="/events" className="button-primary">
              View upcoming events
            </Link>
            <Link to="/signup" className="button-ghost">
              Create an account
            </Link>
          </div>
        </div>
        <div className="hero-panel">
          <div className="status-grid">
            <div className="status-card">
              <strong>Live inventory</strong>
              <span>Track availability before seats disappear.</span>
            </div>
            <div className="status-card">
              <strong>Queue ready</strong>
              <span>Protect high-traffic launches with a waiting room.</span>
            </div>
            <div className="status-card">
              <strong>Admin tools</strong>
              <span>Create and publish events from one streamlined flow.</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Why it feels better</span>
            <h2>Designed to highlight the next action.</h2>
          </div>
        </div>
        <div className="feature-grid">
          <article className="info-card">
            <h3>Clear navigation</h3>
            <p>Important routes stay visible and easier to scan on every page.</p>
          </article>
          <article className="info-card">
            <h3>Stronger hierarchy</h3>
            <p>
              Larger headings, better spacing, and softer surfaces improve
              readability.
            </p>
          </article>
          <article className="info-card">
            <h3>Consistent forms</h3>
            <p>
              Authentication and event creation now share a cleaner card-based
              layout.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
