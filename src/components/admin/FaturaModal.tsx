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
        <h3 style={{ fontSize: 20, fontWeight: 900, color: "#1b1c1b", marginBottom: 20, fontFamily: 'Montserrat, sans-serif' }}>Gerar Fatura</h3>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 800, color: "#8e7165", display: "block", marginBottom: 8, textTransform: 'uppercase' }}>Número da Fatura</label>
          <input 
            type="text" 
            value={numeroFatura} 
            onChange={(e) => onNumeroFaturaChange(e.target.value)} 
            placeholder="FAC-2024-XXXX"
            style={{ width: "100%", padding: "14px", borderRadius: 12, border: "2px solid #e5e7eb", fontSize: 14, fontWeight: 700, outline: 'none', transition: 'border-color 0.2s' }} 
            onFocus={(e) => e.target.style.borderColor = '#F25C05'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
        <div style={{ backgroundColor: "#fcf9f7", borderRadius: 12, padding: 16, marginBottom: 20, border: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: 13, color: "#1b1c1b", marginBottom: 8 }}>Cliente: <strong>{faturaData.cliente || faturaData.clienteNome || 'N/A'}</strong></div>
          <div style={{ fontSize: 13, color: "#1b1c1b", marginBottom: 4 }}>Valor Base: <strong>{(Number(faturaData.valor) || 0).toFixed(2)} €</strong></div>
          <div style={{ fontSize: 13, color: "#8e7165", marginBottom: 8 }}>IVA (23%): <strong>{((Number(faturaData.valor) || 0) * 0.23).toFixed(2)} €</strong></div>
          <div style={{ fontSize: 15, color: "#F25C05", borderTop: '1px solid #e5e7eb', paddingTop: 8, fontWeight: 900 }}>Total com IVA: <strong>{((Number(faturaData.valor) || 0) * 1.23).toFixed(2)} €</strong></div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button 
            onClick={onConfirm} 
            style={{ flex: 1, padding: "14px", borderRadius: 12, backgroundColor: "#F25C05", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", boxShadow: '0 4px 12px rgba(242, 92, 5, 0.2)' }}
          >
            Gerar PDF
          </button>
          <button 
            onClick={onClose} 
            style={{ flex: 1, padding: "14px", borderRadius: 12, backgroundColor: "#f3f4f6", color: "#4b5563", border: "none", fontWeight: 700, cursor: "pointer" }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
