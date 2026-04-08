// ============================================
// SERVIÇO DE AUTENTICAÇÃO JWT
// ============================================

const TOKEN_KEY = 'aibora_session';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas

export interface SessionToken {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'vendedor';
  createdAt: number;
  expiresAt: number;
}

function generateTokenId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

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

export function saveSession(token: SessionToken): void {
  try {
    const encoded = btoa(JSON.stringify(token));
    localStorage.setItem(TOKEN_KEY, encoded);
  } catch (err) {
    console.error('Erro ao guardar sessão:', err);
  }
}

export function getSession(): SessionToken | null {
  try {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) return null;

    const decoded = JSON.parse(atob(stored)) as SessionToken;
    
    // Verificar se expirou
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

export function clearSession(): void {
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

// Verificar se é vendedor
export function isVendedorSession(session: SessionToken | null): boolean {
  return session?.role === 'vendedor';
}

// Verificar se é admin
export function isAdminSession(session: SessionToken | null): boolean {
  return session?.role === 'admin';
}