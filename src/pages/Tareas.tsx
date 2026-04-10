import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Loader2, CheckCircle, Clock, Wallet, Send, ExternalLink } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Tarea, updateTarea } from '../services/tareas';

export default function TareasPage() {
  const [match, params] = useRoute('/tareas/:id');
  const [, setLocation] = useLocation();
  const proposalId = params?.id;

  const [loading, setLoading] = useState(true);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [proposal, setProposal] = useState<any>(null);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!proposalId) return;
      try {
        // Load proposal
        const propSnap = await getDoc(doc(db, 'proposals', proposalId));
        if (propSnap.exists()) {
          setProposal(propSnap.data());
        }

        // Load tasks for this proposal
        const q = query(collection(db, 'tareas'), where('propostaId', '==', proposalId));
        const snap = await getDocs(q);
        const tasks = snap.docs.map(d => ({ id: d.id, ...d.data() } as Tarea));
        setTareas(tasks);
      } catch (err) {
        console.error("Error loading tasks:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [proposalId]);

  const handleAsignarme = async (tareaId: string) => {
    try {
      // In a real app, we'd get the current user ID. For now, let's use a mock or prompt.
      const colabName = prompt("Introduce tu nombre para asignarte la tarea:");
      if (!colabName) return;

      await updateTarea(tareaId, {
        estado: 'atribuida',
        asignadoNombre: colabName,
        dataAtribuicao: new Date().toISOString()
      });

      setTareas(prev => prev.map(t => 
        t.id === tareaId ? { ...t, estado: 'atribuida', asignadoNombre: colabName } : t
      ));
      alert("Tarea asignada correctamente.");
    } catch (err) {
      alert("Error al asignar tarea.");
    }
  };

  const handleSendPaymentLink = () => {
    setCopying(true);
    const paymentLink = `${window.location.origin}/pagamento/${proposalId}`;
    navigator.clipboard.writeText(paymentLink).then(() => {
      alert("¡Link de pago copiado al portapapeles!\n\n" + paymentLink);
      setCopying(false);
    });
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#F25C05' }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <div style={styles.logo}>AI BORA</div>
            <h1 style={styles.title}>Servicios de la Propuesta</h1>
            <p style={styles.subtitle}>Propuesta: {proposal?.numeroOrcamento || proposalId} - Cliente: {proposal?.cliente}</p>
          </div>
          <button 
            onClick={handleSendPaymentLink}
            style={styles.btnPayment}
          >
            <Send size={18} />
            {copying ? 'Copiando...' : 'Enviar Link de Pago al Cliente'}
          </button>
        </div>
      </div>

      <div style={styles.tareasContainer}>
        <h2 style={styles.sectionTitle}>Servicios Disponibles</h2>
        
        {tareas.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>No hay servicios creados para esta propuesta.</p>
        ) : (
          tareas.map(tarea => (
            <div key={tarea.id} style={styles.tareaCard}>
              <div style={styles.tareaHeader}>
                <div>
                  <h3 style={styles.tareaTitulo}>{tarea.titulo}</h3>
                  <p style={styles.tareaDesc}>{tarea.descricao}</p>
                </div>
                <div style={{ ...styles.estadoBadge, ...getEstadoStyle(tarea.estado) }}>
                  {tarea.estado.replace('_', ' ')}
                </div>
              </div>
              
              <div style={styles.tareaInfo}>
                <div>
                  <p style={styles.tareaLabel}>Precio Cliente</p>
                  <p style={styles.tareaMonto}>€{tarea.valorCliente || 0}</p>
                </div>
                <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.05)', padding: '12px 20px', borderRadius: 12, border: '1px dashed #22c55e' }}>
                  <p style={styles.tareaLabel}>Tu Comisión (30%)</p>
                  <p style={{ ...styles.tareaMonto, color: '#22c55e' }}>€{((tarea.valorCliente || 0) * 0.3).toFixed(2)}</p>
                </div>
              </div>
              
              {tarea.estado === 'disponivel' ? (
                <button
                  onClick={() => handleAsignarme(tarea.id)}
                  style={styles.btnAceptar}
                >
                  Asignarme
                </button>
              ) : (
                <div style={styles.asignadaInfo}>
                  Asignada a: <strong>{tarea.asignadoNombre || 'Colaborador'}</strong>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div style={styles.infoBanner}>
        <div style={{ fontSize: 24 }}>⭐</div>
        <div>
          <p style={styles.infoTitle}>Distribución Automática 70/30</p>
          <p style={styles.infoText}>
            Al usar el link de pago, el cliente paga en USDC vía Stellar. 
            El contrato <strong>PaymentSplitter</strong> enviará el 70% a la administración y el 30% directamente a tu wallet una vez completada la tarea.
          </p>
        </div>
      </div>
    </div>
  );
}

function getStatusStyle(estado: string) {
  const styles: Record<string, any> = {
    disponivel: { backgroundColor: '#eff6ff', color: '#1d4ed8' },
    atribuida: { backgroundColor: '#fef3c7', color: '#92400e' },
    paga: { backgroundColor: '#f0fdf4', color: '#166534' },
  };
  return styles[estado] || styles.disponivel;
}

const styles = {
  center: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fcf9f7',
  } as const,
  container: {
    minHeight: '100vh',
    backgroundColor: '#fcf9f7',
    padding: '40px 60px',
    fontFamily: 'Montserrat, sans-serif',
  } as const,
  header: {
    marginBottom: 40,
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    paddingBottom: 24,
  } as const,
  logo: {
    fontWeight: 900,
    fontSize: 12,
    color: '#F25C05',
    letterSpacing: '0.3em',
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  },
  title: {
    fontWeight: 900,
    fontSize: 32,
    color: '#1b1c1b',
    margin: 0,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 4,
    fontWeight: 600,
  },
  btnPayment: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F22283',
    color: '#fff',
    border: 'none',
    padding: '16px 32px',
    borderRadius: 16,
    fontSize: 16,
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(242, 34, 131, 0.25)',
    transition: 'all 0.2s',
  },
  tareasContainer: {
    maxWidth: 800,
    margin: '0 auto 40px',
  },
  sectionTitle: {
    fontWeight: 900,
    fontSize: 20,
    marginBottom: 24,
    color: '#1b1c1b',
  },
  tareaCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    marginBottom: 24,
    boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
    border: '1px solid rgba(0,0,0,0.02)',
  },
  tareaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  tareaTitulo: {
    fontWeight: 800,
    fontSize: 22,
    color: '#1b1c1b',
    margin: 0,
  },
  tareaDesc: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    lineHeight: 1.5,
  },
  estadoBadge: {
    padding: '6px 14px',
    borderRadius: 100,
    fontSize: 11,
    fontWeight: 800,
    textTransform: 'uppercase' as const,
  },
  tareaInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 40,
    marginBottom: 32,
    padding: '20px',
    backgroundColor: '#fcf9f7',
    borderRadius: 20,
  },
  tareaLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: 800,
    textTransform: 'uppercase' as const,
    marginBottom: 4,
  },
  tareaMonto: {
    fontWeight: 900,
    fontSize: 28,
    color: '#1b1c1b',
    margin: 0,
  },
  btnAceptar: {
    width: '100%',
    padding: '18px',
    backgroundColor: '#1b1c1b',
    color: '#fff',
    border: 'none',
    borderRadius: 16,
    fontSize: 16,
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  asignadaInfo: {
    textAlign: 'center' as const,
    padding: '18px',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    color: '#64748b',
    fontSize: 15,
  },
  infoBanner: {
    maxWidth: 800,
    margin: '0 auto',
    backgroundColor: '#eff6ff',
    borderRadius: 24,
    padding: 32,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 20,
    border: '1px solid rgba(59, 130, 246, 0.1)',
  },
  infoTitle: {
    fontWeight: 800,
    fontSize: 16,
    color: '#1d4ed8',
    margin: '0 0 8px 0',
  },
  infoText: {
    fontSize: 14,
    color: '#3b82f6',
    lineHeight: 1.6,
    margin: 0,
    fontWeight: 500,
  },
};
