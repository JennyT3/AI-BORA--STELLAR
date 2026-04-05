import { useState } from "react";
import { theme } from "../../styles/theme";
import { Tarea, Cliente, Vendedor } from "../../types";
import { Plus, X, Calendar, User, Check, Clock, Package, DollarSign } from "lucide-react";

interface TarefasAdminProps {
  tareas: Tarea[];
  clientes: Cliente[];
  vendedores: Vendedor[];
  onCrearTarea: (data: Partial<Tarea>) => void;
  onAsignarTarea: (tareaId: string, vendedorId: string, prazo: string) => void;
  onAprobarEntrega: (tareaId: string) => void;
  onMarcarPaga: (tareaId: string) => void;
}

const SERVICOS_CATALOGO = [
  "Gestão de Redes Sociais",
  "Criação de Conteúdo",
  "Community Management",
  "Design de Posts",
  "Produção de Videos",
  "Criação de Reels",
  "Google Ads",
  "Chatbot WhatsApp",
];

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case 'disponivel': return { bg: '#E0F2FE', color: '#0284C7', label: 'Disponível' };
    case 'asignada': return { bg: '#FEF3C7', color: '#D97706', label: 'Em Andamento' };
    case 'entregue': return { bg: '#DBEAFE', color: '#2563EB', label: 'Entregue' };
    case 'aprovada_admin': return { bg: '#D1FAE5', color: '#059669', label: 'Aprovada Admin' };
    case 'aprovada_cliente': return { bg: '#D1FAE5', color: '#059669', label: 'Aprovada Cliente' };
    case 'paga': return { bg: '#F3E8FF', color: '#9333EA', label: 'Paga' };
    default: return { bg: '#F3F4F6', color: '#6B7280', label: estado };
  }
};

