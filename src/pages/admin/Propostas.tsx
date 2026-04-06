import { getStatusColor, getStatusLabel } from "../../utils/labels";
import { theme } from "../../styles/theme";
import { useState, useEffect } from "react";

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

export function Propostas({ proposals, loading, editingId, editData, onEdit, onSave, onCancel, onUpdateEditData, onDelete, onMarcarEnviada, onRegistrarResposta, onRefresh, onEditOrcamento }: PropostasProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: isMobile ? 24 : 28, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>
            Propostas
          </h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>{proposals.length} propostas guardadas</p>
        </div>
        <button
          onClick={onRefresh}
          style={{ padding: '12px 16px', borderRadius: 10, backgroundColor: '#fff', color: theme.colors.text.secondary, border: `1px solid ${theme.colors.border}`, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
        >
          Atualizar
        </button>
      </div>

      {/* States */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 64, color: theme.colors.text.secondary }}>A carregar...</div>
      ) : proposals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 64, color: theme.colors.text.secondary, backgroundColor: '#fff', borderRadius: 16, border: `1px solid ${theme.colors.border}` }}>
          Nenhuma proposta guardada ainda.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: isMobile ? 12 : 16 }}>
          {proposals.map((p) => (
            <div key={p.id} style={{ backgroundColor: '#fff', borderRadius: isMobile ? 12 : 16, padding: isMobile ? 16 : 24, border: `1px solid ${theme.colors.border}` }}>

              {/* Edit mode */}
              {editingId === p.id ? (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: theme.colors.text.secondary, fontWeight: 600, display: 'block', marginBottom: 6 }}>Cliente</label>
                    <input
                      value={editData.cliente}
                      onChange={(e) => onUpdateEditData({ ...editData, cliente: e.target.value })}
                      style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${theme.colors.border}`, fontSize: 13, backgroundColor: '#fafafa', color: theme.colors.text.primary, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: theme.colors.text.secondary, fontWeight: 600, display: 'block', marginBottom: 6 }}>Valor (€)</label>
                    <input
                      type="number"
                      value={editData.valor}
                      onChange={(e) => onUpdateEditData({ ...editData, valor: parseFloat(e.target.value) })}
                      style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${theme.colors.border}`, fontSize: 13, backgroundColor: '#fafafa', color: theme.colors.text.primary, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: theme.colors.text.secondary, fontWeight: 600, display: 'block', marginBottom: 6 }}>Desconto (€)</label>
                    <input
                      type="number"
                      value={editData.desconto}
                      onChange={(e) => onUpdateEditData({ ...editData, desconto: parseFloat(e.target.value) })}
                      style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${theme.colors.border}`, fontSize: 13, backgroundColor: '#fafafa', color: theme.colors.text.primary, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: theme.colors.text.secondary, fontWeight: 600, display: 'block', marginBottom: 6 }}>Marcas</label>
                    <input
                      type="number"
                      value={editData.marcas}
                      onChange={(e) => onUpdateEditData({ ...editData, marcas: parseInt(e.target.value) })}
                      style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${theme.colors.border}`, fontSize: 13, backgroundColor: '#fafafa', color: theme.colors.text.primary, outline: 'none' }}
                    />
                  </div>
                  <div style={{ gridColumn: isMobile ? '1' : '1 / -1', display: 'flex', gap: 12, marginTop: 8 }}>
                    <button
                      onClick={() => onSave(p.id)}
                      style={{ flex: 1, padding: '14px', borderRadius: 8, backgroundColor: '#10B981', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 13, minHeight: 44 }}
                    >
                      Guardar
                    </button>
                    <button
                      onClick={onCancel}
                      style={{ flex: 1, padding: '14px', borderRadius: 8, backgroundColor: '#f3f4f6', color: theme.colors.text.secondary, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 13, minHeight: 44 }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>

              ) : (
                /* View mode */
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: isMobile ? 12 : 24, flexDirection: isMobile ? 'column' : 'row' }}>
                  <div style={{ flex: 1 }}>
                    {/* Name + status badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: theme.colors.text.primary, fontFamily: theme.fontFamily.sans }}>
                        {p.cliente}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          padding: '4px 12px',
                          borderRadius: 20,
                          fontWeight: 600,
                          backgroundColor: getStatusColor(p) + '15',
                          color: getStatusColor(p),
                        }}
                      >
                        {getStatusLabel(p)}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div style={{ fontSize: 13, color: theme.colors.text.secondary, marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <span>{p.numeroOrcamento}</span>
                      <span style={{ color: '#F25C05', fontWeight: 700 }}>{p.valor?.toFixed(2)} €</span>
                      <span>{p.marcas} marca{p.marcas !== 1 ? "s" : ""}</span>
                      {p.dataEnvio && <span style={{ color: '#3498DB' }}>Enviada: {p.dataEnvio}</span>}
                    </div>

                    {/* Serviços tags */}
                    {p.servicos && p.servicos.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {p.servicos.slice(0, 4).map((s: string, i: number) => (
                          <span key={i} style={{ fontSize: 11, backgroundColor: '#f3f4f6', padding: '6px 12px', borderRadius: 20, color: theme.colors.text.secondary, fontWeight: 500 }}>
                            {s}
                          </span>
                        ))}
                        {p.servicos.length > 4 && (
                          <span style={{ fontSize: 11, color: theme.colors.text.secondary }}>+{p.servicos.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions - Botones grandes para touch */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: isMobile ? 12 : 0 }}>
                    <a
                      href={`/p/${p.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: '12px 16px', borderRadius: 8, backgroundColor: '#3498DB', color: '#fff', fontSize: 12, fontWeight: 600, textDecoration: 'none', display: 'inline-block', minHeight: 44, alignItems: 'center' }}
                    >
                      Ver
                    </a>
                    <button
                      onClick={() => { navigator.clipboard.writeText(`https://aibora.pt/p/${p.id}`); alert("Link copiado!"); }}
                      style={{ padding: '12px 16px', borderRadius: 8, backgroundColor: '#f3f4f6', color: theme.colors.text.secondary, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', minHeight: 44, display: 'flex', alignItems: 'center' }}
                    >
                      Copiar
                    </button>
                    <button
                      onClick={() => onEditOrcamento(p.id)}
                      style={{ padding: '12px 16px', borderRadius: 8, backgroundColor: '#fff7ed', color: '#F25C05', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', minHeight: 44, display: 'flex', alignItems: 'center' }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onMarcarEnviada(p)}
                      style={{ padding: '12px 16px', borderRadius: 8, backgroundColor: p.dataEnvio ? '#dbeafe' : '#f3f4f6', color: p.dataEnvio ? '#3498DB' : theme.colors.text.secondary, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', minHeight: 44, display: 'flex', alignItems: 'center' }}
                    >
                      Enviada
                    </button>

                    {p.resposta === "sim" ? (
                      <span style={{ padding: '12px 16px', borderRadius: 8, backgroundColor: '#10B981', color: '#fff', fontSize: 12, fontWeight: 600, minHeight: 44, display: 'flex', alignItems: 'center' }}>
                        ✓ Aceite
                      </span>
                    ) : p.resposta === "nao" ? (
                      <span style={{ padding: '12px 16px', borderRadius: 8, backgroundColor: '#dc2626', color: '#fff', fontSize: 12, fontWeight: 600, minHeight: 44, display: 'flex', alignItems: 'center' }}>
                        ✕ Recusado
                      </span>
                    ) : p.resposta === "rehacer" ? (
                      <span style={{ padding: '12px 16px', borderRadius: 8, backgroundColor: '#F25C05', color: '#fff', fontSize: 12, fontWeight: 600, minHeight: 44, display: 'flex', alignItems: 'center' }}>
                        ↩ Rever
                      </span>
                    ) : (
                      <button
                        onClick={() => onRegistrarResposta(p)}
                        style={{ padding: '12px 16px', borderRadius: 8, backgroundColor: '#f3f4f6', color: theme.colors.text.secondary, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', minHeight: 44, display: 'flex', alignItems: 'center' }}
                      >
                        Resposta
                      </button>
                    )}

                    <button
                      onClick={() => onDelete(p.id, p.cliente)}
                      style={{ padding: '12px 16px', borderRadius: 8, backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', minHeight: 44, display: 'flex', alignItems: 'center' }}
                    >
                      X
                    </button>
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
