import React from 'react';
import { theme } from "../styles/theme";
import { REDES, SERVICOS_POR_CATEGORIA } from '../lib/constants';
import { Plus } from "lucide-react";

/** UI labels for category keys from SERVICOS_POR_CATEGORIA (keys stay as stored). */
const ORCAMENTO_CAT_ICONS: Record<string, string> = {
  Marketing: "📱", Design: "🎨", Web: "💻",
  Multimédia: "🎬", Multimedia: "🎬",
  Publicidade: "📢", Automação: "⚡", Consultoria: "📊",
};
const ORCAMENTO_CAT_LABELS: Record<string, string> = {
  Marketing: "Marketing", Design: "Design", Web: "Web",
  Multimédia: "Multimedia",
  Publicidade: "Advertising", Automação: "Automation", Consultoria: "Consulting",
};

export interface OrcamentoFormProps {
  cliente: any;
  setCliente: (val: any) => void;
  marcas: any[];
  setMarcas: React.Dispatch<React.SetStateAction<any[]>>;
  
  adicionarMarca: () => void;
  removerMarca: (id: string) => void;
  toggleRede: (marcaId: string, redeId: string) => void;
  toggleServico: (marcaId: string, servico: string) => void;
  
  numeroOrcamentoInput: string;
  setNumeroOrcamentoInput: (val: string) => void;
  isEditingProposta: boolean;
  
  precoTotal: number;
  setPrecoTotal: (val: number) => void;
  descontoPercent: number;
  setDescontoPercent: (val: number) => void;
  descontoValor: number;
  setDescontoValor: (val: number) => void;
  
  subtotalComDesconto: number;
  descuentoAplicado: number;
  ivaComDesconto: number;
  totalConDescuento: number;
  
  propostaId: string | null;
  gerarPDF: () => void;
  handleGuardarProposta: () => void;
  podeGerarProposta: boolean;
  
  isPublicView?: boolean;
  
  // Optional CRM client picker props
  clientesCRM?: any[];
  clienteIdSeleccionado?: string | null;
  setClienteIdSeleccionado?: (val: string | null) => void;
  showClienteDropdown?: boolean;
  setShowClienteDropdown?: (val: boolean) => void;
}

