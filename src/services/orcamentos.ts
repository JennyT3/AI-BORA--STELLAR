import { db, generateProposalId } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, getDocs, query, where, runTransaction } from 'firebase/firestore';

// ========== QUOTE NUMBERING ==========

const ORCAMENTO_COUNTER_KEY = 'orçamento_counter';

export async function getNextNumeroOrcamento(): Promise<string> {
  // Use a transaction to ensure a unique number
  const counterRef = doc(db, 'counters', 'orcamentos');
  
  try {
    const novoNumero = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      let currentCount = 1;
      let currentYear = new Date().getFullYear();
      
      if (counterDoc.exists()) {
        const data = counterDoc.data();
        currentCount = (data.count || 1) + 1;
        currentYear = data.ano || currentYear;
      }
      
      // New year: reset counter
      const now = new Date().getFullYear();
      if (currentYear !== now) {
        currentCount = 1;
        currentYear = now;
      }
      
      const numero = `ORC-${currentYear}-${String(currentCount).padStart(4, '0')}`;
      
      // Update counter
      transaction.set(counterRef, { 
        count: currentCount, 
        ano: currentYear,
        updatedAt: new Date().toISOString()
      });
      
      return numero;
    });
    
    return novoNumero;
  } catch (err) {
    // Simple fallback if the transaction fails
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9999) + 1;
    return `ORC-${year}-${String(random).padStart(4, '0')}`;
  }
}

export async function getNumeroOrcamentoAtual(): Promise<{ numero: string; count: number; ano: number }> {
  const counterRef = doc(db, 'counters', 'orcamentos');
  const counterDoc = await getDoc(counterRef);
  
  if (counterDoc.exists()) {
    const data = counterDoc.data();
    return {
      numero: `ORC-${data.ano || new Date().getFullYear()}-${String(data.count || 1).padStart(4, '0')}`,
      count: data.count || 1,
      ano: data.ano || new Date().getFullYear()
    };
  }
  
  return {
    numero: `ORC-${new Date().getFullYear()}-0001`,
    count: 1,
    ano: new Date().getFullYear()
  };
}

export async function resetContadorOrcamento(novoCount: number, novoAno?: number): Promise<void> {
  const counterRef = doc(db, 'counters', 'orcamentos');
  await setDoc(counterRef, {
    count: novoCount,
    ano: novoAno || new Date().getFullYear(),
    updatedAt: new Date().toISOString()
  });
}

// ========== PROPOSTAS WITH VENDEDOR ==========

export async function createProposal(data: any): Promise<string> {
  const id = generateProposalId();
  
  // If vendedor is set, assign the next number automatically
  let numeroOrcamento = data.numeroOrcamento;
  if (data.vendedorId && !numeroOrcamento) {
    numeroOrcamento = await getNextNumeroOrcamento();
  }
  
  const docData = {
    ...data,
    numeroOrcamento: numeroOrcamento || data.numeroOrcamento,
    createdAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  await setDoc(doc(db, 'propostas', id), docData);
  return id;
}

// List propostas for a specific vendedor
export async function listProposalsByVendedor(vendedorId: string): Promise<any[]> {
  const q = query(
    collection(db, 'propostas'), 
    where('vendedorId', '==', vendedorId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// List all propostas (admin)
export async function listAllProposals(): Promise<any[]> {
  const snapshot = await getDocs(collection(db, 'propostas'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}