export function TarefasAdmin({ tareas, clientes, vendedores, onCrearTarea, onAsignarTarea, onAprobarEntrega, onMarcarPaga }: TarefasAdminProps) {
  const [showCrearForm, setShowCrearForm] = useState(false);
  const [newTarea, setNewTarea] = useState({
    titulo: '',
    descricao: '',
    clienteId: '',
    servicoId: '',
    recorrente: false,
    periodicidade: 'pontual' as 'mensal' | 'pontual',
  });
  const [asignModalTarea, setAsignModalTarea] = useState<Tarea | null>(null);
  const [selectedVendedor, setSelectedVendedor] = useState('');
  const [prazo, setPrazo] = useState('');

  const disponibles = tareas.filter(t => t.estado === 'disponivel' || t.estado === 'asignada');
  const entregadas = tareas.filter(t => t.estado === 'entregue');
  const aprobadas = tareas.filter(t => ['aprovada_admin', 'aprovada_cliente', 'paga'].includes(t.estado));

  const handleCrear = () => {
    if (!newTarea.titulo || !newTarea.clienteId) {
      alert("Preencha o título e selecione um cliente");
      return;
    }
    const cliente = clientes.find(c => c.id === newTarea.clienteId);
    onCrearTarea({
      titulo: newTarea.titulo,
      descricao: newTarea.descricao,
      clienteId: newTarea.clienteId,
      clienteNome: cliente?.nome,
      servicoId: newTarea.servicoId,
      servicoNome: newTarea.servicoId ? SERVICOS_CATALOGO.find(s => s === newTarea.servicoId) : undefined,
      recorrente: newTarea.recorrente,
      periodicidade: newTarea.periodicidade,
      estado: 'disponivel',
    });
    setShowCrearForm(false);
    setNewTarea({ titulo: '', descricao: '', clienteId: '', servicoId: '', recorrente: false, periodicidade: 'pontual' });
  };

  const handleAsignar = () => {
    if (!asignModalTarea || !selectedVendedor || !prazo) return;
    onAsignarTarea(asignModalTarea.id, selectedVendedor, prazo);
    setAsignModalTarea(null);
    setSelectedVendedor('');
    setPrazo('');
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 28, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>Tarefas</h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>{tareas.length} tarefas total</p>
        </div>
        <button 
          onClick={() => setShowCrearForm(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 10, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          <Plus size={16} /> Criar Tarefa
        </button>
      </div>

      {/* Crear Form */}
      {showCrearForm && (
        <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, marginBottom: 32, border: "1px solid #e0e0e0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Nova Tarefa</h3>
            <button onClick={() => setShowCrearForm(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Título *</label>
              <input 
                value={newTarea.titulo}
                onChange={e => setNewTarea({ ...newTarea, titulo: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13 }}
                placeholder="Ex: Gestão Instagram"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Cliente *</label>
              <select 
                value={newTarea.clienteId}
                onChange={e => setNewTarea({ ...newTarea, clienteId: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13 }}
              >
                <option value="">Selecionar...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Serviço</label>
              <select 
                value={newTarea.servicoId}
                onChange={e => setNewTarea({ ...newTarea, servicoId: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13 }}
              >
                <option value="">Selecionar...</option>
                {SERVICOS_CATALOGO.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <input 
                  type="checkbox"
                  checked={newTarea.recorrente}
                  onChange={e => setNewTarea({ ...newTarea, recorrente: e.target.checked })}
                /> Recorrente
              </label>
              {newTarea.recorrente && (
                <select 
                  value={newTarea.periodicidade}
                  onChange={e => setNewTarea({ ...newTarea, periodicidade: e.target.value as 'mensal' | 'pontual' })}
                  style={{ padding: "8px", borderRadius: 6, border: "1px solid #e0e0e0", fontSize: 12 }}
                >
                  <option value="mensal">Mensal</option>
                  <option value="pontual">Pontual</option>
                </select>
              )}
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Descrição</label>
            <textarea 
              value={newTarea.descricao}
              onChange={e => setNewTarea({ ...newTarea, descricao: e.target.value })}
              rows={3}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13 }}
            />
          </div>
          <button 
            onClick={handleCrear}
            style={{ marginTop: 16, padding: "10px 20px", borderRadius: 8, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            Criar Tarefa
          </button>
        </div>
      )}

      {/* Asignar Modal */}
      {asignModalTarea && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, width: 400 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Atribuir Tarefa</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Vendedor</label>
              <select 
                value={selectedVendedor}
                onChange={e => setSelectedVendedor(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13 }}
              >
                <option value="">Selecionar...</option>
                {vendedores.filter(v => v.ativo).map(v => (
                  <option key={v.id} value={v.id}>{v.nome}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Prazo</label>
              <input 
                type="date"
                value={prazo}
                onChange={e => setPrazo(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13 }}
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setAsignModalTarea(null)} style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: "#f3f4f6", border: "none", fontSize: 13, cursor: "pointer" }}>Cancelar</button>
              <button onClick={handleAsignar} style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Atribuir</button>
            </div>
          </div>
        </div>
      )}

      {/* Disponíveis */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Tarefas Disponíveis</h3>
        {disponibles.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#999", backgroundColor: "#f9f9f9", borderRadius: 12 }}>Nenhuma tarefa disponível</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {disponibles.map(t => {
              const estado = getEstadoColor(t.estado);
              return (
                <div key={t.id} style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{t.titulo}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>{t.clienteNome} • {t.servicoNome || 'Sem serviço'}</div>
                    {t.asignadaA && (
                      <div style={{ fontSize: 11, color: "#D97706", marginTop: 4 }}>Atribuída a: {t.asignadoNome}</div>
                    )}
                    {t.solicitantes && t.solicitantes.length > 0 && !t.asignadaA && (
                      <div style={{ fontSize: 11, color: "#9333EA", marginTop: 4 }}>{t.solicitantes.length} vendedor(es) solicitou(aram)</div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, backgroundColor: estado.bg, color: estado.color, fontWeight: 600 }}>{estado.label}</span>
                    {!t.asignadaA && (
                      <button onClick={() => setAsignModalTarea(t)} style={{ padding: "8px 16px", borderRadius: 8, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Atribuir</button>
                    )}
                    {t.prazo && (
                      <span style={{ fontSize: 11, color: "#666", display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12} /> {t.prazo}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Entregues */}
      {entregadas.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Entregues - Aguardando Aprovação</h3>
          <div style={{ display: "grid", gap: 12 }}>
            {entregadas.map(t => (
              <div key={t.id} style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{t.titulo}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>{t.clienteNome} • {t.asignadoNome}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => onAprobarEntrega(t.id)} style={{ padding: "8px 16px", borderRadius: 8, backgroundColor: "#10B981", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Aprovar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aprovadas */}
      {aprobadas.length > 0 && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Histórico</h3>
          <div style={{ display: "grid", gap: 12 }}>
            {aprobadas.map(t => {
              const estado = getEstadoColor(t.estado);
              return (
                <div key={t.id} style={{ backgroundColor: "#f9f9f9", borderRadius: 12, padding: 16, border: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{t.titulo}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>{t.clienteNome} • {t.asignadoNome}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, backgroundColor: estado.bg, color: estado.color, fontWeight: 600 }}>{estado.label}</span>
                    {t.estado === 'aprovada_admin' && (
                      <button onClick={() => onMarcarPaga(t.id)} style={{ padding: "8px 16px", borderRadius: 8, backgroundColor: "#9333EA", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Marcar Paga</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}