import React from 'react';
import { theme } from "../../styles/theme";
import { Download } from "lucide-react";
import { gerarFaturaPDF } from "../../services/gerarFaturaPDF";

export interface VendasFaturacaoTabProps {
  stats: any;
  propostas: any[];
  vendedor: any;
  clientes: any[];
  tareas?: any[];
  isMobile?: boolean;
}

export function VendasFaturacaoTab({ stats, propostas, vendedor, clientes, tareas, isMobile }: VendasFaturacaoTabProps) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: 28, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>Billing</h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>Your sales and commissions</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 20, marginBottom: 32 }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
          <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>Total Vendido</span>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#10B981", marginTop: 8 }}>{stats.valorTotalPropostas.toFixed(2)}€</div>
        </div>
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
          <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>Your commission ({vendedor.comissaoPercent}%)</span>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#F22283", marginTop: 8 }}>{stats.comissaoTotal.toFixed(2)}€</div>
        </div>
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
          <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>Clientes Fiéis</span>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#3498DB", marginTop: 8 }}>{clientes.filter(c => c.categoria === "cliente").length}</div>
        </div>
      </div>

      <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8", marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Sales with commission</h3>
        {propostas.filter(p => p.resposta === "sim").map(p => {
          const comissao = (p.valor || 0) * vendedor.comissaoPercent / 100;
          return (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #f0f0f0" }}>
              <div>
                <div style={{ fontWeight: 600, color: theme.colors.text.primary }}>{p.cliente}</div>
                <div style={{ fontSize: 12, color: theme.colors.text.secondary }}>{p.numeroOrcamento}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, color: "#10B981" }}>{p.valor?.toFixed(2)}€</div>
                  <div style={{ fontSize: 12, color: "#F22283" }}>+{comissao.toFixed(2)}€ commission</div>
                </div>
                <button 
                  onClick={async () => {
                    const doc = await gerarFaturaPDF({
                      numeroFatura: p.numeroOrcamento || "FAC-AUTO",
                      dataEmissao: new Date().toLocaleDateString('pt-PT'),
                      cliente: p.cliente,
                      servicos: p.servicos || ["Marketing services"],
                      subtotal: p.valor || 0,
                      iva: (p.valor || 0) * 0.23,
                      total: (p.valor || 0) * 1.23,
                      tipo: 'cliente'
                    });
                    doc.save(`Fatura_${p.numeroOrcamento || p.id}.pdf`);
                  }}
                  style={{ background: '#fcf9f7', border: 'none', padding: 8, borderRadius: 8, cursor: 'pointer', color: '#F25C05' }}
                  title="Descarregar Fatura"
                >
                  <Download size={18} />
                </button>
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

      <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Commissions from completed tasks</h3>
        {(tareas || []).filter(t => t.estado === 'paga' && t.asignadaA === vendedor.id && t.comissaoColaboradorValor).map(t => {
          return (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #f0f0f0" }}>
              <div>
                <div style={{ fontWeight: 600, color: theme.colors.text.primary }}>{t.titulo}</div>
                <div style={{ fontSize: 12, color: theme.colors.text.secondary }}>{t.clienteNome}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, color: "#10B981" }}>
                   {t.comissaoColaboradorTipo === 'percentagem' 
                     ? `${t.comissaoColaboradorValor}% do valor` 
                     : `${Number(t.comissaoColaboradorValor).toFixed(2)}€`}
                </div>
                <div style={{ fontSize: 12, color: "#F22283" }}>Status: Pago</div>
              </div>
            </div>
          );
        })}
        {(tareas || []).filter(t => t.estado === 'paga' && t.asignadaA === vendedor.id && t.comissaoColaboradorValor).length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: theme.colors.text.secondary }}>
            No task commissions recorded yet
          </div>
        )}
      </div>
    </div>
  );
}
