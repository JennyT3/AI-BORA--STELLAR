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
  const [tareas, setTasks] = useState<Tarea[]>([]);
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
        setTasks(tasks);
      } catch (err) {
        console.error("Error loading tasks:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [proposalId]);

  const handleAssignMe = async (taskId: string) => {
    try {
      // In a real app, we'd get the current user ID. For now, let's use a mock or prompt.
      const colabName = prompt("Enter your name to assign the task:");
      if (!colabName) return;

      await updateTarea(taskId, {
        estado: 'atribuida',
        asignadoNombre: colabName,
        dataAtribuicao: new Date().toISOString()
      });

      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, estado: 'atribuida', asignadoNombre: colabName } : t
      ));
      alert("Task assigned successfully.");
    } catch (err) {
      alert("Error assigning task.");
    }
  };

  const handleSendPaymentLink = () => {
    setCopying(true);
    const paymentLink = `${window.location.origin}/payment-flow/${proposalId}`;
    navigator.clipboard.writeText(paymentLink).then(() => {
      alert("Payment flow link copied to clipboard!\n\n" + paymentLink);
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
            <h1 style={styles.title}>Proposal Services</h1>
            <p style={styles.subtitle}>Proposal: {proposal?.numeroOrcamento || proposalId} - Client: {proposal?.cliente}</p>
          </div>
          <button 
            onClick={handleSendPaymentLink}
            style={styles.btnPayment}
          >
            <Send size={18} />
            {copying ? 'Copying...' : 'Send Payment Link to Client'}
          </button>
        </div>
      </div>

      <div style={styles.tasksContainer}>
        <h2 style={styles.sectionTitle}>Available Services</h2>
        
        {tareas.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>No services created for this proposal.</p>
        ) : (
          tareas.map(task => (
            <div key={task.id} style={styles.taskCard}>
              <div style={styles.taskHeader}>
                <div>
                  <h3 style={styles.taskTitle}>{task.titulo}</h3>
                  <p style={styles.taskDesc}>{task.descricao}</p>
                </div>
                <div style={{ ...styles.statusBadge, ...getStatusStyle(task.estado) }}>
                  {task.estado.replace('_', ' ')}
                </div>
              </div>
              
              <div style={styles.taskInfo}>
                <div>
                  <p style={styles.taskLabel}>Client Price</p>
                  <p style={styles.taskAmount}>${task.valorCliente || 0}</p>
                </div>
                <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.05)', padding: '12px 20px', borderRadius: 12, border: '1px dashed #22c55e' }}>
                  <p style={styles.taskLabel}>Your Commission (30%)</p>
                  <p style={{ ...styles.taskAmount, color: '#22c55e' }}>${((task.valorCliente || 0) * 0.3).toFixed(2)}</p>
                </div>
              </div>
              
              {task.estado === 'disponivel' ? (
                <button
                  onClick={() => handleAssignMe(task.id)}
                  style={styles.btnAccept}
                >
                  Assign Me
                </button>
              ) : (
                <div style={styles.assignedInfo}>
                  Assigned to: <strong>{task.asignadoNombre || 'Collaborator'}</strong>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div style={styles.infoBanner}>
        <div style={{ fontSize: 24 }}>⭐</div>
        <div>
          <p style={styles.infoTitle}>Automatic 70/30 Distribution</p>
          <p style={styles.infoText}>
            When using the payment link, the client pays in USDC via Stellar. 
            The <strong>PaymentSplitter</strong> contract will send 70% to the company and 30% directly to your wallet once the task is completed.
          </p>
        </div>
      </div>
    </div>
  );
}

function getStatusStyle(status: string) {
  const styles: Record<string, any> = {
    disponivel: { backgroundColor: '#eff6ff', color: '#1d4ed8' },
    available: { backgroundColor: '#eff6ff', color: '#1d4ed8' },
    atribuida: { backgroundColor: '#fef3c7', color: '#92400e' },
    assigned: { backgroundColor: '#fef3c7', color: '#92400e' },
    paga: { backgroundColor: '#f0fdf4', color: '#166534' },
    paid: { backgroundColor: '#f0fdf4', color: '#166534' },
  };
  return styles[status] || styles.disponivel;
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
  tasksContainer: {
    maxWidth: 800,
    margin: '0 auto 40px',
  },
  sectionTitle: {
    fontWeight: 900,
    fontSize: 20,
    marginBottom: 24,
    color: '#1b1c1b',
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    marginBottom: 24,
    boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
    border: '1px solid rgba(0,0,0,0.02)',
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  taskTitle: {
    fontWeight: 800,
    fontSize: 22,
    color: '#1b1c1b',
    margin: 0,
  },
  taskDesc: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    lineHeight: 1.5,
  },
  statusBadge: {
    padding: '6px 14px',
    borderRadius: 100,
    fontSize: 11,
    fontWeight: 800,
    textTransform: 'uppercase' as const,
  },
  taskInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 40,
    marginBottom: 32,
    padding: '20px',
    backgroundColor: '#fcf9f7',
    borderRadius: 20,
  },
  taskLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: 800,
    textTransform: 'uppercase' as const,
    marginBottom: 4,
  },
  taskAmount: {
    fontWeight: 900,
    fontSize: 28,
    color: '#1b1c1b',
    margin: 0,
  },
  btnAccept: {
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
  assignedInfo: {
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