import { Link, Route, Routes } from "react-router-dom";
import EventListPage from "./pages/EventListPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import CheckoutPage from "./pages/CheckoutPage";
import QueuePage from "./pages/QueuePage";

const App = () => {
  return (
    <div>
      <header>
        <nav>
          <Link to="/">Events</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<EventListPage />} />
          <Route path="/events/:eventId" element={<EventDetailsPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/queue" element={<QueuePage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
