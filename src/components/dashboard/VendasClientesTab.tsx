import React from 'react';
import { theme } from "../../styles/theme";

export interface VendasClientesTabProps {
  clientes: any[];
  showNovoCliente: boolean;
  novoCliente: any;
  onNovoClienteChange: (field: string, value: string) => void;
  onToggleForm: () => void;
  onSubmit: () => void;
}

export function VendasClientesTab({ clientes, showNovoCliente, novoCliente, onNovoClienteChange, onToggleForm, onSubmit }: VendasClientesTabProps) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: 28, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>Meus Clientes</h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>{clientes.length} clientes atribuídos</p>
        </div>
        <button onClick={onToggleForm} style={{ padding: "12px 20px", borderRadius: 10, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>+ Novo Cliente</button>
      </div>

      {showNovoCliente && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8", marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Novo Cliente</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Nome *</label>
              <input value={novoCliente.nome} onChange={(e) => onNovoClienteChange('nome', e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Email</label>
              <input value={novoCliente.email} onChange={(e) => onNovoClienteChange('email', e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Telemóvel</label>
              <input value={novoCliente.telemovel} onChange={(e) => onNovoClienteChange('telemovel', e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13 }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button onClick={onSubmit} style={{ padding: "10px 20px", borderRadius: 8, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>Guardar</button>
            <button onClick={onToggleForm} style={{ padding: "10px 20px", borderRadius: 8, backgroundColor: theme.colors.bg.secondary, color: theme.colors.text.primary, border: `1px solid ${theme.colors.border}`, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e8e8e8", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "left" }}>Nome</th>
              <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "left" }}>Categoria</th>
              <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "left" }}>Telefone</th>
              <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "left" }}>Email</th>
              <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "left" }}>Orçamento</th>
              <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "center" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                <td style={{ padding: "12px 14px" }}><div style={{ fontWeight: 700, color: theme.colors.text.primary }}>{c.nome}</div></td>
                <td style={{ padding: "12px 14px" }}>
                  <span style={{ fontSize: 10, backgroundColor: (c.categoria === "cliente" ? "#10B981" : "#F59E0B") + "20", padding: "4px 8px", borderRadius: 12, color: c.categoria === "cliente" ? "#10B981" : "#F59E0B", fontWeight: 600 }}>
                    {c.categoria === "cliente" ? "Cliente" : c.categoria === "potencial" ? "Potencial" : "Curioso"}
                  </span>
                </td>
                <td style={{ padding: "12px 14px", fontSize: 12, color: "#666" }}>{c.telemovel || "—"}</td>
                <td style={{ padding: "12px 14px", fontSize: 12, color: "#666" }}>{c.email || "—"}</td>
                <td style={{ padding: "12px 14px" }}>
                  {c.propostaNumero ? (
                    <a href={`/admin/orcamento?edit=${c.propostaId}`} target="_blank" style={{ color: "#3498DB", fontWeight: 600, fontSize: 12, textDecoration: "none" }}>{c.propostaNumero}</a>
                  ) : <span style={{ fontSize: 12, color: "#d1d5db" }}>—</span>}
                </td>
                <td style={{ padding: "12px 14px", textAlign: "center" }}>
                  <button onClick={() => window.location.href = `/admin/orcamento?edit=${c.propostaId}`} style={{ padding: "6px 12px", borderRadius: 6, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontSize: 11, cursor: "pointer" }}>
                    Ver/Editar
                  </button>
                </td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 40, textAlign: "center", color: theme.colors.text.secondary }}>
                  Nenhum cliente atribuído ainda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
