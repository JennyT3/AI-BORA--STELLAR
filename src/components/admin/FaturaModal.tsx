import React, { useState, useEffect } from 'react';
import { gerarFaturaPDF } from '../../services/gerarFaturaPDF';
import { Download, Eye, X, Edit2, Save } from 'lucide-react';

export interface FaturaModalProps {
  faturaData: any;
  numeroFatura: string;
  onNumeroFaturaChange: (val: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

interface FaturaPreviewData {
  numeroFatura: string;
  dataEmissao: string;
  cliente: string;
  empresa: string;
  email: string;
  telefone: string;
  nif: string;
  morada: string;
  servicos: string[];
  subtotal: number;
  iva: number;
  total: number;
}

export function FaturaModal(props: FaturaModalProps) {
  const { faturaData, numeroFatura, onNumeroFaturaChange, onConfirm, onClose } = props;
  const [showPreview, setShowPreview] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [previewData, setPreviewData] = useState<FaturaPreviewData>({
    numeroFatura,
    dataEmissao: new Date().toLocaleDateString('en-GB'),
    cliente: '',
    empresa: '',
    email: '',
    telefone: '',
    nif: '',
    morada: '',
    servicos: [],
    subtotal: 0,
    iva: 0,
    total: 0,
  });

  useEffect(() => {
    const cliente = faturaData;
    const subtotal = Number(cliente.propostaValor || cliente.valor) || 0;
    const iva = subtotal * 0.23;
    const total = subtotal * 1.23;

    setPreviewData({
      numeroFatura,
      dataEmissao: new Date().toLocaleDateString('en-GB'),
      cliente: cliente.nome || cliente.cliente || 'Client',
      empresa: cliente.empresa || '',
      email: cliente.email || '',
      telefone: cliente.telemovel || cliente.telefone || '',
      nif: cliente.nif || '',
      morada: cliente.morada || '',
      servicos: Array.isArray(cliente.servicos) ? cliente.servicos : 
                (cliente.servicos ? [cliente.servicos] : 
                (cliente.propostaServicos || ['AI BORA services'])),
      subtotal,
      iva,
      total,
    });
  }, [faturaData, numeroFatura]);

  const handleGerarPDF = async () => {
    try {
      const doc = await gerarFaturaPDF({
        ...previewData,
        tipo: 'cliente',
      });
      doc.save(`Fatura-${previewData.numeroFatura}.pdf`);
      alert('Invoice PDF generated successfully.');
      onConfirm();
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      alert('Could not generate the invoice. Please try again.');
    }
  };

  const handleFieldChange = (field: keyof FaturaPreviewData, value: string | number | string[]) => {
    setPreviewData(prev => ({ ...prev, [field]: value }));
    if (field === 'subtotal') {
      const newSubtotal = Number(value);
      setPreviewData(prev => ({
        ...prev,
        subtotal: newSubtotal,
        iva: newSubtotal * 0.23,
        total: newSubtotal * 1.23,
      }));
    }
  };

  if (showPreview) {
    return (
      <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: 20 }}>
        <div style={{ backgroundColor: "#fff", borderRadius: 16, maxWidth: 800, width: "100%", maxHeight: '90vh', overflow: 'auto' }}>
          {/* Preview Header */}
          <div style={{ padding: 24, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10 }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: "#1b1c1b", fontFamily: 'Montserrat, sans-serif' }}>Invoice preview</h3>
            <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
              <X size={24} color="#666" />
            </button>
          </div>

          {/* Preview Content - Invoice Style */}
          <div style={{ padding: 40, fontFamily: 'Montserrat, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#1b1c1b' }}>AI <span style={{ color: '#F25C05' }}>BORA</span></div>
                <div style={{ fontSize: 10, color: '#8e7165' }}>Digital & creative marketing</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1b1c1b' }}>{previewData.numeroFatura}</div>
                <div style={{ fontSize: 12, color: '#666' }}>Date: {previewData.dataEmissao}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 40, marginBottom: 30 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#F25C05', marginBottom: 8 }}>ISSUED BY</div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  <div style={{ fontWeight: 700, color: '#1b1c1b' }}>AI BORA, Lda</div>
                  <div>NIF: 319918645</div>
                  <div>geral@aibora.pt</div>
                  <div>+351 936 021 747</div>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#F25C05', marginBottom: 8 }}>BILL TO</div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  <div style={{ fontWeight: 700, color: '#1b1c1b' }}>{previewData.cliente}</div>
                  {previewData.empresa && <div>{previewData.empresa}</div>}
                  {previewData.nif && <div>NIF: {previewData.nif}</div>}
                  {previewData.email && <div>{previewData.email}</div>}
                  {previewData.telefone && <div>{previewData.telefone}</div>}
                  {previewData.morada && <div>{previewData.morada}</div>}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#F25C05', marginBottom: 8 }}>SERVICES</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1b1c1b', color: '#fff' }}>
                    <th style={{ padding: '10px 12px', fontSize: 10, textAlign: 'left' }}>#</th>
                    <th style={{ padding: '10px 12px', fontSize: 10, textAlign: 'left' }}>Description</th>
                    <th style={{ padding: '10px 12px', fontSize: 10, textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.servicos.map((servico, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '10px 12px', fontSize: 11 }}>{idx + 1}</td>
                      <td style={{ padding: '10px 12px', fontSize: 11 }}>{servico}</td>
                      <td style={{ padding: '10px 12px', fontSize: 11, textAlign: 'right' }}>
                        {idx === 0 ? previewData.subtotal.toFixed(2) + ' €' : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 30 }}>
              <div style={{ backgroundColor: '#F25C05', padding: '20px 30px', borderRadius: 12, color: '#fff', textAlign: 'right' }}>
                <div style={{ fontSize: 10, fontWeight: 600 }}>TOTAL DUE (incl. 23% VAT)</div>
                <div style={{ fontSize: 24, fontWeight: 900 }}>{previewData.total.toFixed(2)} €</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#666', borderTop: '1px solid #e5e7eb', paddingTop: 20 }}>
              <div>IBAN: PT50 0000 0000 0000 0000 0000 0</div>
              <div>Payment by bank transfer within 5 business days</div>
            </div>
          </div>

          {/* Preview Footer */}
          <div style={{ padding: 24, borderTop: '1px solid #e5e7eb', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button 
              onClick={() => setShowPreview(false)} 
              style={{ padding: "12px 24px", borderRadius: 12, backgroundColor: "#f3f4f6", color: "#4b5563", border: "none", fontWeight: 700, cursor: "pointer" }}
            >
              Edit details
            </button>
            <button 
              onClick={handleGerarPDF} 
              style={{ padding: "12px 24px", borderRadius: 12, backgroundColor: "#10B981", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Download size={18} /> Download PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, maxWidth: 450, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <h3 style={{ fontSize: 20, fontWeight: 900, color: "#1b1c1b", marginBottom: 20, fontFamily: 'Montserrat, sans-serif' }}>Generate invoice</h3>
        
        {editMode ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: "#8e7165", display: "block", marginBottom: 6 }}>NUMBER</label>
              <input 
                type="text" 
                value={previewData.numeroFatura} 
                onChange={(e) => {
                  onNumeroFaturaChange(e.target.value);
                  handleFieldChange('numeroFatura', e.target.value);
                }}
                style={{ width: "100%", padding: "12px", borderRadius: 10, border: "2px solid #e5e7eb", fontSize: 14, fontWeight: 600 }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: "#8e7165", display: "block", marginBottom: 6 }}>CLIENT</label>
              <input 
                type="text" 
                value={previewData.cliente} 
                onChange={(e) => handleFieldChange('cliente', e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: 10, border: "2px solid #e5e7eb", fontSize: 14, fontWeight: 600 }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "#8e7165", display: "block", marginBottom: 6 }}>NIF</label>
                <input 
                  type="text" 
                  value={previewData.nif} 
                  onChange={(e) => handleFieldChange('nif', e.target.value)}
                  style={{ width: "100%", padding: "12px", borderRadius: 10, border: "2px solid #e5e7eb", fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "#8e7165", display: "block", marginBottom: 6 }}>AMOUNT (€)</label>
                <input 
                  type="number" 
                  value={previewData.subtotal} 
                  onChange={(e) => handleFieldChange('subtotal', parseFloat(e.target.value) || 0)}
                  style={{ width: "100%", padding: "12px", borderRadius: 10, border: "2px solid #e5e7eb", fontSize: 14 }}
                />
              </div>
            </div>
          </>
        ) : (
          <div style={{ backgroundColor: "#fcf9f7", borderRadius: 12, padding: 16, marginBottom: 20, border: '1px solid #f3f4f6' }}>
            <div style={{ fontSize: 13, color: "#1b1c1b", marginBottom: 8 }}>Client: <strong>{previewData.cliente}</strong></div>
            <div style={{ fontSize: 13, color: "#1b1c1b", marginBottom: 4 }}>NIF: <strong>{previewData.nif || '—'}</strong></div>
            <div style={{ fontSize: 13, color: "#1b1c1b", marginBottom: 4 }}>Subtotal: <strong>{previewData.subtotal.toFixed(2)} €</strong></div>
            <div style={{ fontSize: 13, color: "#8e7165", marginBottom: 8 }}>VAT (23%): <strong>{previewData.iva.toFixed(2)} €</strong></div>
            <div style={{ fontSize: 15, color: "#F25C05", borderTop: '1px solid #e5e7eb', paddingTop: 8, fontWeight: 900 }}>Total (incl. VAT): <strong>{previewData.total.toFixed(2)} €</strong></div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, flexDirection: 'column' }}>
          <div style={{ display: "flex", gap: 12 }}>
            <button 
              onClick={() => setShowPreview(true)} 
              style={{ flex: 1, padding: "14px", borderRadius: 12, backgroundColor: "#3498DB", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Eye size={18} /> Preview
            </button>
            <button 
              onClick={() => setEditMode(!editMode)} 
              style={{ padding: "14px", borderRadius: 12, backgroundColor: "#f3f4f6", color: "#4b5563", border: "none", fontWeight: 700, cursor: "pointer" }}
            >
              <Edit2 size={18} />
            </button>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button 
              onClick={handleGerarPDF} 
              style={{ flex: 1, padding: "14px", borderRadius: 12, backgroundColor: "#F25C05", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", boxShadow: '0 4px 12px rgba(242, 92, 5, 0.2)' }}
            >
              <Download size={18} style={{ display: 'inline', marginRight: 8 }} /> Generate PDF
            </button>
            <button 
              onClick={onClose} 
              style={{ flex: 1, padding: "14px", borderRadius: 12, backgroundColor: "#f3f4f6", color: "#4b5563", border: "none", fontWeight: 700, cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}