import React from 'react';
import { theme } from "../../styles/theme";

export interface VendasFaturacaoTabProps {
  stats: any;
  propostas: any[];
  vendedor: any;
  clientes: any[];
}

export function VendasFaturacaoTab({ stats, propostas, vendedor, clientes }: VendasFaturacaoTabProps) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: 28, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>Faturação</h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>Suas vendas e comissões</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
          <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>Total Vendido</span>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#10B981", marginTop: 8 }}>{stats.valorTotalPropostas.toFixed(2)}€</div>
        </div>
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
          <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>Sua Comissão ({vendedor.comissaoPercent}%)</span>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#F22283", marginTop: 8 }}>{stats.comissaoTotal.toFixed(2)}€</div>
        </div>
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
          <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>Clientes Fiéis</span>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#3498DB", marginTop: 8 }}>{clientes.filter(c => c.categoria === "cliente").length}</div>
        </div>
      </div>

      <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Vendas com Comissão</h3>
        {propostas.filter(p => p.resposta === "sim").map(p => {
          const comissao = (p.valor || 0) * vendedor.comissaoPercent / 100;
          return (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #f0f0f0" }}>
              <div>
                <div style={{ fontWeight: 600, color: theme.colors.text.primary }}>{p.cliente}</div>
                <div style={{ fontSize: 12, color: theme.colors.text.secondary }}>{p.numeroOrcamento}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, color: "#10B981" }}>{p.valor?.toFixed(2)}€</div>
                <div style={{ fontSize: 12, color: "#F22283" }}>+{comissao.toFixed(2)}€ comissão</div>
              </div>
            </div>
          );
        })}
        {propostas.filter(p => p.resposta === "sim").length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: theme.colors.text.secondary }}>
            Nenhuma venda concretizada ainda
          </div>
        )}
      </div>
    </div>
  );
}
