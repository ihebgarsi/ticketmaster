import { Link, NavLink, Route, Routes } from "react-router-dom";
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
import ThemeToggle from "./components/ThemeToggle";
import { useAuth } from "./context/AuthContext";

const App = () => {
  const { isAuthenticated, isAdmin, isLoading, user, logout } = useAuth();

  const userLabel = user?.name ?? user?.email;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/" className="brand-mark">
            <span className="brand-mark__badge">TM</span>
            <span>
              <strong>Ticket Master</strong>
              <small>Live events, smoother access</small>
            </span>
          </Link>
          <nav className="app-nav">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/events">Events</NavLink>
            {isAdmin && <NavLink to="/create-event">Create Event</NavLink>}
          </nav>
          <div className="app-actions">
            <ThemeToggle />
            {isLoading ? (
              <span className="pill-label">Restoring session...</span>
            ) : isAuthenticated ? (
              <>
                <span className="pill-label">{userLabel}</span>
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => void logout()}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="button-ghost">
                  Login
                </NavLink>
                <NavLink to="/signup" className="button-primary">
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </div>
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
      <footer className="app-footer">
        <p>Built for faster discovery, cleaner checkout flows, and better event browsing.</p>
      </footer>
    </div>
  );
};

export default App;
