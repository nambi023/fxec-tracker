import { useAuth } from '../lib/AuthContext';

export default function Login() {
  const { signInWithGoogle, domainError } = useAuth();

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-crest">FX</div>
        <div className="login-title">Student Tracker</div>
        <div className="login-sub">
          Francis Xavier Engineering College
          <br />
          Attendance &amp; presence portal
        </div>

        <button className="google-btn" onClick={signInWithGoogle}>
          <svg width="16" height="16" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l6-6C34.5 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.8-.4-4.5z"/>
          </svg>
          Continue with Google
        </button>

        {domainError && (
          <div className="login-error">
            Please sign in with your college email (@francisxavier.ac.in). Personal
            Gmail accounts aren't accepted.
          </div>
        )}

        <div className="login-foot">
          Only francisxavier.ac.in accounts can access this portal.
        </div>
      </div>
    </div>
  );
}
