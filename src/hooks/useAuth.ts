import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { getVendedor } from '../services/vendedores';
import { 
  createSessionToken, 
  saveSession, 
  getSession, 
  clearSession, 
  isVendedorSession,
  SessionToken 
} from '../lib/auth';

export interface User {
  id: string;
  nome: string;
  role: "admin" | "vendedor";
  email: string;
}

export interface Vendedor {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  comissaoPercent?: number;
  ativo?: boolean;
  fotoPerfil?: string;
  createdAt?: string;
}

export function useAuth() {
  const [vendedor, setVendedor] = useState<Vendedor | null>(null);
  const [sessionToken, setSessionToken] = useState<SessionToken | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [vendedorReady, setVendedorReady] = useState(false);

  useEffect(() => {
    // Check JWT session first (vendedores)
    const initVendedorFromSession = async () => {
      const savedSession = getSession();
      
      if (savedSession && isVendedorSession(savedSession)) {
        try {
          const v = await getVendedor(savedSession.id);
          if (v && v.ativo) {
            setVendedor(v);
            setSessionToken(savedSession);
          } else {
            clearSession();
          }
        } catch {
          clearSession();
        }
      }

      setVendedorReady(true);
    };

    initVendedorFromSession();

    // Firebase Auth listener (admin and vendedor)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Check if admin or vendedor
        const vendedorDoc = await getDoc(doc(db, 'vendedores', firebaseUser.uid));
        
        if (vendedorDoc.exists()) {
          // Vendedor — load Firestore data
          const vendedorData = vendedorDoc.data();
          setAuthenticated(true);
          setCurrentUser({
            id: firebaseUser.uid,
            nome: vendedorData?.nome || firebaseUser.email?.split('@')[0] || 'Vendedor',
            role: 'vendedor',
            email: firebaseUser.email || ''
          });
          
          // Add vendedor to state if missing
          if (!vendedor) {
            setVendedor({
              id: firebaseUser.uid,
              ...vendedorData
            } as Vendedor);
          }
        } else {
          // Admin (no vendedores document)
          setAuthenticated(true);
          setCurrentUser({
            id: firebaseUser.uid,
            nome: firebaseUser.email?.split('@')[0] || 'Admin',
            role: 'admin',
            email: firebaseUser.email || ''
          });
        }
      } else {
        setAuthenticated(false);
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (type: 'admin' | 'vendedor', data: any, password?: string) => {
    if (type === 'admin') {
      try {
        await signInWithEmailAndPassword(auth, data, password!);
        return { success: true };
      } catch (err: any) {
        const msg = err.code === 'auth/invalid-credential'
          ? 'Incorrect email or password'
          : 'Could not sign in';
        return { success: false, error: msg };
      }
    } else if (type === 'vendedor') {
      // data is the vendedor object returned by login (authService)
      setVendedor(data);
      
      // Create secure JWT (no password stored)
      const token = createSessionToken({
        id: data.id,
        nome: data.nome,
        email: data.email || '',
        role: 'vendedor'
      });
      
      // Persist token only (not the full vendedor object)
      saveSession(token);
      setSessionToken(token);
      
      return { success: true };
    }
  };

  const logout = async (type: 'admin' | 'vendedor') => {
    if (type === 'admin') {
      await signOut(auth);
    } else {
      // Clear JWT session and sign out of Firebase
      clearSession();
      setSessionToken(null);
      setVendedor(null);
      await signOut(auth).catch(console.error);
    }
  };

  return { 
    vendedor, 
    vendedorReady, 
    sessionToken,
    authenticated, 
    currentUser, 
    login, 
    logout, 
    loading 
  };
}