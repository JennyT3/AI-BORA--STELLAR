import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Loader2, CheckCircle, Clock, TrendingUp, Wallet } from 'lucide-react';

interface Tarea {
  id: string;
  titulo: string;
  clienteNombre: string;
  estado: 'disponible' | 'en_progreso' | 'en_revision' | 'entregado';
  monto: number;
  fechaLimite: string;
}

export default function ColaboradorPage() {
  const [match, params] = useRoute('/colaborador/:id');
  const [, setLocation] = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [totalGanado, setTotalGanado] = useState(0);
  const [tareasDisponibles, setTareasDisponibles] = useState(0);
  
  useEffect(() => {
    // Simular carga de tareas del colaborador
    setTimeout(() => {
      const mockTareas: Tarea[] = [
        {
          id: '1',
          titulo: 'Gestão de Redes Sociais',
          clienteNombre: 'Empresa ABC',
          estado: 'disponible',
          monto: 500,
          fechaLimite: '2026-04-15',
        },
        {
          id: '2',
          titulo: 'Design de Logotipo',
          clienteNombre: 'Startup XYZ',
          estado: 'en_progreso',
          monto: 300,
          fechaLimite: '2026-04-12',
        },
        {
          id: '3',
          titulo: 'Criação de Reels',
          clienteNombre: 'Loja 123',
          estado: 'en_revision',
          monto: 200,
          fechaLimite: '2026-04-10',
        },
      ];
      setTareas(mockTareas);
      setTotalGanado(850);
      setTareasDisponibles(mockTareas.filter(t => t.estado === 'disponible').length);
      setLoading(false);
    }, 1000);
  }, []);
  
  const handleAceptarTarea = (tareaId: string) => {
    setTareas(prev => prev.map(t =>
      t.id === tareaId ? { ...t, estado: 'en_progreso' as const } : t
    ));
  };
  
  const handleEntregar = (tareaId: string) => {
    setTareas(prev => prev.map(t =>
      t.id === tareaId ? { ...t, estado: 'en_revision' as const } : t
    ));
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
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={styles.logo}>AI BORA</div>
          <div>
            <h1 style={styles.title}>Panel del Colaborador</h1>
            <p style={styles.subtitle}>Tu trabajo, tu pago, todo en blockchain</p>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <Wallet size={24} color="#F25C05" />
          <div>
            <p style={styles.statLabel}>Ganado este mes</p>
            <p style={styles.statValue}>€{totalGanado}</p>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <CheckCircle size={24} color="#22c55e" />
          <div>
            <p style={styles.statLabel}>Tareas completadas</p>
            <p style={styles.statValue}>3</p>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <Clock size={24} color="#3b82f6" />
          <div>
            <p style={styles.statLabel}>En revisión</p>
            <p style={styles.statValue}>1</p>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <TrendingUp size={24} color="#8b5cf6" />
          <div>
            <p style={styles.statLabel}>Disponibles</p>
            <p style={styles.statValue}>{tareasDisponibles}</p>
          </div>
        </div>
      </div>
      
      {/* Tareas */}
      <div style={styles.tareasContainer}>
        <h2 style={styles.sectionTitle}>Tareas asignadas</h2>
        
        {tareas.map(tarea => (
          <div key={tarea.id} style={styles.tareaCard}>
            <div style={styles.tareaHeader}>
              <div>
                <h3 style={styles.tareaTitulo}>{tarea.titulo}</h3>
                <p style={styles.tareaCliente}>Cliente: {tarea.clienteNombre}</p>
              </div>
              <div style={{ ...styles.estadoBadge, ...getEstadoStyle(tarea.estado) }}>
                {tarea.estado.replace('_', ' ')}
              </div>
            </div>
            
            <div style={styles.tareaInfo}>
              <div>
                <p style={styles.tareaLabel}>Monto</p>
                <p style={styles.tareaMonto}>€{tarea.monto}</p>
                <p style={styles.tareaComision}>Tu 30%: €{(tarea.monto * 0.3).toFixed(2)}</p>
              </div>
              <div>
                <p style={styles.tareaLabel}>Fecha límite</p>
                <p style={styles.tareaFecha}>{tarea.fechaLimite}</p>
              </div>
            </div>
            
            {tarea.estado === 'disponible' && (
              <button
                onClick={() => handleAceptarTarea(tarea.id)}
                style={styles.btnAceptar}
              >
                Aceptar tarea
              </button>
            )}
            
            {tarea.estado === 'en_progreso' && (
              <button
                onClick={() => handleEntregar(tarea.id)}
                style={styles.btnEntregar}
              >
                Marcar como entregado
              </button>
            )}
            
            {tarea.estado === 'en_revision' && (
              <div style={styles.enRevision}>
                <p>✓ En revisión por el cliente</p>
                <p style={styles.enRevisionSub}>
                  El pago se procesará automáticamente vía Stellar
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Info Banner */}
      <div style={styles.infoBanner}>
        <div style={{ fontSize: 24 }}>⭐</div>
        <div>
          <p style={styles.infoTitle}>Pagos 70/30 vía Soroban</p>
          <p style={styles.infoText}>
            Cuando el cliente paga, el contrato <strong>PaymentSplitter</strong> distribuye automáticamente:
            70% al vendedor, 30% a ti. Todo on-chain, transparente, verificable en{' '}
            <a
              href="https://stellar.expert/explorer/testnet"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.link}
            >
              Stellar Expert
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function getEstadoStyle(estado: string) {
  const styles: Record<string, any> = {
    disponible: { backgroundColor: '#eff6ff', color: '#1d4ed8' },
    en_progreso: { backgroundColor: '#fef3c7', color: '#92400e' },
    en_revision: { backgroundColor: '#f0fdf4', color: '#166534' },
    entregado: { backgroundColor: '#f0fdf4', color: '#166534' },
  };
  return styles[estado] || styles.disponible;
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
  } as const,
  header: {
    marginBottom: 40,
  } as const,
  logo: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 900,
    fontSize: 14,
    color: '#F25C05',
    letterSpacing: '0.3em',
    textTransform: 'uppercase' as const,
  },
  title: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 900,
    fontSize: 28,
    color: '#1b1c1b',
    margin: 0,
  },
  subtitle: {
    fontFamily: 'Montserrat, sans-serif',
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
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 12,
    color: '#666',
    margin: 0,
  },
  statValue: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 900,
    fontSize: 24,
    color: '#1b1c1b',
    margin: '4px 0 0 0',
  },
  tareasContainer: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 900,
    fontSize: 20,
    marginBottom: 20,
    color: '#1b1c1b',
  },
  tareaCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  tareaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tareaTitulo: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 700,
    fontSize: 18,
    color: '#1b1c1b',
    margin: 0,
  },
  tareaCliente: {
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  estadoBadge: {
    padding: '6px 12px',
    borderRadius: 100,
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
  },
  tareaInfo: {
    display: 'flex',
    gap: 24,
    marginBottom: 16,
  },
  tareaLabel: {
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 12,
    color: '#999',
    margin: 0,
  },
  tareaMonto: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 700,
    fontSize: 20,
    color: '#F25C05',
    margin: '4px 0',
  },
  tareaComision: {
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 12,
    color: '#22c55e',
    fontWeight: 600,
  },
  tareaFecha: {
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 14,
    color: '#1b1c1b',
    marginTop: 4,
  },
  btnAceptar: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#F25C05',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Montserrat, sans-serif',
  },
  btnEntregar: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#22c55e',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Montserrat, sans-serif',
  },
  enRevision: {
    padding: '14px',
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    textAlign: 'center' as const,
    fontFamily: 'Montserrat, sans-serif',
    color: '#166534',
    fontSize: 14,
    fontWeight: 600,
  },
  enRevisionSub: {
    fontSize: 12,
    color: '#4ade80',
    marginTop: 4,
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
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 700,
    fontSize: 14,
    color: '#1d4ed8',
    margin: '0 0 8px 0',
  },
  infoText: {
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 13,
    color: '#3b82f6',
    lineHeight: 1.6,
    margin: 0,
  },
  link: {
    color: '#1d4ed8',
    textDecoration: 'underline',
  },
};