// ============================================
// JWT SESSION HELPERS
// ============================================

const TOKEN_KEY = 'aibora_session';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export interface SessionToken {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'vendedor';
  createdAt: number;
  expiresAt: number;
}

/**
 * Create a local session token.
 * Note: in production this should be a server-signed JWT.
 */
export function createSessionToken(user: {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'vendedor';
}): SessionToken {
  const now = Date.now();
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    role: user.role,
    createdAt: now,
    expiresAt: now + TOKEN_EXPIRY
  };
}

/**
 * Persist session in sessionStorage (cleared when the tab closes).
 */
export function saveSession(token: SessionToken): void {
  try {
    const encoded = btoa(JSON.stringify(token));
    sessionStorage.setItem(TOKEN_KEY, encoded);
  } catch (err) {
    console.error('Failed to save session:', err);
  }
}

/**
 * Read session and validate expiry.
 */
export function getSession(): SessionToken | null {
  try {
    let stored = sessionStorage.getItem(TOKEN_KEY);
    
    // Fallback to localStorage for existing users (migration)
    if (!stored) {
      stored = localStorage.getItem(TOKEN_KEY);
      if (stored) {
        sessionStorage.setItem(TOKEN_KEY, stored);
        localStorage.removeItem(TOKEN_KEY);
      }
    }

    if (!stored) return null;

    const decoded = JSON.parse(atob(stored)) as SessionToken;
    
    // Check expiry
    if (Date.now() > decoded.expiresAt) {
      clearSession();
      return null;
    }

    return decoded;
  } catch {
    clearSession();
    return null;
  }
}

/**
 * Clear session from both storages.
 */
export function clearSession(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function refreshSession(): boolean {
  const session = getSession();
  if (!session) return false;

  const newSession: SessionToken = {
    ...session,
    createdAt: Date.now(),
    expiresAt: Date.now() + TOKEN_EXPIRY
  };
  
  saveSession(newSession);
  return true;
}

// True if vendedor session
export function isVendedorSession(session: SessionToken | null): boolean {
  return session?.role === 'vendedor';
}

// True if admin session
export function isAdminSession(session: SessionToken | null): boolean {
  return session?.role === 'admin';
}
