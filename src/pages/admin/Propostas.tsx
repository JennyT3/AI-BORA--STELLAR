import { theme } from "../../styles/theme";

interface PropostasProps {
  proposals: any[];
  loading: boolean;
  editingId: string | null;
  editData: any;
  onEdit: (p: any) => void;
  onSave: (id: string) => void;
  onCancel: () => void;
  onUpdateEditData: (data: any) => void;
  onDelete: (id: string, nome: string) => void;
  onMarcarEnviada: (p: any) => void;
  onRegistrarResposta: (p: any) => void;
  onRefresh: () => void;
  onEditOrcamento: (id: string) => void;
}

const getStatusColor = (p: any) => {
  if (p.resposta === "sim") return "#10B981";
  if (p.resposta === "nao") return "#DC2626";
  if (p.resposta === "reagendado") return "#F59E0B";
  if (p.dataEnvio) return "#3498DB";
  return "#9CA3AF";
};

const getStatusLabel = (p: any) => {
  if (p.resposta === "sim") return "✓ Aceite";
  if (p.resposta === "nao") return "✕ Recusado";
  if (p.resposta === "reagendado") return "↻ Reagendado";
  if (p.dataEnvio) return "Enviada";
  return "Pendente";
};

export function Propostas({ proposals, loading, editingId, editData, onEdit, onSave, onCancel, onUpdateEditData, onDelete, onMarcarEnviada, onRegistrarResposta, onRefresh, onEditOrcamento }: PropostasProps) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div><h1 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 28, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>Propostas</h1><p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>{proposals.length} propostas guardadas</p></div>
        <button onClick={onRefresh} style={{ padding: "12px 20px", borderRadius: 10, backgroundColor: "#ffffff", color: "#666", border: "1px solid #e0e0e0", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Atualizar</button>
      </div>
      {loading ? <div style={{ textAlign: "center", padding: 60, color: theme.colors.text.secondary }}>A carregar...</div> : proposals.length === 0 ? <div style={{ textAlign: "center", padding: 60, color: theme.colors.text.secondary, backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e8e8e8" }}>Nenhuma proposta guardada ainda.</div> : (
        <div style={{ display: "grid", gap: 16 }}>
          {proposals.map((p) => (
            <div key={p.id} style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
              {editingId === p.id ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                  <div><label style={{ fontSize: 11, color: theme.colors.text.secondary, display: "block", marginBottom: 6, fontWeight: 600 }}>Cliente</label><input value={editData.cliente} onChange={(e) => onUpdateEditData({...editData, cliente: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13, backgroundColor: "#fafafa", color: theme.colors.text.primary }} /></div>
                  <div><label style={{ fontSize: 11, color: theme.colors.text.secondary, display: "block", marginBottom: 6, fontWeight: 600 }}>Valor (€)</label><input type="number" value={editData.valor} onChange={(e) => onUpdateEditData({...editData, valor: parseFloat(e.target.value)})} style={{ width: "100%", padding: "12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13, backgroundColor: "#fafafa", color: theme.colors.text.primary }} /></div>
                  <div><label style={{ fontSize: 11, color: theme.colors.text.secondary, display: "block", marginBottom: 6, fontWeight: 600 }}>Desconto (€)</label><input type="number" value={editData.desconto} onChange={(e) => onUpdateEditData({...editData, desconto: parseFloat(e.target.value)})} style={{ width: "100%", padding: "12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13, backgroundColor: "#fafafa", color: theme.colors.text.primary }} /></div>
                  <div><label style={{ fontSize: 11, color: theme.colors.text.secondary, display: "block", marginBottom: 6, fontWeight: 600 }}>Marcas</label><input type="number" value={editData.marcas} onChange={(e) => onUpdateEditData({...editData, marcas: parseInt(e.target.value)})} style={{ width: "100%", padding: "12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13, backgroundColor: "#fafafa", color: theme.colors.text.primary }} /></div>
                  <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12, marginTop: 8 }}><button onClick={() => onSave(p.id)} style={{ flex: 1, padding: "12px", borderRadius: 8, backgroundColor: "#10B981", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Guardar</button><button onClick={onCancel} style={{ flex: 1, padding: "12px", borderRadius: 8, backgroundColor: "#f0f0f0", color: "#666", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Cancelar</button></div>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}><span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: theme.colors.text.primary }}>{p.cliente}</span><span style={{ fontSize: 11, padding: "6px 12px", borderRadius: 20, backgroundColor: getStatusColor(p) + "15", color: getStatusColor(p), fontWeight: 600 }}>{getStatusLabel(p)}</span></div>
                    <div style={{ fontSize: 13, color: "#666", marginBottom: 12, display: "flex", flexWrap: "wrap", gap: 16 }}><span>{p.numeroOrcamento}</span><span style={{ color: theme.colors.accent.primary, fontWeight: 700 }}>{p.valor?.toFixed(2)} €</span><span>{p.marcas} marca{p.marcas !== 1 ? "s" : ""}</span>{p.dataEnvio && <span style={{ color: "#3498DB" }}>Enviada: {p.dataEnvio}</span>}</div>
                    {p.servicos && p.servicos.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{p.servicos.slice(0, 4).map((s: string, i: number) => <span key={i} style={{ fontSize: 11, backgroundColor: "#f5f5f5", padding: "6px 12px", borderRadius: 20, color: "#666", fontWeight: 500 }}>{s}</span>)}{p.servicos.length > 4 && <span style={{ fontSize: 11, color: theme.colors.text.secondary }}>+{p.servicos.length - 4}</span>}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <a href={`/p/${p.id}`} target="_blank" style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "#3498DB", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, textDecoration: "none", display: "inline-block" }}>Ver Proposta</a>
                    <button onClick={() => { navigator.clipboard.writeText(`https://aibora.pt/p/${p.id}`); alert("Link copiado!"); }} style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "#f5f5f5", color: "#666", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Copiar</button>
                    <button onClick={() => onEditOrcamento(p.id)} style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "#FFF5F0", color: theme.colors.accent.primary, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Editar</button>
                    <button onClick={() => onMarcarEnviada(p)} style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: p.dataEnvio ? "#E8F4FD" : "#f5f5f5", color: p.dataEnvio ? "#3498DB" : "#666", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Enviada</button>
                    {p.resposta === "sim" ? (
                      <span style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "#10B981", color: "#fff", border: "none", fontSize: 12, fontWeight: 600 }}>✓ Accept</span>
                    ) : p.resposta === "nao" ? (
                      <span style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "#DC2626", color: "#fff", border: "none", fontSize: 12, fontWeight: 600 }}>✕ Recusado</span>
                    ) : (
                      <button onClick={() => onRegistrarResposta(p)} style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "#f5f5f5", color: "#666", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Resposta</button>
                    )}
                    <button onClick={() => onDelete(p.id, p.cliente)} style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "#FEE2E2", color: "#dc2626", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>X</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}