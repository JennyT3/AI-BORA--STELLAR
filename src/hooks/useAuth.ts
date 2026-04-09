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
    // Verificar sessão JWT primeiro (para vendedores)
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

    // Listener do Firebase Auth (para admin e vendedor)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Verificar se é admin ou vendedor
        const vendedorDoc = await getDoc(doc(db, 'vendedores', firebaseUser.uid));
        
        if (vendedorDoc.exists()) {
          // É vendedor - carregar dados do Firestore
          const vendedorData = vendedorDoc.data();
          setAuthenticated(true);
          setCurrentUser({
            id: firebaseUser.uid,
            nome: vendedorData?.nome || firebaseUser.email?.split('@')[0] || 'Vendedor',
            role: 'vendedor',
            email: firebaseUser.email || ''
          });
          
          // Se ainda não temos o vendedor no estado, adicionar
          if (!vendedor) {
            setVendedor({
              id: firebaseUser.uid,
              ...vendedorData
            } as Vendedor);
          }
        } else {
          // É admin (não tem documento em vendedores)
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
          ? 'Email ou password incorretos'
          : 'Erro ao iniciar sessão';
        return { success: false, error: msg };
      }
    } else if (type === 'vendedor') {
      // data contém o objeto vendedor retornado pelo login (do authService)
      setVendedor(data);
      
      // Criar token JWT seguro (sem password!)
      const token = createSessionToken({
        id: data.id,
        nome: data.nome,
        email: data.email || '',
        role: 'vendedor'
      });
      
      // Salvar apenas o token (não o objeto vendedor completo!)
      saveSession(token);
      setSessionToken(token);
      
      return { success: true };
    }
  };

  const logout = async (type: 'admin' | 'vendedor') => {
    if (type === 'admin') {
      await signOut(auth);
    } else {
      // Limpar sessão JWT e logout do Firebase
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