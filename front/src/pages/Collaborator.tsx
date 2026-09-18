import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Loader2, CheckCircle, Clock, TrendingUp, Wallet, ExternalLink, Send } from 'lucide-react';
import PollarPayoutModal from '../components/PollarPayoutModal';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Task, TaskStatus, startTask, executeTask, deliverTask, TASK_STATUSES } from '../services/tasks';

export default function CollaboratorPage() {
  const [, params] = useRoute('/collaborator/:id');

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [collaboratorId, setCollaboratorId] = useState<string | null>(null);
  const [collaboratorName, setCollaboratorName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showPollar, setShowPollar] = useState(false);

  useEffect(() => {
    const id = params?.id;
    
    if (id && id !== 'demo') {
      setCollaboratorId(id);
      loadCollaboratorData(id);
    } else {
      loadDemoData();
    }
  }, [params?.id]);

  const loadDemoData = () => {
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Social Media Management',
        clientName: 'Company ABC',
        clientId: 'client-1',
        status: 'assigned',
        clientAmount: 500,
        prazo: '2026-04-15',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Logo Design',
        clientName: 'Startup XYZ',
        clientId: 'client-2',
        status: 'in_progress',
        clientAmount: 300,
        prazo: '2026-04-12',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Reels Creation',
        clientName: 'Shop 123',
        clientId: 'client-3',
        status: 'in_revision',
        clientAmount: 200,
        prazo: '2026-04-10',
        createdAt: new Date().toISOString(),
      },
    ];
    setTasks(mockTasks.filter(t => t.status !== 'available'));
    setAvailableTasks([]);
    setTotalEarned(850);
    setLoading(false);
    setCollaboratorName('Demo User');
  };

  const loadCollaboratorData = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // Load tasks assigned to this collaborator
      const q = query(
        collection(db, 'tasks'),
        where('asignadaA', '==', id),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const assignedTasks = snap.docs.map(d => ({ id: d.id, ...d.data() } as Task));
      
      // Load available tasks (disponivel)
      const qAvailable = query(
        collection(db, 'tasks'),
        where('status', '==', 'available'),
        orderBy('createdAt', 'desc')
      );
      const snapAvailable = await getDocs(qAvailable);
      const available = snapAvailable.docs.map(d => ({ id: d.id, ...d.data() } as Task));
      
      setTasks(assignedTasks);
      setAvailableTasks(available);
      
      // Calculate total earned from paid tasks
      const paidTasks = assignedTasks.filter(t => t.status === 'paid');
      const earned = paidTasks.reduce((sum, t) => {
        const commission = t.collaboratorCommissionAmount || (t.clientAmount || 0) * 0.3;
        return sum + commission;
      }, 0);
      setTotalEarned(earned);
      
    } catch (err: any) {
      console.error('Error loading collaborator data:', err);
      setError('Could not load your tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async (taskId: string) => {
    try {
      await startTask(taskId);
      loadCollaboratorData(collaboratorId!);
    } catch (err) {
      alert('Error starting task. Please try again.');
    }
  };

  const handleMarkInProgress = async (taskId: string) => {
    try {
      await executeTask(taskId);
      loadCollaboratorData(collaboratorId!);
    } catch (err) {
      alert('Error updating task. Please try again.');
    }
  };

  const handleDeliver = async (taskId: string) => {
    const links = prompt('Enter delivery links (comma separated):');
    if (!links) return;
    
    try {
      await deliverTask(taskId, [], links.split(',').map(l => l.trim()));
      loadCollaboratorData(collaboratorId!);
    } catch (err) {
      alert('Error delivering task. Please try again.');
    }
  };

  const getStatusStyle = (status: TaskStatus) => {
    const statusInfo = TASK_STATUSES.find(e => e.value === status);
    return {
      backgroundColor: statusInfo?.color ? `${statusInfo.color}20` : '#f3f4f6',
      color: statusInfo?.color || '#6b7280',
    };
  };

  const getStatusLabel = (status: TaskStatus) => {
    const statusInfo = TASK_STATUSES.find(e => e.value === status);
    return statusInfo?.label || status;
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#F25C05' }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.center}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <p style={{ color: '#dc2626', marginBottom: 16 }}>{error}</p>
          <button onClick={() => loadCollaboratorData(collaboratorId!)} style={styles.btnRetry}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const inProgressTasks = tasks.filter(t => ['assigned', 'in_analysis', 'in_progress'].includes(t.status));
  const reviewTasks = tasks.filter(t => t.status === 'in_revision');
  const paidTasks = tasks.filter(t => t.status === 'paid');

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={styles.logo}>AI BORA</div>
          <div>
            <h1 style={styles.title}>Collaborator Dashboard</h1>
            <p style={styles.subtitle}>
              {collaboratorName ? `Welcome, ${collaboratorName}` : 'Your work, your payment — all on blockchain'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <Wallet size={24} color="#F25C05" />
          <div>
            <p style={styles.statLabel}>Total Earned</p>
            <p style={styles.statValue}>${totalEarned.toFixed(2)}</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <CheckCircle size={24} color="#22c55e" />
          <div>
            <p style={styles.statLabel}>Paid Tasks</p>
            <p style={styles.statValue}>{paidTasks.length}</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <Clock size={24} color="#3b82f6" />
          <div>
            <p style={styles.statLabel}>In Review</p>
            <p style={styles.statValue}>{reviewTasks.length}</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <TrendingUp size={24} color="#8b5cf6" />
          <div>
            <p style={styles.statLabel}>In Progress</p>
            <p style={styles.statValue}>{inProgressTasks.length}</p>
          </div>
        </div>
      </div>

      {/* Payout */}
      <div style={styles.payoutCard}>
        <div>
          <p style={styles.payoutTitle}>Made money? Turn your 30% USDC into local currency.</p>
          <p style={styles.payoutText}>
            Withdraw directly to Mobile Money, PIX, SPEI, PSE, ACH or bank account via Pollar —
            powered by SEP-24 Stellar ramps (Africa ↔ LatAm).
          </p>
        </div>
        <button onClick={() => setShowPollar(true)} style={styles.btnPayout}>
          <Send size={16} /> Cash out with Pollar
        </button>
      </div>

      {/* Available Tasks */}
      {availableTasks.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Available Tasks ({availableTasks.length})</h2>
          <p style={styles.sectionSubtitle}>Request to work on these tasks. Admin will approve your request.</p>
          
          {availableTasks.map(task => (
            <div key={task.id} style={styles.taskCard}>
              <div style={styles.taskHeader}>
                <div>
                  <h3 style={styles.taskTitle}>{task.title}</h3>
                  <p style={styles.taskClient}>Client: {task.clientName || 'Unknown'}</p>
                </div>
                <div style={{ ...styles.statusBadge, ...getStatusStyle(task.status) }}>
                  {getStatusLabel(task.status)}
                </div>
              </div>

              <div style={styles.taskInfo}>
                <div>
                  <p style={styles.taskLabel}>Client Price</p>
                  <p style={styles.taskAmount}>${task.clientAmount || 0}</p>
                  <p style={styles.taskCommission}>Your 30%: ${((task.clientAmount || 0) * 0.3).toFixed(2)}</p>
                </div>
                <div>
                  <p style={styles.taskLabel}>Deadline</p>
                  <p style={styles.taskDate}>{task.prazo || 'Flexible'}</p>
                </div>
              </div>

              <button 
                onClick={() => {
                  const name = prompt('Enter your name to request this task:');
                  if (name) {
                    import('../services/tasks').then(({ requestTask }) => {
                      requestTask(task.id, collaboratorId || 'demo', name);
                      alert('Request sent! Wait for admin approval.');
                      loadCollaboratorData(collaboratorId!);
                    });
                  }
                }}
                style={styles.btnRequest}
              >
                Request Task
              </button>
            </div>
          ))}
        </div>
      )}

      {/* My Tasks */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>My Tasks ({tasks.length})</h2>

        {tasks.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No tasks assigned yet.</p>
            <p style={styles.emptySubtext}>Available tasks will appear above for you to request.</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} style={styles.taskCard}>
              <div style={styles.taskHeader}>
                <div>
                  <h3 style={styles.taskTitle}>{task.title}</h3>
                  <p style={styles.taskClient}>Client: {task.clientName || 'Unknown'}</p>
                </div>
                <div style={{ ...styles.statusBadge, ...getStatusStyle(task.status) }}>
                  {getStatusLabel(task.status)}
                </div>
              </div>

              <div style={styles.taskInfo}>
                <div>
                  <p style={styles.taskLabel}>Client Price</p>
                  <p style={styles.taskAmount}>${task.clientAmount || 0}</p>
                  <p style={styles.taskCommission}>
                    Your commission: ${(task.collaboratorCommissionAmount || ((task.clientAmount || 0) * 0.3)).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p style={styles.taskLabel}>Deadline</p>
                  <p style={styles.taskDate}>{task.prazo || 'Flexible'}</p>
                </div>
              </div>

              {task.status === 'assigned' && (
                <button onClick={() => handleStartTask(task.id)} style={styles.btnStart}>
                  Start Task
                </button>
              )}

              {task.status === 'in_analysis' && (
                <button onClick={() => handleMarkInProgress(task.id)} style={styles.btnProgress}>
                  Mark as In Progress
                </button>
              )}

              {task.status === 'in_progress' && (
                <button onClick={() => handleDeliver(task.id)} style={styles.btnDeliver}>
                  Deliver Work
                </button>
              )}

              {task.status === 'in_revision' && (
                <div style={styles.inReview}>
                  <p style={{ margin: 0 }}>Under admin review</p>
                  <p style={styles.inReviewSub}>
                    Once approved, payment will be processed automatically via Stellar
                  </p>
                </div>
              )}

              {task.status === 'approved' && (
                <div style={styles.approved}>
                  <p style={{ margin: 0 }}>Approved by admin - awaiting client payment</p>
                </div>
              )}

              {task.status === 'paid' && (
                <div style={styles.paid}>
                  <CheckCircle size={16} color="#22c55e" />
                  <span>Payment received on Stellar</span>
                  {task.proposalId && (
                    <a 
                      href={`https://stellar.expert/explorer/testnet/tx/${task.proposalId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.linkBtn}
                    >
                      <ExternalLink size={12} /> View TX
                    </a>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Info Banner */}
      <div style={styles.infoBanner}>
        <div style={{ fontSize: 24 }}>⭐</div>
        <div>
          <p style={styles.infoTitle}>💰 70/30 automatic payments via Stellar</p>
          <p style={styles.infoText}>
            <strong>How it works:</strong><br/>
            1. Client accepts proposal → Tasks created<br/>
            2. You complete the work<br/>
            3. Admin approves → Client receives invoice<br/>
            4. Client pays → <strong>PaymentSplitter</strong> auto-splits:<br/>
            • 70% → Company (Admin)<br/>
            • 30% → You (automatic via Stellar)<br/><br/>
            <a
              href="https://stellar.expert/exlporer/testnet"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.link}
            >
              View on Stellar Explorer →
            </a>
          </p>
        </div>
      </div>

      {showPollar && (
        <PollarPayoutModal
          totalEarned={totalEarned}
          collaboratorAddress={collaboratorId}
          prefillEmail=""
          onClose={() => setShowPollar(false)}
        />
      )}
    </div>
  );
}

const styles = {
  center: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f7f4',
  } as const,
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f7f4',
    padding: '40px 60px',
    fontFamily: 'Montserrat, sans-serif',
  } as const,
  header: { marginBottom: 40 } as const,
  logo: {
    fontWeight: 900,
    fontSize: 12,
    color: '#F25C05',
    letterSpacing: '0.3em',
    textTransform: 'uppercase' as const,
  },
  title: {
    fontWeight: 900,
    fontSize: 28,
    color: '#1b1c1b',
    margin: 0,
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 20,
    marginBottom: 40,
  } as const,
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    margin: 0,
  },
  statValue: {
    fontWeight: 900,
    fontSize: 24,
    color: '#1b1c1b',
    margin: '4px 0 0 0',
  },
  section: { marginBottom: 40 },
  sectionTitle: {
    fontWeight: 900,
    fontSize: 20,
    marginBottom: 8,
    color: '#1b1c1b',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  taskTitle: {
    fontWeight: 700,
    fontSize: 18,
    color: '#1b1c1b',
    margin: 0,
  },
  taskClient: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: 100,
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
  },
  taskInfo: { display: 'flex', gap: 24, marginBottom: 16 },
  taskLabel: { fontSize: 12, color: '#999', margin: 0 },
  taskAmount: {
    fontWeight: 700,
    fontSize: 20,
    color: '#F25C05',
    margin: '4px 0',
  },
  taskCommission: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: 600,
  },
  taskDate: {
    fontSize: 14,
    color: '#1b1c1b',
    marginTop: 4,
  },
  btnRequest: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#F25C05',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  },
  btnStart: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  },
  btnProgress: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#8b5cf6',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  },
  btnDeliver: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#22c55e',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  },
  btnRetry: {
    padding: '12px 24px',
    backgroundColor: '#F25C05',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 700,
    cursor: 'pointer',
  },
  inReview: {
    padding: '14px',
    backgroundColor: '#ccfbf1',
    borderRadius: 12,
    textAlign: 'center' as const,
    color: '#0f766e',
    fontSize: 14,
    fontWeight: 600,
  },
  inReviewSub: { fontSize: 12, color: '#14b8a6', marginTop: 4 },
  approved: {
    padding: '14px',
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    textAlign: 'center' as const,
    color: '#166534',
    fontSize: 14,
    fontWeight: 600,
  },
  paid: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '14px',
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    color: '#166534',
    fontSize: 14,
    fontWeight: 600,
  },
  linkBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
    padding: '4px 8px',
    backgroundColor: '#1d4ed8',
    color: '#fff',
    borderRadius: 4,
    textDecoration: 'none',
    fontSize: 12,
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '40px',
    backgroundColor: '#fff',
    borderRadius: 16,
    color: '#666',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
  },
  infoBanner: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 24,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
  },
  infoTitle: {
    fontWeight: 700,
    fontSize: 14,
    color: '#1d4ed8',
    margin: '0 0 8px 0',
  },
  payoutCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap' as const,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  payoutTitle: {
    fontWeight: 800,
    fontSize: 16,
    color: '#1b1c1b',
    margin: '0 0 6px 0',
  },
  payoutText: {
    fontSize: 13,
    color: '#666',
    margin: 0,
    maxWidth: 520,
    lineHeight: 1.5,
  },
  btnPayout: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '14px 20px',
    backgroundColor: '#F25C05',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Montserrat, sans-serif',
  },
  infoText: {
    fontSize: 13,
    color: '#3b82f6',
    lineHeight: 1.6,
    margin: 0,
  },
  link: { color: '#1d4ed8', textDecoration: 'underline' },
};