import React, { useState } from "react";
import { Tarea, Cliente, Vendedor } from "../../types";
import { updateTarea, asignarTarea, aprobarTarea, marcarTareaPaga, solicitarTarea } from "../../services/firebase";
import { sendDeliveryApprovalEmail } from "../../services/emailService";

const COLUMNAS = [
  { id: "disponivel", label: "Disponível", cor: "#0284C7", bg: "#E0F2FE" },
  { id: "candidatura", label: "Em candidatura", cor: "#D97706", bg: "#FEF3C7" },
  { id: "asignada", label: "Em andamento", cor: "#7C3AED", bg: "#EDE9FE" },
  { id: "entregue", label: "Entregue", cor: "#2563EB", bg: "#DBEAFE" },
  { id: "aprovada_admin", label: "Aprovada admin", cor: "#059669", bg: "#D1FAE5" },
  { id: "aprovada_cliente", label: "Aprovada cliente", cor: "#16A34A", bg: "#DCFCE7" },
  { id: "paga", label: "Paga", cor: "#9333EA", bg: "#F3E8FF" },
];

interface Props {
  tareas: Tarea[];
  clientes: Cliente[];
  vendedores: Vendedor[];
  isAdmin: boolean;
  vendedorId?: string;
  onRefresh: () => void;
  clienteIdFiltro?: string;
  onVerFicha?: (id: string) => void;
}

