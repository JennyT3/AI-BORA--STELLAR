import React from 'react';

export interface FaturaModalProps {
  faturaData: any;
  numeroFatura: string;
  onNumeroFaturaChange: (val: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function FaturaModal(props: FaturaModalProps) {
  const {
    faturaData,
    numeroFatura,
    onNumeroFaturaChange,
    onConfirm,
    onClose
  } = props;

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, maxWidth: 400, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "theme.colors.text.primary", marginBottom: 16 }}>Gerar Fatura</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Número da Fatura</label>
          <input type="text" value={numeroFatura} onChange={(e) => onNumeroFaturaChange(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "2px solid theme.colors.text.primary", fontSize: 14, fontWeight: 600 }} />
        </div>
        <div style={{ backgroundColor: "#f5f5f5", borderRadius: 8, padding: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#666" }}>Cliente: <strong>{faturaData.cliente}</strong></div>
          <div style={{ fontSize: 12, color: "#666" }}>Valor: <strong style={{ color: "#F22283" }}>{faturaData.valor?.toFixed(2)} €</strong></div>
          <div style={{ fontSize: 11, color: "theme.colors.text.secondary" }}>IVA (23%): {(faturaData.valor / 1.23 * 0.23).toFixed(2)} €</div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onConfirm} style={{ flex: 1, padding: "12px", borderRadius: 8, backgroundColor: "theme.colors.accent.primary", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>Gerar PDF</button>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: 8, backgroundColor: "#f5f5f5", color: "#666", border: "none", fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
