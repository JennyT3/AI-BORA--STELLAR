// ============================================
// SERVICO DE AUTENTICAÇÃO FIREBASE
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
// LOGIN DE VENDEDOR
// ============================================

export async function loginVendedor(email: string, password: string): Promise<AuthResult> {
  try {
    // Validar inputs
    if (!email || !password) {
      return { success: false, error: 'Email e password são obrigatórios' };
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Obter dados do vendedor no Firestore
    const vendedorDoc = await getDoc(doc(db, 'vendedores', userCredential.user.uid));
    
    if (!vendedorDoc.exists()) {
      // Usuário existe no Auth mas não tem documento no Firestore
      await signOut(auth);
      return { success: false, error: 'Dados do vendedor não encontrados. Contacte o administrador.' };
    }

    const vendedorData = vendedorDoc.data();

    // Verificar se está ativo
    if (!vendedorData.ativo) {
      await signOut(auth);
      return { success: false, error: 'Utilizador inativo. Contacte o administrador.' };
    }

    return { 
      success: true, 
      user: userCredential.user,
      // Retornar dados do vendedor para sessão
      vendedor: {
        id: userCredential.user.uid,
        ...vendedorData
      }
    };
  } catch (error: any) {
    console.error('Erro no login:', error.code);
    
    let errorMessage = 'Erro ao iniciar sessão';
    
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'Email inválido';
        break;
      case 'auth/user-disabled':
        errorMessage = 'Utilizador desativado';
        break;
      case 'auth/user-not-found':
        errorMessage = 'Utilizador não encontrado';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Password incorreta';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Email ou password incorretos';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Demasiadas tentativas. Tente novamente mais tarde.';
        break;
    }
    
    return { success: false, error: errorMessage };
  }
}

// ============================================
// REGISTO DE NOVO VENDEDOR
// ============================================

export async function registerVendedor(
  email: string, 
  password: string, 
  dados: VendedorAuthData
): Promise<AuthResult> {
  try {
    // Validar inputs
    if (!email || !password || !dados.nome) {
      return { success: false, error: 'Email, password e nome são obrigatórios' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password deve ter pelo menos 6 caracteres' };
    }

    // Verificar se email já existe no Firestore
    const existingQuery = await getDoc(doc(db, 'vendedores', email.toLowerCase()));
    if (existingQuery.exists()) {
      return { success: false, error: 'Já existe um vendedor com este email' };
    }

    // Criar utilizador no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Criar documento do vendedor no Firestore
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
    console.error('Erro no registo:', error.code);
    
    let errorMessage = 'Erro ao criar conta';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Este email já está em uso';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Email inválido';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password muito fraca';
        break;
    }
    
    return { success: false, error: errorMessage };
  }
}

// ============================================
// OBTER VENDEDOR ATUAL
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
// RECUPERAR PASSWORD
// ============================================

export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    if (!email) {
      return { success: false, error: 'Email é obrigatório' };
    }

    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    let errorMessage = 'Erro ao enviar email de recuperação';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Email não encontrado';
    }
    
    return { success: false, error: errorMessage };
  }
}

// ============================================
// ATUALIZAR PASSWORD
// ============================================

export async function updateVendedorPassword(
  currentPassword: string, 
  newPassword: string
): Promise<AuthResult> {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'Nova password deve ter pelo menos 6 caracteres' };
    }

    // Atualizar password no Firebase Auth
    await updatePassword(user, newPassword);
    
    return { success: true };
  } catch (error: any) {
    let errorMessage = 'Erro ao atualizar password';
    
    if (error.code === 'auth/requires-recent-login') {
      errorMessage = 'Por segurança, faça logout e login novamente antes de mudar a password';
    }
    
    return { success: false, error: errorMessage };
  }
}

// ============================================
// OBSERVADOR DE ESTADO DE AUTENTICAÇÃO
// ============================================

export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

// ============================================
// VERIFICAR SE EMAIL EXISTE
// ============================================

export async function checkEmailExists(email: string): Promise<boolean> {
  // Método simples - tenta criar conta e se falhar com "email-already-in-use"
  // Mas isso requereria API adicional. Por agora, verificamos no Firestore.
  const q = await getDoc(doc(db, 'vendedores', email.toLowerCase()));
  return q.exists();
}