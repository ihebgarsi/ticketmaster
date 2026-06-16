import { Link, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import EventListPage from "./pages/EventListPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import CheckoutPage from "./pages/CheckoutPage";
import QueuePage from "./pages/QueuePage";

const App = () => {
  return (
    <div className="app-shell">
      <header className="app-header">
        <nav className="app-nav">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventListPage />} />
          <Route path="/events/:eventId" element={<EventDetailsPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/queue" element={<QueuePage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
