import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { getSalesRep } from '../services/salesReps';
import { 
  createSessionToken, 
  saveSession, 
  getSession, 
  clearSession, 
  isSalesRepSession,
  SessionToken 
} from '../lib/auth';

export interface User {
  id: string;
  name: string;
  role: "admin" | "salesRep";
  email: string;
}

export interface SalesRep {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  commissionPercent?: number;
  active?: boolean;
  fotoPerfil?: string;
  createdAt?: string;
}

export function useAuth() {
  const [salesRep, setSalesRep] = useState<SalesRep | null>(null);
  const [sessionToken, setSessionToken] = useState<SessionToken | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [salesRepReady, setSalesRepReady] = useState(false);

  useEffect(() => {
    // Check JWT session first (sales reps)
    const initSalesRepFromSession = async () => {
      const savedSession = getSession();
      
      if (savedSession && isSalesRepSession(savedSession)) {
        try {
          const v = await getSalesRep(savedSession.id);
          if (v && v.active) {
            setSalesRep(v);
            setSessionToken(savedSession);
          } else {
            clearSession();
          }
        } catch {
          clearSession();
        }
      }

      setSalesRepReady(true);
    };

    initSalesRepFromSession();

    // Firebase Auth listener (admin and sales rep)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Check if admin or sales rep
        const salesRepDoc = await getDoc(doc(db, 'salesReps', firebaseUser.uid));
        
        if (salesRepDoc.exists()) {
          // Vendedor — load Firestore data
          const salesRepData = salesRepDoc.data();
          setAuthenticated(true);
          setCurrentUser({
            id: firebaseUser.uid,
            name: salesRepData?.name || firebaseUser.email?.split('@')[0] || 'Vendedor',
            role: 'salesRep',
            email: firebaseUser.email || ''
          });
          
          // Add sales rep to state if missing
          if (!salesRep) {
            setSalesRep({
              id: firebaseUser.uid,
              ...salesRepData
            } as SalesRep);
          }
        } else {
          // Admin (no sales rep document)
          setAuthenticated(true);
          setCurrentUser({
            id: firebaseUser.uid,
            name: firebaseUser.email?.split('@')[0] || 'Admin',
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

  const login = async (type: 'admin' | 'salesRep', data: any, password?: string) => {
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
    } else if (type === 'salesRep') {
      // data is the sales rep object returned by login (authService)
      setSalesRep(data);
      
      // Create secure JWT (no password stored)
      const token = createSessionToken({
        id: data.id,
        name: data.name,
        email: data.email || '',
        role: 'salesRep'
      });
      
      // Persist the token only (not the full sales rep object)
      saveSession(token);
      setSessionToken(token);
      
      return { success: true };
    }
  };

  const logout = async (type: 'admin' | 'salesRep') => {
    if (type === 'admin') {
      await signOut(auth);
    } else {
      // Clear JWT session and sign out of Firebase
      clearSession();
      setSessionToken(null);
      setSalesRep(null);
      await signOut(auth).catch(console.error);
    }
  };

  return { 
    salesRep, 
    salesRepReady, 
    sessionToken,
    authenticated, 
    currentUser, 
    login, 
    logout, 
    loading 
  };
}