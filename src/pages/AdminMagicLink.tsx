import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { readError, storeToken } from '../lib/adminSession';

// Landing page for a one-time admin login link -- the only way into this dashboard besides the real password.
// The link is minted by the portfolio's AI assistant (via POST /api/admin/magic-link, which only it can call)
// and is single-use and expires after 10 minutes. This is its own route, outside AdminDashboard's normal
// password-gate, so it works whether or not a session already exists in this browser.
export default function AdminMagicLink() {
  const { token } = useParams<{ token: string }>();
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!token) {
      setError('This link is missing its token.');
      return;
    }
    (async () => {
      try {
        const res = await fetch('/api/admin/magic-link/consume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.token) {
          if (active) setError(await readError(res, 'This link has already been used or has expired.'));
          return;
        }
        storeToken(data.token);
        window.location.replace('/admin');
      } catch {
        if (active) setError('Could not reach the server. Check your connection and try again.');
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-5">
      <div className="w-full max-w-sm text-center space-y-6">
        <Link to="/" className="block text-xl font-semibold tracking-wide text-white">
          SHIN ORNE
        </Link>
        <div className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-8">
          {error ? (
            <>
              <p className="text-sm text-rose-400">{error}</p>
              <p className="text-sm text-neutral-400">
                <Link to="/admin" className="underline hover:text-white">
                  Sign in with the password
                </Link>{' '}
                instead.
              </p>
            </>
          ) : (
            <p className="text-sm text-neutral-300">Signing you in…</p>
          )}
        </div>
      </div>
    </div>
  );
}
