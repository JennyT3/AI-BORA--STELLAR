// ============================================
// SERVIÇO DE AUTENTICAÇÃO JWT (MEJORADO)
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

/**
 * Crea un token de sesión local.
 * Nota: En producción, esto debería ser un JWT firmado por el servidor.
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
 * Guarda la sesión en sessionStorage para mayor seguridad (se limpia al cerrar la pestaña).
 */
export function saveSession(token: SessionToken): void {
  try {
    // Usamos btoa solo para una ofuscación básica, pero movido a sessionStorage
    const encoded = btoa(JSON.stringify(token));
    sessionStorage.setItem(TOKEN_KEY, encoded);
  } catch (err) {
    console.error('Erro ao guardar sessão:', err);
  }
}

/**
 * Obtiene la sesión validando la expiración.
 */
export function getSession(): SessionToken | null {
  try {
    // Intentar primero en sessionStorage (nuevo estándar)
    let stored = sessionStorage.getItem(TOKEN_KEY);
    
    // Fallback a localStorage para no cerrar sesión a usuarios existentes (migración)
    if (!stored) {
      stored = localStorage.getItem(TOKEN_KEY);
      if (stored) {
        // Migrar a sessionStorage y limpiar localStorage
        sessionStorage.setItem(TOKEN_KEY, stored);
        localStorage.removeItem(TOKEN_KEY);
      }
    }

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

/**
 * Limpia la sesión de ambos almacenamientos.
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

// Verificar se é vendedor
export function isVendedorSession(session: SessionToken | null): boolean {
  return session?.role === 'vendedor';
}

// Verificar se é admin
export function isAdminSession(session: SessionToken | null): boolean {
  return session?.role === 'admin';
}