export function TarefasKanban({ tareas, clientes, vendedores, isAdmin, vendedorId, onRefresh, clienteIdFiltro, onVerFicha }: Props) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const [modalTarea, setModalTarea] = useState<Tarea | null>(null);
  const [asignModal, setAsignModal] = useState<Tarea | null>(null);
  const [selectedVendedor, setSelectedVendedor] = useState("");
  const [prazo, setPrazo] = useState("");
  const [comissaoValor, setComissaoValor] = useState<number | undefined>(undefined);
  const [comissaoTipo, setComissaoTipo] = useState<'fixo' | 'percentagem'>('fixo');
  const [loading, setLoading] = useState(false);

  const tareasFiltradas = clienteIdFiltro
    ? tareas.filter(t => t.clienteId === clienteIdFiltro)
    : tareas;

  const getCol = (t: Tarea) => {
    if (t.estado === "disponivel" && t.solicitantes && t.solicitantes.length > 0) return "candidatura";
    return t.estado;
  };

  const handleDragStart = (id: string) => { if (isAdmin) setDraggedId(id); };
  const handleDragOver = (e: React.DragEvent, colId: string) => { e.preventDefault(); if (isAdmin) setOverCol(colId); };
  const handleDrop = async (colId: string) => {
    if (!isAdmin || !draggedId) return;
    setDraggedId(null); setOverCol(null);
    const estadoReal = colId === "candidatura" ? "disponivel" : colId as Tarea["estado"];
    try { await updateTarea(draggedId, { estado: estadoReal }); onRefresh(); } catch {}
  };

  const handleAsignar = async () => {
    if (!asignModal || !selectedVendedor || !prazo) return;
    setLoading(true);
    try {
      const vendedorNome = getVendedorNome(selectedVendedor);
      await asignarTarea(asignModal.id, selectedVendedor, vendedorNome, prazo, comissaoValor, comissaoTipo);
      setAsignModal(null); setSelectedVendedor(""); setPrazo(""); setComissaoValor(undefined); setComissaoTipo("fixo");
      onRefresh();
    } catch {}
    setLoading(false);
  };

  const handleAprobar = async (t: Tarea) => {
    setLoading(true);
    try { 
      await aprobarTarea(t.id); 
      if (t.clienteEmail) {
        // El servicio espera (email, nome, tareaTitulo, fichaUrl) según la firma del servicio
        await sendDeliveryApprovalEmail(
          t.clienteEmail,
          t.clienteNome || 'Cliente',
          t.titulo,
          `${window.location.origin}/c/${t.clienteId}`
        );
      }
      onRefresh(); 
    } catch {}
    setLoading(false);
  };

  const handlePaga = async (t: Tarea) => {
    setLoading(true);
    try { await marcarTareaPaga(t.id); onRefresh(); } catch {}
    setLoading(false);
  };

  const handleSolicitar = async (t: Tarea) => {
    if (!vendedorId) return;
    setLoading(true);
    try { await solicitarTarea(t.id, vendedorId); onRefresh(); } catch {}
    setLoading(false);
  };

  const getVendedorNome = (id?: string) => vendedores.find(v => v.id === id)?.nome || id || "—";

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 10px", borderRadius: 8,
    border: "1px solid #ddd", fontSize: 13, marginBottom: 8, fontFamily: "inherit"
  };

  const btnStyle = (cor: string): React.CSSProperties => ({
    padding: "7px 14px", borderRadius: 8, border: "none",
    backgroundColor: cor, color: "#fff", fontSize: 12,
    fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
  });

  return (
    <div style={{ overflowX: "auto", paddingBottom: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", minWidth: 1200 }}>
        {COLUMNAS.map(col => {
          const cards = tareasFiltradas.filter(t => getCol(t) === col.id);
          return (
            <div
              key={col.id}
              onDragOver={e => handleDragOver(e, col.id)}
              onDrop={() => handleDrop(col.id)}
              onDragLeave={() => setOverCol(null)}
              style={{
                flex: "0 0 170px", backgroundColor: "#F8F7F4",
                borderRadius: 12, padding: 10,
                border: overCol === col.id ? `2px solid ${col.cor}` : "1.5px solid #E8E6E0",
                minHeight: 300, transition: "border 0.15s"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: col.cor, textTransform: "uppercase", letterSpacing: 0.5 }}>{col.label}</span>
                <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, backgroundColor: col.bg, color: col.cor, fontWeight: 700 }}>{cards.length}</span>
              </div>

              {cards.map(t => {
                const yaSolicito = t.solicitantes?.includes(vendedorId || "");
                const esMia = t.asignadaA === vendedorId;
                const visibleParaColab = col.id === "disponivel" || col.id === "candidatura" || esMia;
                if (!isAdmin && !visibleParaColab) return null;

                return (
                  <div
                    key={t.id}
                    draggable={isAdmin}
                    onDragStart={() => handleDragStart(t.id)}
                    onClick={() => setModalTarea(t)}
                    style={{
                      backgroundColor: "#fff", borderRadius: 10, padding: "10px 12px",
                      marginBottom: 8, border: "1px solid #E8E6E0",
                      cursor: isAdmin ? "grab" : "pointer",
                      opacity: draggedId === t.id ? 0.4 : 1,
                      borderLeft: `3px solid ${col.cor}`
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1A1A1A", marginBottom: 3 }}>{t.titulo}</div>
                    <div style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>{t.clienteNome}</div>
                    {t.asignadoNome && (
                      <div style={{ fontSize: 10, color: "#888", marginBottom: 4 }}>
                        👤 {t.asignadoNome}
                      </div>
                    )}
                    {isAdmin && t.solicitantes && t.solicitantes.length > 0 && !t.asignadaA && (
                      <div style={{ fontSize: 10, color: "#D97706", fontWeight: 700, marginBottom: 4 }}>
                        🙋‍♂️ {t.solicitantes.length} solicitantes
                      </div>
                    )}
                    {t.prazo && (
                      <div style={{ fontSize: 10, color: "#F25C05", marginBottom: 4 }}>📅 {t.prazo}</div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                      <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, backgroundColor: col.bg, color: col.cor, fontWeight: 600 }}>
                        {t.periodicidade === "mensal" ? "🔄 Mensal" : "📌 Pontual"}
                      </span>
                      {!isAdmin && col.id === "disponivel" && (
                        <button
                          onClick={e => { e.stopPropagation(); handleSolicitar(t); }}
                          style={{ ...btnStyle("#F25C05"), padding: "4px 10px", fontSize: 10 }}
                        >
                          {yaSolicito ? "Solicitado" : "Solicitar"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* MODAL DETALLE */}
      {modalTarea && (
        <div onClick={() => setModalTarea(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 500, maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A" }}>{modalTarea.titulo}</h3>
              <button onClick={() => setModalTarea(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#888" }}>×</button>
            </div>

            <div style={{ fontSize: 13, color: "#444", marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              👤 Cliente: <strong>{modalTarea.clienteNome}</strong>
              <button 
                onClick={() => { setModalTarea(null); onVerFicha?.(modalTarea.clienteId); }} 
                style={{ background: 'none', border: 'none', color: '#F25C05', cursor: 'pointer', fontSize: 11, fontWeight: 700, textDecoration: 'underline' }}
              >
                Ver Ficha
              </button>
            </div>
            {modalTarea.asignadoNome && <div style={{ fontSize: 13, color: "#444", marginBottom: 8 }}>🛠 Colaborador: <strong>{modalTarea.asignadoNome}</strong></div>}
            {modalTarea.prazo && <div style={{ fontSize: 13, color: "#F25C05", marginBottom: 8 }}>📅 Prazo: <strong>{modalTarea.prazo}</strong></div>}
            {modalTarea.periodicidade && <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>🔁 {modalTarea.periodicidade === "mensal" ? "Mensal" : "Pontual"}</div>}

            {modalTarea.descricao && (
              <div style={{ backgroundColor: "#F8F7F4", borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 12, color: "#444", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                {modalTarea.descricao}
              </div>
            )}

            {modalTarea.entregaUrl && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A", marginBottom: 4 }}>Entrega:</div>
                <a href={modalTarea.entregaUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#2563EB" }}>{modalTarea.entregaUrl}</a>
              </div>
            )}
            {modalTarea.entregaNota && (
              <div style={{ fontSize: 12, color: "#555", backgroundColor: "#F0F9FF", borderRadius: 8, padding: 10, marginBottom: 12 }}>{modalTarea.entregaNota}</div>
            )}

            {isAdmin && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                {modalTarea.estado === "disponivel" && (
                  <button onClick={() => { setAsignModal(modalTarea); setModalTarea(null); }} style={btnStyle("#F25C05")}>Atribuir colaborador</button>
                )}
                {modalTarea.estado === "entregue" && (
                  <button onClick={() => { handleAprobar(modalTarea); setModalTarea(null); }} style={btnStyle("#059669")}>Aprovar entrega</button>
                )}
                {modalTarea.estado === "aprovada_cliente" && (
                  <button onClick={() => { handlePaga(modalTarea); setModalTarea(null); }} style={btnStyle("#9333EA")}>Marcar como paga</button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL ASIGNAR */}
      {asignModal && (
        <div onClick={() => setAsignModal(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 380 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Atribuir — {asignModal.titulo}</h3>
            <select value={selectedVendedor} onChange={e => setSelectedVendedor(e.target.value)} style={inputStyle}>
              <option value="">Selecionar colaborador...</option>
              {vendedores.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
            </select>
            <input type="date" value={prazo} onChange={e => setPrazo(e.target.value)} style={inputStyle} />
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input type="number" placeholder="Comissão" value={comissaoValor || ''} onChange={e => setComissaoValor(Number(e.target.value) || undefined)} style={{ ...inputStyle, marginBottom: 0, flex: 1 }} />
              <select value={comissaoTipo} onChange={e => setComissaoTipo(e.target.value as any)} style={{ ...inputStyle, marginBottom: 0, width: 110 }}>
                <option value="fixo">€ Fixo</option>
                <option value="percentagem">% Valor</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={handleAsignar} disabled={loading || !selectedVendedor || !prazo} style={btnStyle("#F25C05")}>Confirmar</button>
              <button onClick={() => setAsignModal(null)} style={{ ...btnStyle("#888"), backgroundColor: "#eee", color: "#444" }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
