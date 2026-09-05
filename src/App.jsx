import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './lib/AuthContext';
import Login from './pages/Login';
import CheckIn from './pages/CheckIn';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';

function Shell({ children }) {
  const { session, signOut, isAdmin } = useAuth();
  const location = useLocation();

  return (
    <div className="shell">
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark">FX</div>
          <div className="brand-name">
            Student Tracker
            <small>Francis Xavier Engineering College</small>
          </div>
        </div>
        {session && (
          <button className="signout" onClick={signOut}>
            Sign out
          </button>
        )}
      </div>

      {session && !isAdmin && (
        <nav style={{ display: 'flex', gap: 4, padding: '10px 20px 0', maxWidth: 760, margin: '0 auto', width: '100%' }}>
          <TabLink to="/" label="Dashboard" active={location.pathname === '/'} />
          <TabLink to="/checkin" label="Check-in" active={location.pathname === '/checkin'} />
        </nav>
      )}

      {children}
    </div>
  );
}

function TabLink({ to, label, active }) {
  return (
    <Link
      to={to}
      style={{
        fontSize: 13,
        padding: '8px 14px',
        borderBottom: active ? '2px solid var(--green)' : '2px solid transparent',
        color: active ? 'var(--green)' : 'var(--muted)',
        fontWeight: active ? 500 : 400,
        textDecoration: 'none',
      }}
    >
      {label}
    </Link>
  );
}

function Protected({ children, adminOnly }) {
  const { session, loading, isAdmin } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

function Home() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <StudentDashboard />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <Protected>
                <Home />
              </Protected>
            }
          />
          <Route
            path="/checkin"
            element={
              <Protected>
                <CheckIn />
              </Protected>
            }
          />
          <Route
            path="/admin"
            element={
              <Protected adminOnly>
                <AdminDashboard />
              </Protected>
            }
          />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}