export function OrcamentoForm(props: OrcamentoFormProps) {
  const {
    cliente, setCliente, marcas, setMarcas,
    adicionarMarca, removerMarca, toggleRede, toggleServico,
    numeroOrcamentoInput, setNumeroOrcamentoInput, isEditingProposta,
    precoTotal, setPrecoTotal, descontoPercent, setDescontoPercent,
    descontoValor, setDescontoValor,
    subtotalComDesconto, descuentoAplicado, ivaComDesconto, totalConDescuento,
    propostaId, gerarPDF, handleGuardarProposta, podeGerarProposta,
    isPublicView,
    clientesCRM, clienteIdSeleccionado, setClienteIdSeleccionado, showClienteDropdown, setShowClienteDropdown
  } = props;

  const bgColor = isPublicView ? "#F5F2F0" : theme.colors.bg.secondary;
  const cardBorder = isPublicView ? "none" : `1px solid ${theme.colors.border}`;
  const inputBg = isPublicView ? "#ffffff" : theme.colors.bg.primary;
  const inputBorder = isPublicView ? "1px solid #ddd" : `2px solid ${theme.colors.text.primary}`;
  const textColor = isPublicView ? "#1A1A1A" : theme.colors.text.primary;
  const [searchValue, setSearchValue] = React.useState("");
  
  return (
    <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start", width: "100%" }}>
      <div style={{ flex: isPublicView ? "1 1 600px" : 1 }}>
        <div style={{ marginBottom: 24, backgroundColor: bgColor, borderRadius: 16, padding: 24, border: cardBorder }}>
          <h3 style={{ fontFamily: isPublicView ? "Montserrat, sans-serif" : theme.fontFamily.sans, fontWeight: 700, fontSize: isPublicView ? 18 : 16, color: textColor, margin: "0 0 16px" }}>
            {isPublicView ? "👤 Client details" : "Client details"}
          </h3>
          
          {/* Existing CRM client selector */}
          {!isPublicView && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 6 }}>
                Select existing client (optional)
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="Search clients in CRM..."
                  onChange={e => {
                    setSearchValue(e.target.value);
                    if (setShowClienteDropdown) setShowClienteDropdown(e.target.value.length > 0);
                  }}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: inputBorder, fontSize: 12, backgroundColor: inputBg, color: textColor }}
                />
                {showClienteDropdown && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: bgColor, border: `1px solid ${theme.colors.border}`, borderRadius: 6, zIndex: 100, maxHeight: 200, overflow: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    {(clientesCRM || [])
                      .filter(c => c.nome?.toLowerCase().includes(searchValue.toLowerCase()))
                      .slice(0, 8)
                      .map(c => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setCliente({ nome: c.nome || "", empresa: c.empresa || "", email: c.email || "", telefone: c.telemovel || "", nif: c.nif || "", morada: c.morada || "" });
                            if (setClienteIdSeleccionado) setClienteIdSeleccionado(c.id);
                            if (setShowClienteDropdown) setShowClienteDropdown(false);
                          }}
                          style={{ padding: "10px 14px", cursor: "pointer", fontSize: 12, borderBottom: `1px solid ${theme.colors.border}`, color: textColor }}
                          onMouseOver={e => (e.currentTarget.style.backgroundColor = theme.colors.bg.secondary)}
                          onMouseOut={e => (e.currentTarget.style.backgroundColor = bgColor)}
                        >
                          <div style={{ fontWeight: 600 }}>{c.nome}</div>
                          <div style={{ fontSize: 10, color: theme.colors.text.secondary }}>{c.email} · {c.categoria}</div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div style={{ display: "grid", gridTemplateColumns: isPublicView ? "1fr 1fr" : "repeat(3, 1fr)", gap: 10 }}>
            <div><label style={{ fontSize: 10, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Name *</label><input value={cliente.nome} onChange={(e) => setCliente({...cliente, nome: e.target.value})} style={{ width: "100%", padding: "8px", borderRadius: 6, border: inputBorder, fontSize: 12, backgroundColor: inputBg, color: textColor }} /></div>
            <div><label style={{ fontSize: 10, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Company</label><input value={cliente.empresa} onChange={(e) => setCliente({...cliente, empresa: e.target.value})} style={{ width: "100%", padding: "8px", borderRadius: 6, border: inputBorder, fontSize: 12, backgroundColor: inputBg, color: textColor }} /></div>
            <div><label style={{ fontSize: 10, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Email</label><input value={cliente.email} onChange={(e) => setCliente({...cliente, email: e.target.value})} style={{ width: "100%", padding: "8px", borderRadius: 6, border: inputBorder, fontSize: 12, backgroundColor: inputBg, color: textColor }} /></div>
            <div><label style={{ fontSize: 10, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Phone</label><input value={cliente.telefone} onChange={(e) => setCliente({...cliente, telefone: e.target.value})} style={{ width: "100%", padding: "8px", borderRadius: 6, border: inputBorder, fontSize: 12, backgroundColor: inputBg, color: textColor }} /></div>
            <div><label style={{ fontSize: 10, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>NIF</label><input value={cliente.nif} onChange={(e) => setCliente({...cliente, nif: e.target.value})} placeholder="123456789" style={{ width: "100%", padding: "8px", borderRadius: 6, border: inputBorder, fontSize: 12, backgroundColor: inputBg, color: textColor }} /></div>
            <div><label style={{ fontSize: 10, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Address</label><input value={cliente.morada} onChange={(e) => setCliente({...cliente, morada: e.target.value})} placeholder="Street, number, city" style={{ width: "100%", padding: "8px", borderRadius: 6, border: inputBorder, fontSize: 12, backgroundColor: inputBg, color: textColor }} /></div>
          </div>
        </div>

        <div style={{ marginBottom: 24, backgroundColor: bgColor, borderRadius: 16, padding: 24, border: cardBorder }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ fontFamily: isPublicView ? "Montserrat, sans-serif" : theme.fontFamily.sans, fontWeight: 800, fontSize: isPublicView ? 16 : 14, color: textColor }}>
              {isPublicView ? "🏷️ Brands and social media" : "Brands and social media"}
            </h3>
            {!isPublicView && <button onClick={adicionarMarca} style={{ padding: "6px 12px", borderRadius: 6, backgroundColor: theme.colors.accent.secondary, color: "#fff", border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>+ Add</button>}
          </div>
          {marcas.map((marca, idx) => (
            <div key={marca.id} style={{ backgroundColor: isPublicView ? "#ffffff" : theme.colors.bg.primary, borderRadius: 10, padding: 12, marginBottom: 8, border: isPublicView ? "1px solid #e0ddd9" : `1px solid ${theme.colors.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: textColor }}>Brand {idx + 1}</span>
                {marcas.length > 1 && <button onClick={() => removerMarca(marca.id)} style={{ background: "none", border: "none", color: theme.colors.accent.primary, cursor: "pointer", fontSize: 10 }}>{isPublicView ? "✕" : "X"}</button>}
              </div>
              <input type="text" value={marca.nome} onChange={e => setMarcas(prev => prev.map(m => m.id === marca.id ? { ...m, nome: e.target.value } : m))} placeholder="Brand name" style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: isPublicView ? "1px solid #ddd" : `1px solid ${theme.colors.border}`, fontSize: 11, marginBottom: 8, backgroundColor: inputBg, color: textColor }} />
              <p style={{ fontSize: 10, fontWeight: 600, color: theme.colors.text.secondary, marginBottom: 6 }}>Social networks:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {REDES.map(rede => { 
                  const isSelected = marca.redes.includes(rede.id); 
                  return (
                    <button key={rede.id} onClick={() => toggleRede(marca.id, rede.id)} style={{ fontSize: 9, fontWeight: 600, backgroundColor: isSelected ? rede.cor : inputBg, color: isSelected ? "#ffffff" : textColor, border: isSelected ? "none" : (isPublicView ? "1px solid #ddd" : `1px solid ${theme.colors.border}`), borderRadius: 20, padding: "4px 8px", cursor: "pointer" }}>
                      {rede.nome}
                    </button>
                  ); 
                })}
              </div>
              {!isPublicView && (
                <>
                  <p style={{ fontSize: 10, fontWeight: 600, color: theme.colors.text.secondary, marginBottom: 6, marginTop: 10 }}>Services:</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {Object.entries(SERVICOS_POR_CATEGORIA).map(([categoria, servicos]) => {
                      const catIcon = ORCAMENTO_CAT_ICONS[categoria] ?? "📦";
                      const catLabel = ORCAMENTO_CAT_LABELS[categoria] ?? categoria;
                      return (
                        <div key={categoria} style={{ width: "100%", marginBottom: 4 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                            <span style={{ fontSize: 10 }}>{catIcon}</span>
                            <span style={{ fontSize: 9, fontWeight: 700, color: textColor }}>{catLabel}</span>
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                            {(servicos as string[]).map((s) => { 
                              const sel = marca.servicos.includes(s); 
                              return (
                                <button key={s} onClick={() => toggleServico(marca.id, s)} style={{ fontSize: 8, fontWeight: 600, backgroundColor: sel ? theme.colors.accent.primary : inputBg, color: sel ? "#ffffff" : textColor, border: sel ? `1px solid ${theme.colors.accent.primary}` : `1px solid rgba(0,0,0,0.10)`, borderRadius: 12, padding: "2px 6px", cursor: "pointer" }}>
                                  {sel ? "✓ " : ""}{s}
                                </button>
                              ); 
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ))}
          {isPublicView && (
            <button onClick={adicionarMarca} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "2px dashed #ccc", backgroundColor: "transparent", color: "#666", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Plus size={16} /> Add brand
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: isPublicView ? "0 1 320px" : "0 0 320px", position: "sticky", top: isPublicView ? 100 : 40 }}>
        <div style={{ backgroundColor: bgColor, borderRadius: 16, padding: 24, border: cardBorder, boxShadow: isPublicView ? "0 4px 20px rgba(0,0,0,0.08)" : "none" }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, margin: "0 0 16px", color: textColor }}>
            {isPublicView ? "📋 Quote summary" : "Quote summary"}
          </h3>
          <div style={{ marginBottom: 16 }}><label style={{ fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 6 }}>Quote no.</label><input type="text" value={numeroOrcamentoInput} onChange={e => !isEditingProposta && setNumeroOrcamentoInput(e.target.value.toUpperCase())} placeholder="ORC-0001" disabled={isEditingProposta} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: inputBorder, fontSize: 14, fontWeight: 700, textAlign: "center", backgroundColor: isEditingProposta ? theme.colors.bg.tertiary : inputBg, color: textColor }} /></div>
          <div style={{ marginBottom: 16 }}><label style={{ fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 6 }}>Total amount (incl. VAT)</label><div style={{ display: "flex", alignItems: "center", gap: 8 }}><input type="number" value={precoTotal || ""} onChange={e => setPrecoTotal(Number(e.target.value))} placeholder="0.00" style={{ flex: 1, padding: "12px", borderRadius: 8, border: inputBorder, fontSize: 18, fontWeight: 700, textAlign: "right", backgroundColor: inputBg, color: textColor }} /><span style={{ fontWeight: 700, fontSize: 18, color: textColor }}>€</span></div></div>
          <div style={{ marginBottom: 16 }}><label style={{ fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 6 }}>Discount</label><div style={{ display: "flex", gap: 8 }}><div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}><input type="number" value={descontoPercent || ""} onChange={e => setDescontoPercent(Number(e.target.value))} placeholder="0" style={{ width: "100%", padding: "10px", borderRadius: 8, border: isPublicView ? "1px solid #ddd" : `1px solid ${theme.colors.border}`, fontSize: 13, textAlign: "right", backgroundColor: inputBg, color: textColor }} /><span style={{ fontSize: 12, color: theme.colors.text.secondary }}>%</span></div><div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}><input type="number" value={descontoValor || ""} onChange={e => setDescontoValor(Number(e.target.value))} placeholder="0" style={{ width: "100%", padding: "10px", borderRadius: 8, border: isPublicView ? "1px solid #ddd" : `1px solid ${theme.colors.border}`, fontSize: 13, textAlign: "right", backgroundColor: inputBg, color: textColor }} /><span style={{ fontSize: 12, color: theme.colors.text.secondary }}>€</span></div></div></div>
          <div style={{ backgroundColor: isPublicView ? "#ffffff" : theme.colors.bg.primary, borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px dashed ${theme.colors.border}` }}><span style={{ fontSize: 12, color: theme.colors.text.secondary }}>Subtotal (excl. VAT)</span><span style={{ fontSize: 12, fontWeight: 600, color: textColor }}>{subtotalComDesconto.toFixed(2)} €</span></div>
            {descuentoAplicado > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px dashed ${theme.colors.border}`, color: theme.colors.accent.primary }}><span style={{ fontSize: 12, fontWeight: 600 }}>Discount</span><span style={{ fontSize: 12, fontWeight: 600 }}>- {descuentoAplicado.toFixed(2)} €</span></div>}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px dashed ${theme.colors.border}` }}><span style={{ fontSize: 12, color: theme.colors.text.secondary }}>VAT (23%)</span><span style={{ fontSize: 12, fontWeight: 600, color: textColor }}>{ivaComDesconto.toFixed(2)} €</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8 }}><span style={{ fontSize: 14, fontWeight: 700, color: textColor }}>TOTAL</span><span style={{ fontSize: 20, fontWeight: 900, color: theme.colors.accent.primary }}>{totalConDescuento.toFixed(2)} €</span></div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button onClick={gerarPDF} disabled={!podeGerarProposta} style={{ flex: 1, padding: "12px", borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: podeGerarProposta ? "pointer" : "not-allowed", backgroundColor: "#3498DB", color: "#ffffff", border: "none" }}>{isPublicView ? "📄 Preview PDF" : "PDF"}</button>
            {propostaId ? (
              <a href={`/p/${propostaId}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "12px", borderRadius: 10, fontWeight: 700, fontSize: 12, backgroundColor: theme.colors.accent.primary, color: "#ffffff", border: "none", textDecoration: "none", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>{isPublicView ? "👁️ Preview proposal" : "View proposal"}</a>
            ) : (
              <button disabled style={{ flex: 1, padding: "12px", borderRadius: 10, fontWeight: 700, fontSize: 12, backgroundColor: isPublicView ? "#666666" : "#cccccc", color: isPublicView ? "#aaaaaa" : "#ffffff", border: "none" }}>{isPublicView ? "👁️ Save first" : "Save first"}</button>
            )}
          </div>
          <button onClick={handleGuardarProposta} disabled={!podeGerarProposta} style={{ width: "100%", padding: "14px", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: podeGerarProposta ? "pointer" : "not-allowed", backgroundColor: podeGerarProposta ? theme.colors.accent.secondary : "#cccccc", color: "#ffffff", border: "none" }}>{isPublicView ? "💾 Save proposal" : "Save proposal"}</button>
        </div>
      </div>
    </div>
  );
}
