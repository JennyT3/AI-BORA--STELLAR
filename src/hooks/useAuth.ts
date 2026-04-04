import { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getVendedor, Vendedor } from '../services/vendedores';
import { app } from '../services/firebase';

const auth = getAuth(app);

export interface User {
  id: string;
  nome: string;
  role: "admin" | "user";
  email: string;
}

export function useAuth() {
  const [vendedor, setVendedor] = useState<Vendedor | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setAuthenticated(true);
        setCurrentUser({
          id: firebaseUser.uid,
          nome: firebaseUser.email?.split('@')[0] || 'Admin',
          role: 'admin',
          email: firebaseUser.email || ''
        });
      } else {
        setAuthenticated(false);
        setCurrentUser(null);
      }
      setLoading(false);
    });

    const checkVendedor = async () => {
      const params = new URLSearchParams(window.location.search);
      const adminMode = params.get("admin") === "true";
      const vendedorId = params.get("vendedor");
      const savedVendedor = localStorage.getItem("vendedorUser");

      if (adminMode && vendedorId) {
        try {
          const v = await getVendedor(vendedorId);
          if (v) {
            setVendedor(v);
            localStorage.setItem("vendedorUser", JSON.stringify(v));
          }
        } catch (err) {
          console.error("Erro ao carregar vendedor:", err);
        }
      } else if (savedVendedor) {
        setVendedor(JSON.parse(savedVendedor));
      }
    };

    checkVendedor();
    return () => unsubscribe();
  }, []);

  const login = async (type: 'admin' | 'vendedor', data: any, password?: string) => {
    if (type === 'admin') {
      try {
        await signInWithEmailAndPassword(auth, data, password!);
        return { success: true };
      } catch (err: any) {
        const msg = err.code === 'auth/invalid-credential'
          ? 'Email ou password incorretos'
          : 'Erro ao iniciar sessão';
        return { success: false, error: msg };
      }
    } else if (type === 'vendedor') {
      setVendedor(data);
      localStorage.setItem("vendedorUser", JSON.stringify(data));
      return { success: true };
    }
  };

  const logout = async (type: 'admin' | 'vendedor') => {
    if (type === 'admin') {
      await signOut(auth);
    } else {
      localStorage.removeItem("vendedorUser");
      setVendedor(null);
    }
  };

  return { vendedor, authenticated, currentUser, login, logout, loading };
}
