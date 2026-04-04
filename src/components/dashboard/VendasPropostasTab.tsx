import React from 'react';
import { theme } from "../../styles/theme";

export interface VendasPropostasTabProps {
  propostas: any[];
  vendedor: any;
  onNavigateTo: (tab: string) => void;
}

export function VendasPropostasTab({ propostas, vendedor, onNavigateTo }: VendasPropostasTabProps) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: 28, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>Minhas Propostas</h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>{propostas.length} propostas dos seus clientes</p>
        </div>
        <button onClick={() => onNavigateTo("orcamento")} style={{ padding: "12px 20px", borderRadius: 10, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>+ Nova Proposta</button>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {propostas.map((p) => (
          <div key={p.id} style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 18 }}>{p.cliente}</span>
                  <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 20, backgroundColor: (p.resposta === "sim" ? "#dcfce7" : p.resposta === "nao" ? "#fee2e2" : p.dataEnvio ? "#E8F4FD" : "#f3f4f6"), color: p.resposta === "sim" ? "#16a34a" : p.resposta === "nao" ? "#dc2626" : p.dataEnvio ? "#3498DB" : "#9ca3af", fontWeight: 600 }}>
                    {p.resposta === "sim" ? "✓ Aceito" : p.resposta === "nao" ? "✕ Recusado" : p.dataEnvio ? "Enviada" : "Pendente"}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "#666" }}>{p.numeroOrcamento} · {new Date(p.createdAt).toLocaleDateString("pt-PT")}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800, fontSize: 24, color: theme.colors.accent.primary }}>{p.valor?.toFixed(2)} €</div>
                {p.resposta === "sim" && (
                  <div style={{ fontSize: 12, color: "#10B981", fontWeight: 600 }}>
                    Comissão: {(p.valor * vendedor.comissaoPercent / 100).toFixed(2)}€
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {propostas.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, backgroundColor: "#ffffff", borderRadius: 16, color: theme.colors.text.secondary }}>
            Nenhuma proposta ainda
          </div>
        )}
      </div>
    </div>
  );
}
