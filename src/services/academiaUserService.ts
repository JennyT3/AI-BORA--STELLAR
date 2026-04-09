import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  limit as firestoreLimit
} from 'firebase/firestore';

export interface AcademiaUser {
  id: string;
  email: string;
  nome: string;
  role: 'colaborador' | 'cliente';
  tipo_negocio?: string;
  onboarding_completo: boolean;
  created_at: string;
  updated_at: string;
}

export interface AcademiaProgresso {
  id?: string;
  user_id: string;
  aula_id: string;
  trilha_id: string;
  trilha_nome?: string;
  aula_titulo?: string;
  concluida: boolean;
  percentagem: number;
  updated_at: string;
}

export interface AcademiaCertificado {
  id?: string;
  user_id: string;
  trilha_id: string;
  trilha_nome: string;
  data_conclusao: string;
  codigo_verificacao: string;
}

const COLECAO_USERS = 'academia_users';
const COLECAO_PROGRESSO = 'academia_progresso';
const COLECAO_CERTIFICADOS = 'academia_certificados';

// ============================================
// USER
// ============================================

export async function syncUsuario(clerkUser: {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  publicMetadata?: Record<string, any>;
}): Promise<AcademiaUser> {
  try {
    const userId = clerkUser.id;
    const userRef = doc(db, COLECAO_USERS, userId);
    const existingDoc = await getDoc(userRef);
    
    if (existingDoc.exists()) {
      return existingDoc.data() as AcademiaUser;
    }
    
    const nomeCompleto = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || clerkUser.email.split('@')[0];
    const clerkRole = clerkUser.publicMetadata?.role as string | undefined;
    const role: 'colaborador' | 'cliente' = clerkRole === 'colaborador' ? 'colaborador' : 'cliente';
    
    const novoUsuario: AcademiaUser = {
      id: userId,
      email: clerkUser.email,
      nome: nomeCompleto,
      role,
      onboarding_completo: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await setDoc(userRef, novoUsuario);
    return novoUsuario;
  } catch (e) {
    console.warn('Bypass: syncUsuario simulated');
    return {
      id: clerkUser.id,
      email: clerkUser.email,
      nome: clerkUser.firstName || 'User',
      role: 'cliente',
      onboarding_completo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
}

export async function updateUsuario(
  userId: string, 
  datos: Partial<Pick<AcademiaUser, 'nome' | 'tipo_negocio' | 'onboarding_completo'>>
): Promise<void> {
  try {
    const userRef = doc(db, COLECAO_USERS, userId);
    await updateDoc(userRef, { ...datos, updated_at: new Date().toISOString() });
  } catch (e) {
    console.warn('Bypass: updateUsuario simulated');
  }
}

export async function completeOnboarding(userId: string): Promise<void> {
  await updateUsuario(userId, { onboarding_completo: true });
}

// ============================================
// PROGRESS
// ============================================

export async function saveProgresso(
  userId: string,
  aulaId: string,
  trilhaId: string,
  trilhaNome: string,
  aulaTitulo: string,
  concluida: boolean,
  percentagem: number
): Promise<void> {
  try {
    const q = query(
      collection(db, COLECAO_PROGRESSO),
      where('user_id', '==', userId),
      where('aula_id', '==', aulaId),
      where('trilha_id', '==', trilhaId),
      firestoreLimit(1)
    );
    const existing = await getDocs(q);
    const progressoData: AcademiaProgresso = {
      user_id: userId,
      aula_id: aulaId,
      trilha_id: trilhaId,
      trilha_nome: trilhaNome,
      aula_titulo: aulaTitulo,
      concluida,
      percentagem,
      updated_at: new Date().toISOString(),
    };
    if (!existing.empty) {
      await updateDoc(doc(db, COLECAO_PROGRESSO, existing.docs[0].id), progressoData as any);
    } else {
      const progressoRef = doc(collection(db, COLECAO_PROGRESSO));
      await setDoc(progressoRef, { ...progressoData, id: progressoRef.id });
    }
  } catch (e) {
    console.warn('Bypass: saveProgresso simulated');
  }
}

export async function getProgressoTrilha(userId: string, trilhaId: string): Promise<AcademiaProgresso[]> {
  try {
    const q = query(collection(db, COLECAO_PROGRESSO), where('user_id', '==', userId), where('trilha_id', '==', trilhaId), orderBy('updated_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as AcademiaProgresso);
  } catch (e) {
    return [];
  }
}

export async function getAllProgresso(userId: string): Promise<AcademiaProgresso[]> {
  try {
    const q = query(collection(db, COLECAO_PROGRESSO), where('user_id', '==', userId), orderBy('updated_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as AcademiaProgresso);
  } catch (e) {
    return [];
  }
}

// ============================================
// CERTIFICATES
// ============================================

export async function criarCertificado(userId: string, trilhaId: string, trilhaNome: string): Promise<AcademiaCertificado> {
  const certificado: AcademiaCertificado = {
    user_id: userId,
    trilha_id: trilhaId,
    trilha_nome: trilhaNome,
    data_conclusao: new Date().toISOString(),
    codigo_verificacao: Math.random().toString(36).substring(2, 10).toUpperCase(),
  };
  try {
    const certRef = doc(collection(db, COLECAO_CERTIFICADOS));
    await setDoc(certRef, { ...certificado, id: certRef.id });
    return { ...certificado, id: certRef.id };
  } catch (e) {
    console.warn('Bypass: criarCertificado simulated');
    return { ...certificado, id: 'mock-id' };
  }
}

export async function getCertificadosUser(userId: string): Promise<AcademiaCertificado[]> {
  try {
    const q = query(collection(db, COLECAO_CERTIFICADOS), where('user_id', '==', userId), orderBy('data_conclusao', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as AcademiaCertificado);
  } catch (e) {
    return [];
  }
}

export async function verificarCertificado(codigo: string): Promise<AcademiaCertificado | null> {
  try {
    const q = query(
      collection(db, COLECAO_CERTIFICADOS),
      where('codigo_verificacao', '==', codigo),
      firestoreLimit(1)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].data() as AcademiaCertificado;
    }
    return null;
  } catch (e) {
    console.warn('Bypass: verificarCertificado simulated');
    return null;
  }
}

export async function getEstatisticasUsuario(userId: string): Promise<{
  aulas_concluidas: number;
  trilhas_iniciadas: number;
  certificados: number;
  percentual_geral: number;
}> {
  try {
    const progressos = await getAllProgresso(userId);
    const certificados = await getCertificadosUser(userId);
    const aulasConcluidas = progressos.filter(p => p.concluida).length;
    const trilhasIniciadas = new Set(progressos.map(p => p.trilha_id)).size;
    return {
      aulas_concluidas: aulasConcluidas,
      trilhas_iniciadas: trilhasIniciadas,
      certificados: certificados.length,
      percentual_geral: trilhasIniciadas > 0 ? Math.round((aulasConcluidas / (trilhasIniciadas * 10)) * 100) : 0,
    };
  } catch (e) {
    return { aulas_concluidas: 0, trilhas_iniciadas: 0, certificados: 0, percentual_geral: 0 };
  }
}
