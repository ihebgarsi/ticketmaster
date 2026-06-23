import { Link, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import EventListPage from "./pages/EventListPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import CheckoutPage from "./pages/CheckoutPage";
import QueuePage from "./pages/QueuePage";
import CreateEvent from "./pages/CreateEvent";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import { useAuth } from "./context/AuthContext";

const App = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <nav className="app-nav">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          {isAdmin && <Link to="/create-event">Create Event</Link>}
          {isAuthenticated ? (
            <>
              <span>{user?.name ?? user?.email}</span>
              <button type="button" onClick={() => void logout()}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventListPage />} />
          <Route path="/events/:eventId" element={<EventDetailsPage />} />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestRoute>
                <SignupPage />
              </GuestRoute>
            }
          />
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/queue" element={<QueuePage />} />
          </Route>
          <Route element={<ProtectedRoute requireAdmin />}>
            <Route path="/create-event" element={<CreateEvent />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
};

export default App;
