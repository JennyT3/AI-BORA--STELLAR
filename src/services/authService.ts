// ============================================
// FIREBASE AUTHENTICATION SERVICE
// ============================================

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface VendedorAuthData {
  nome: string;
  email: string;
  telefone?: string;
  comissaoPercent?: number;
  fotoPerfil?: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: FirebaseUser;
}

// ============================================
// VENDEDOR LOGIN
// ============================================

export async function loginVendedor(email: string, password: string): Promise<AuthResult> {
  try {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    const vendedorDoc = await getDoc(doc(db, 'vendedores', userCredential.user.uid));
    
    if (!vendedorDoc.exists()) {
      await signOut(auth);
      return { success: false, error: 'Vendor data not found. Contact the administrator.' };
    }

    const vendedorData = vendedorDoc.data();

    if (!vendedorData.ativo) {
      await signOut(auth);
      return { success: false, error: 'Account inactive. Contact the administrator.' };
    }

    return { 
      success: true, 
      user: userCredential.user,
      vendedor: {
        id: userCredential.user.uid,
        ...vendedorData
      }
    };
  } catch (error: any) {
    console.error('Login error:', error.code);
    
    let errorMessage = 'Could not sign in';
    
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'Invalid email';
        break;
      case 'auth/user-disabled':
        errorMessage = 'Account disabled';
        break;
      case 'auth/user-not-found':
        errorMessage = 'User not found';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Incorrect email or password';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many attempts. Try again later.';
        break;
    }
    
    return { success: false, error: errorMessage };
  }
}

// ============================================
// REGISTER NEW VENDEDOR
// ============================================

export async function registerVendedor(
  email: string, 
  password: string, 
  dados: VendedorAuthData
): Promise<AuthResult> {
  try {
    if (!email || !password || !dados.nome) {
      return { success: false, error: 'Email, password, and name are required' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const existingQuery = await getDoc(doc(db, 'vendedores', email.toLowerCase()));
    if (existingQuery.exists()) {
      return { success: false, error: 'A vendor with this email already exists' };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, 'vendedores', userCredential.user.uid), {
      ...dados,
      email: email.toLowerCase(),
      ativo: true,
      authMigrated: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return { 
      success: true, 
      user: userCredential.user 
    };
  } catch (error: any) {
    console.error('Registration error:', error.code);
    
    let errorMessage = 'Could not create account';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already in use';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak';
        break;
    }
    
    return { success: false, error: errorMessage };
  }
}

// ============================================
// GET CURRENT VENDEDOR
// ============================================

export async function getCurrentVendedor(): Promise<VendedorAuthData | null> {
  const user = auth.currentUser;
  
  if (!user) {
    return null;
  }

  const vendedorDoc = await getDoc(doc(db, 'vendedores', user.uid));
  
  if (!vendedorDoc.exists()) {
    return null;
  }

  return {
    id: vendedorDoc.id,
    ...vendedorDoc.data()
  } as VendedorAuthData;
}

// ============================================
// LOGOUT
// ============================================

export async function logoutVendedor(): Promise<void> {
  await signOut(auth);
}

// ============================================
// PASSWORD RESET
// ============================================

export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    if (!email) {
      return { success: false, error: 'Email is required' };
    }

    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    let errorMessage = 'Could not send recovery email';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Email not found';
    }
    
    return { success: false, error: errorMessage };
  }
}

// ============================================
// UPDATE PASSWORD
// ============================================

export async function updateVendedorPassword(
  currentPassword: string, 
  newPassword: string
): Promise<AuthResult> {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return { success: false, error: 'Not signed in' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters' };
    }

    await updatePassword(user, newPassword);
    
    return { success: true };
  } catch (error: any) {
    let errorMessage = 'Could not update password';
    
    if (error.code === 'auth/requires-recent-login') {
      errorMessage = 'For security, sign out and sign in again before changing your password';
    }
    
    return { success: false, error: errorMessage };
  }
}

// ============================================
// AUTH STATE OBSERVER
// ============================================

export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

// ============================================
// CHECK IF EMAIL EXISTS
// ============================================

export async function checkEmailExists(email: string): Promise<boolean> {
  const q = await getDoc(doc(db, 'vendedores', email.toLowerCase()));
  return q.exists();
}
