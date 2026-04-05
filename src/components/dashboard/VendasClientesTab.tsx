import React from 'react';
import { theme } from "../../styles/theme";
import { UserPlus, Edit, ExternalLink, Phone, Mail } from "lucide-react";

export interface VendasClientesTabProps {
  clientes: any[];
  showNovoCliente: boolean;
  novoCliente: any;
  onNovoClienteChange: (field: string, value: string) => void;
  onToggleForm: () => void;
  onSubmit: () => void;
}

const CATEGORIAS = [
  { value: 'potencial', label: 'Potencial', color: '#F59E0B' },
  { value: 'cliente', label: 'Cliente', color: '#10B981' },
  { value: 'inativo', label: 'Inativo', color: '#6B7280' },
  { value: 'sem_interesse', label: 'Sem Interesse', color: '#DC2626' },
  { value: 'proposta_enviada', label: 'Proposta Enviada', color: '#3498DB' },
];

export function VendasClientesTab({ clientes, showNovoCliente, novoCliente, onNovoClienteChange, onToggleForm, onSubmit }: VendasClientesTabProps) {
  
  const getCategoriaLabel = (cat?: string) => {
    if (!cat) return 'Curioso';
    const c = CATEGORIAS.find(c => c.value === cat);
    return c ? c.label : 'Curioso';
  };

  const getCategoriaColor = (cat?: string) => {
    if (!cat) return '#9CA3AF';
    const c = CATEGORIAS.find(c => c.value === cat);
    return c ? c.color : '#9CA3AF';
  };

  const hasValidProposta = (c: any) => c.propostaId && c.propostaId.trim() !== '';

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: 28, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>Meus Clientes</h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>{clientes.length} clientes atribuídos</p>
        </div>
        <button 
          onClick={onToggleForm} 
          style={{ 
            padding: "12px 20px", 
            borderRadius: 10, 
            backgroundColor: showNovoCliente ? theme.colors.bg.secondary : theme.colors.accent.primary, 
            color: showNovoCliente ? theme.colors.text.primary : "#fff", 
            border: "none", 
            fontWeight: 600, 
            cursor: "pointer", 
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          {showNovoCliente ? 'Cancelar' : <> <UserPlus size={16} /> Novo Cliente</>}
        </button>
      </div>

      {showNovoCliente && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8", marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Novo Cliente</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, color: theme.colors.text.secondary, display: "block", marginBottom: 6 }}>Nome *</label>
              <input 
                value={novoCliente.nome} 
                onChange={(e) => onNovoClienteChange('nome', e.target.value)} 
                placeholder="Nome completo"
                style={{ width: "100%", padding: "12px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13 }} 
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: theme.colors.text.secondary, display: "block", marginBottom: 6 }}>Email</label>
              <input 
                value={novoCliente.email} 
                onChange={(e) => onNovoClienteChange('email', e.target.value)}
                placeholder="email@exemplo.pt"
                type="email"
                style={{ width: "100%", padding: "12px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13 }} 
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: theme.colors.text.secondary, display: "block", marginBottom: 6 }}>Telemóvel</label>
              <input 
                value={novoCliente.telemovel} 
                onChange={(e) => onNovoClienteChange('telemovel', e.target.value)}
                placeholder="+351 9XX XXX XXX"
                style={{ width: "100%", padding: "12px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13 }} 
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: theme.colors.text.secondary, display: "block", marginBottom: 6 }}>Empresa</label>
              <input 
                value={novoCliente.empresa} 
                onChange={(e) => onNovoClienteChange('empresa', e.target.value)}
                placeholder="Nome da empresa"
                style={{ width: "100%", padding: "12px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13 }} 
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button 
              onClick={onSubmit} 
              disabled={!novoCliente.nome?.trim()}
              style={{ 
                padding: "12px 24px", 
                borderRadius: 8, 
                backgroundColor: novoCliente.nome?.trim() ? theme.colors.accent.primary : '#ccc', 
                color: "#fff", 
                border: "none", 
                fontWeight: 600, 
                cursor: novoCliente.nome?.trim() ? "pointer" : "not-allowed",
                opacity: novoCliente.nome?.trim() ? 1 : 0.6
              }}
            >
              Guardar Cliente
            </button>
            <button 
              onClick={onToggleForm} 
              style={{ 
                padding: "12px 24px", 
                borderRadius: 8, 
                backgroundColor: theme.colors.bg.secondary, 
                color: theme.colors.text.primary, 
                border: `1px solid ${theme.colors.border}`, 
                fontWeight: 600, 
                cursor: "pointer" 
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      {clientes.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 24 }}>
          {CATEGORIAS.map(cat => {
            const count = clientes.filter(c => c.categoria === cat.value).length;
            return (
              <div key={cat.value} style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e8e8e8" }}>
                <div style={{ fontSize: 11, color: theme.colors.text.secondary, fontWeight: 600, marginBottom: 4 }}>{cat.label.toUpperCase()}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: cat.color }}>{count}</div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e8e8e8", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "left" }}>Nome</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "left" }}>Categoria</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "left" }}>Contacto</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "left" }}>Orçamento</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "center" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => {
                const catColor = getCategoriaColor(c.categoria);
                const catLabel = getCategoriaLabel(c.categoria);
                return (
                  <tr key={c.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 700, color: theme.colors.text.primary }}>{c.nome}</div>
                      {c.empresa && <div style={{ fontSize: 11, color: "#999" }}>{c.empresa}</div>}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 10, backgroundColor: catColor + '20', padding: "4px 10px", borderRadius: 12, color: catColor, fontWeight: 600 }}>
                        {catLabel}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {c.telemovel && (
                          <a href={`tel:${c.telemovel}`} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#666", textDecoration: "none" }}>
                            <Phone size={12} /> {c.telemovel}
                          </a>
                        )}
                        {c.email && (
                          <a href={`mailto:${c.email}`} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#666", textDecoration: "none" }}>
                            <Mail size={12} /> {c.email}
                          </a>
                        )}
                        {!c.telemovel && !c.email && <span style={{ fontSize: 12, color: "#ccc" }}>—</span>}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {hasValidProposta(c) ? (
                        <a 
                          href={`/p/${c.propostaId}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            color: "#3498DB", 
                            fontWeight: 600, 
                            fontSize: 12, 
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4
                          }}
                        >
                          {c.propostaNumero || c.propostaId.slice(0, 8)} <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span style={{ fontSize: 12, color: "#d1d5db" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      {hasValidProposta(c) ? (
                        <a 
                          href={`/admin/orcamento?edit=${c.propostaId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ 
                            padding: "6px 12px", 
                            borderRadius: 6, 
                            backgroundColor: theme.colors.accent.primary, 
                            color: "#fff", 
                            border: "none", 
                            fontSize: 11, 
                            cursor: "pointer",
                            textDecoration: "none"
                          }}
                        >
                          Editar
                        </a>
                      ) : (
                        <span style={{ fontSize: 11, color: "#ccc" }}>Sem proposta</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {clientes.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 60, textAlign: "center", color: theme.colors.text.secondary }}>
                    Nenhum cliente atribuído ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
