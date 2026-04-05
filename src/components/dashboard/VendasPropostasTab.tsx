import React, { useState } from 'react';
import { theme } from "../../styles/theme";
import { Filter, ExternalLink } from "lucide-react";

export interface VendasPropostasTabProps {
  propostas: any[];
  vendedor: any;
  onNavigateTo: (tab: string) => void;
}

const STATUS_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'pendente', label: 'Pendentes' },
  { value: 'enviada', label: 'Enviadas' },
  { value: 'sim', label: 'Aceites' },
  { value: 'nao', label: 'Recusadas' },
];

export function VendasPropostasTab({ propostas, vendedor, onNavigateTo }: VendasPropostasTabProps) {
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredPropostas = propostas.filter(p => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pendente') return !p.dataEnvio;
    if (filterStatus === 'enviada') return p.dataEnvio && !p.resposta;
    return p.resposta === filterStatus;
  });

  const getStatusBadge = (p: any) => {
    if (p.resposta === 'sim') return { bg: '#dcfce7', color: '#16a34a', label: '✓ Aceito' };
    if (p.resposta === 'nao') return { bg: '#fee2e2', color: '#dc2626', label: '✕ Recusado' };
    if (p.resposta === 'reagendar') return { bg: '#fef3c7', color: '#d97706', label: '↻ Reagendar' };
    if (p.dataEnvio) return { bg: '#e8f5e9', color: '#3498db', label: 'Enviada' };
    return { bg: '#f3f4f6', color: '#9ca3af', label: 'Pendente' };
  };

  const formatComissao = (valor: number, comissaoPercent?: number) => {
    if (!valor || !comissaoPercent) return '—';
    return `${(valor * comissaoPercent / 100).toFixed(2)} €`;
  };

  const totalValor = filteredPropostas.reduce((acc, p) => acc + (p.valor || 0), 0);
  const totalComissao = filteredPropostas
    .filter(p => p.resposta === 'sim')
    .reduce((acc, p) => acc + (p.valor || 0) * (vendedor?.comissaoPercent || 0) / 100, 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: 28, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>Minhas Propostas</h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>{propostas.length} propostas dos seus clientes</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${theme.colors.border}`, fontSize: 13, backgroundColor: "#fff" }}
          >
            {STATUS_FILTERS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {filteredPropostas.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
          <div style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e8e8e8" }}>
            <div style={{ fontSize: 11, color: theme.colors.text.secondary, fontWeight: 600, marginBottom: 4 }}>TOTAL PROPOSTAS</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: theme.colors.text.primary }}>{filteredPropostas.length}</div>
          </div>
          <div style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e8e8e8" }}>
            <div style={{ fontSize: 11, color: theme.colors.text.secondary, fontWeight: 600, marginBottom: 4 }}>VALOR TOTAL</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#10B981" }}>{totalValor.toFixed(2)} €</div>
          </div>
          <div style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e8e8e8" }}>
            <div style={{ fontSize: 11, color: theme.colors.text.secondary, fontWeight: 600, marginBottom: 4 }}>COMISSÃO TOTAL</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: theme.colors.accent.primary }}>{totalComissao.toFixed(2)} €</div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: 16 }}>
        {filteredPropostas.map((p) => {
          const statusBadge = getStatusBadge(p);
          return (
            <div key={p.id} style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 20, border: "1px solid #e8e8e8" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 16, color: theme.colors.text.primary }}>{p.cliente}</span>
                    <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 20, backgroundColor: statusBadge.bg, color: statusBadge.color, fontWeight: 600 }}>
                      {statusBadge.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#666", display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <span>{p.numeroOrcamento || '—'}</span>
                    <span>{new Date(p.createdAt).toLocaleDateString('pt-PT')}</span>
                    {p.dataEnvio && <span>Enviada: {new Date(p.dataEnvio).toLocaleDateString('pt-PT')}</span>}
                  </div>
                  {p.servicos && p.servicos.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                      {p.servicos.slice(0, 3).map((s: string, i: number) => (
                        <span key={i} style={{ fontSize: 10, backgroundColor: "#f5f5f5", padding: "4px 8px", borderRadius: 12, color: "#666" }}>{s}</span>
                      ))}
                      {p.servicos.length > 3 && <span style={{ fontSize: 10, color: "#999" }}>+{p.servicos.length - 3}</span>}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 22, color: theme.colors.accent.primary }}>{p.valor?.toFixed(2) || '0.00'} €</div>
                  {p.resposta === 'sim' && (
                    <div style={{ fontSize: 11, color: "#10B981", fontWeight: 600, marginTop: 4 }}>
                      Comissão: {formatComissao(p.valor, vendedor?.comissaoPercent)}
                    </div>
                  )}
                  {p.id && (
                    <a 
                      href={p.clienteId ? `/p/${p.id}` : '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: "#3498DB", marginTop: 8, textDecoration: 'none' }}
                    >
                      Ver Proposta <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filteredPropostas.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, backgroundColor: "#ffffff", borderRadius: 16, color: theme.colors.text.secondary }}>
            {filterStatus === 'all' ? 'Nenhuma proposta ainda' : `Nenhuma proposta com status "${STATUS_FILTERS.find(f => f.value === filterStatus)?.label}"`}
          </div>
        )}
      </div>
    </div>
  );
}
