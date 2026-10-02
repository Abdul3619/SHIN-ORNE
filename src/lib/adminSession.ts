// Shared admin-session helpers -- used by both the password-login dashboard (AdminDashboard.tsx) and the
// one-time magic-link landing page (AdminMagicLink.tsx), so both end up storing the session the same way.

export function readStoredToken() {
  try {
    return localStorage.getItem('adminToken');
  } catch {
    return null;
  }
}

export function storeToken(token: string | null) {
  try {
    if (token) localStorage.setItem('adminToken', token);
    else localStorage.removeItem('adminToken');
  } catch {
    // Storage unavailable: the session lasts until the page is closed.
  }
}

export async function readError(res: Response, fallback: string) {
  const data = await res.json().catch(() => ({}));
  return data.error || fallback;
}
