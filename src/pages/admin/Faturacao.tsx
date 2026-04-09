import { useState, useEffect } from "react";
import { DollarSign, FileText, CheckCircle, Clock, AlertCircle, Search, Filter, X } from "lucide-react";
import { theme } from "../../styles/theme";
import { listFaturasAll, updateFatura, pagarFatura, Fatura, calcularEstatisticasFaturas } from "../../services/faturas";
import { getCliente } from "../../services/firebase";

interface FaturacaoProps {
  clientes: any[];
  onCriarFatura: (cliente: any) => void;
  onNavigateClientes: () => void;
}

export function Faturacao({ clientes, onCriarFatura, onNavigateClientes }: FaturacaoProps) {
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [filterCliente, setFilterCliente] = useState<string>('');
  const [filterDataInicio, setFilterDataInicio] = useState<string>('');
  const [filterDataFim, setFilterDataFim] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [clientesMap, setClientesMap] = useState<Record<string, any>>({});

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    loadFaturas();
    loadClientesMap();
  }, []);

  const loadClientesMap = async () => {
    const map: Record<string, any> = {};
    for (const c of clientes) {
      map[c.id] = c;
    }
    setClientesMap(map);
  };

  const loadFaturas = async () => {
    setLoading(true);
    try {
      const faturasData = await listFaturasAll();
      setFaturas(faturasData);
    } catch (err) {
      console.error('Error loading invoices:', err);
    }
    setLoading(false);
  };

  const stats = calcularEstatisticasFaturas(faturas);

  const filteredFaturas = faturas.filter(f => {
    if (filterEstado && f.estado !== filterEstado) return false;
    if (filterCliente && f.clienteId !== filterCliente) return false;
    if (filterDataInicio && new Date(f.dataEmissao) < new Date(filterDataInicio)) return false;
    if (filterDataFim && new Date(f.dataEmissao) > new Date(filterDataFim)) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const clienteNome = clientesMap[f.clienteId]?.nome || f.clienteNome || '';
      if (!clienteNome.toLowerCase().includes(search) && !f.numero?.toLowerCase().includes(search)) {
        return false;
      }
    }
    return true;
  });

  const handlePagarFatura = async (faturaId: string) => {
    setProcessingId(faturaId);
    try {
      const fatura = faturas.find(f => f.id === faturaId);
      if (!fatura) return;
      
      const vendedor = clientesMap[fatura.clienteId]?.vendedorId;
      
      await pagarFatura(faturaId, 'transferencia', vendedor ? {
        vendedorId: vendedor,
        colaboradorId: undefined
      } : undefined);
      
      await loadFaturas();
    } catch (err) {
      console.error('Error processing payment:', err);
      alert('Could not process payment');
    }
    setProcessingId(null);
  };

  const clearFilters = () => {
    setFilterEstado('');
    setFilterCliente('');
    setFilterDataInicio('');
    setFilterDataFim('');
    setSearchTerm('');
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'paga': return '#10B981';
      case 'pendente': return '#F59E0B';
      case 'vencida': return '#EF4444';
      case 'cancelada': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const hasFilters = filterEstado || filterCliente || filterDataInicio || filterDataFim || searchTerm;

  const invoiceEstadoLabel = (e: string) =>
    ({ pendente: 'Pending', paga: 'Paid', vencida: 'Overdue', cancelada: 'Cancelled' } as Record<string, string>)[e] || e;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: isMobile ? 24 : 28, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>Invoicing</h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>Invoice and payment management</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: isMobile ? 12 : 20, marginBottom: isMobile ? 20 : 32 }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: isMobile ? 12 : 16, padding: isMobile ? 16 : 24, border: `1px solid ${theme.colors.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DollarSign size={20} color="#10B981" />
            </div>
            <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>Total collected</span>
          </div>
          <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, color: "#10B981" }}>{stats.totalPago.toFixed(2)} €</div>
          <div style={{ fontSize: 11, color: theme.colors.text.secondary, marginTop: 4 }}>{stats.contagemPago} paid invoices</div>
        </div>

        <div style={{ backgroundColor: "#ffffff", borderRadius: isMobile ? 12 : 16, padding: isMobile ? 16 : 24, border: `1px solid ${theme.colors.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "rgba(245, 158, 11, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={20} color="#F59E0B" />
            </div>
            <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>Outstanding</span>
          </div>
          <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, color: "#F59E0B" }}>{stats.totalPendente.toFixed(2)} €</div>
          <div style={{ fontSize: 11, color: theme.colors.text.secondary, marginTop: 4 }}>{stats.contagemPendente} pending invoices</div>
        </div>

        <div style={{ backgroundColor: "#ffffff", borderRadius: isMobile ? 12 : 16, padding: isMobile ? 16 : 24, border: `1px solid ${theme.colors.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertCircle size={20} color="#EF4444" />
            </div>
            <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>Overdue</span>
          </div>
          <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, color: "#EF4444" }}>{stats.totalVencido.toFixed(2)} €</div>
          <div style={{ fontSize: 11, color: theme.colors.text.secondary, marginTop: 4 }}>{stats.contagemVencido} overdue invoices</div>
        </div>

        <div style={{ backgroundColor: "#ffffff", borderRadius: isMobile ? 12 : 16, padding: isMobile ? 16 : 24, border: `1px solid ${theme.colors.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "rgba(242, 92, 5, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText size={20} color={theme.colors.accent.primary} />
            </div>
            <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>Grand total</span>
          </div>
          <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, color: theme.colors.accent.primary }}>{stats.totalGeral.toFixed(2)} €</div>
          <div style={{ fontSize: 11, color: theme.colors.text.secondary, marginTop: 4 }}>{faturas.length} invoices total</div>
        </div>
      </div>

      <div style={{ backgroundColor: "#ffffff", borderRadius: isMobile ? 12 : 16, padding: isMobile ? 16 : 24, border: `1px solid ${theme.colors.border}`, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <h3 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: theme.colors.text.primary, fontFamily: theme.fontFamily.sans }}>Invoices</h3>
          {hasFilters && (
            <button onClick={clearFilters} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: theme.colors.accent.primary, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              <X size={14} /> Clear filters
            </button>
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <div style={{ position: "relative", flex: "1 1 200px" }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#999" }} />
            <input
              type="text"
              placeholder="Search invoice or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "10px 12px 10px 38px", borderRadius: 8, border: `1px solid ${theme.colors.border}`, fontSize: 13 }}
            />
          </div>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 8, border: `1px solid ${theme.colors.border}`, fontSize: 13, minWidth: 140 }}
          >
            <option value="">All statuses</option>
            <option value="pendente">Pending</option>
            <option value="paga">Paid</option>
            <option value="vencida">Overdue</option>
            <option value="cancelada">Cancelled</option>
          </select>
          <select
            value={filterCliente}
            onChange={(e) => setFilterCliente(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 8, border: `1px solid ${theme.colors.border}`, fontSize: 13, minWidth: 160 }}
          >
            <option value="">All clients</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
          <input
            type="date"
            value={filterDataInicio}
            onChange={(e) => setFilterDataInicio(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 8, border: `1px solid ${theme.colors.border}`, fontSize: 13 }}
            placeholder="Start date"
          />
          <input
            type="date"
            value={filterDataFim}
            onChange={(e) => setFilterDataFim(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 8, border: `1px solid ${theme.colors.border}`, fontSize: 13 }}
            placeholder="End date"
          />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ width: 30, height: 30, border: "3px solid #eee", borderTop: `3px solid ${theme.colors.accent.primary}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredFaturas.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: theme.colors.text.secondary }}>
            <FileText size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
            <div>{hasFilters ? "No invoices match these filters" : "No invoices on file"}</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {filteredFaturas.map(fat => {
              const clienteNome = clientesMap[fat.clienteId]?.nome || fat.clienteNome || 'Client';
              const isVencida = fat.estado === 'pendente' && new Date(fat.dataVencimento) < new Date();
              
              return (
                <div key={fat.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: isMobile ? 12 : "16px 20px", backgroundColor: "#fafafa", borderRadius: 12, border: `1px solid ${theme.colors.border}`, flexDirection: isMobile ? "column" : "row", gap: isMobile ? 12 : 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: isVencida ? "rgba(239,68,68,0.1)" : theme.colors.accent.primary, display: "flex", alignItems: "center", justifyContent: "center", color: isVencida ? "#EF4444" : "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                      {fat.numero?.split('-')[2] || '#'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: theme.colors.text.primary, fontSize: 15 }}>{fat.numero}</div>
                      <div style={{ fontSize: 12, color: theme.colors.text.secondary, marginTop: 2 }}>{clienteNome}</div>
                      <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
                        Issued: {fat.dataEmissao ? new Date(fat.dataEmissao).toLocaleDateString('en-GB') : '—'} • Due: {fat.dataVencimento ? new Date(fat.dataVencimento).toLocaleDateString('en-GB') : '—'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 16, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
                    <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                      <div style={{ fontWeight: 800, color: theme.colors.accent.primary, fontSize: isMobile ? 16 : 18 }}>{fat.valorTotal?.toFixed(2) || "0.00"} €</div>
                      <div style={{ fontSize: 11, color: "#999" }}>VAT: {fat.valorIVA?.toFixed(2) || "0.00"} €</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 100, backgroundColor: `${getEstadoColor(fat.estado)}20`, color: getEstadoColor(fat.estado), textTransform: "uppercase" }}>
                        {invoiceEstadoLabel(fat.estado)}
                      </span>
                      {fat.estado === 'pendente' && (
                        <button 
                          onClick={() => handlePagarFatura(fat.id)}
                          disabled={processingId === fat.id}
                          style={{ padding: "8px 14px", borderRadius: 8, backgroundColor: "#10B981", color: "#fff", border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                        >
                          {processingId === fat.id ? 'Processing...' : 'Mark as paid'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ backgroundColor: "#ffffff", borderRadius: isMobile ? 12 : 16, padding: isMobile ? 16 : 24, border: `1px solid ${theme.colors.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <h3 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: theme.colors.text.primary, fontFamily: theme.fontFamily.sans }}>Clients to invoice</h3>
          <button onClick={onNavigateClientes} style={{ fontSize: 12, color: theme.colors.accent.primary, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View all clients →</button>
        </div>

        {clientes.filter(c => c.categoria === "cliente").length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: theme.colors.text.secondary }}>
            <FileText size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
            <div>No active clients to invoice</div>
            <button onClick={onNavigateClientes} style={{ marginTop: 12, padding: "14px 20px", borderRadius: 8, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", minHeight: 44 }}>
              View clients
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {clientes.filter(c => c.categoria === "cliente").slice(0, 5).map(c => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: isMobile ? 12 : "16px 20px", backgroundColor: "#fafafa", borderRadius: 12, border: `1px solid ${theme.colors.border}`, flexDirection: isMobile ? "column" : "row", gap: isMobile ? 12 : 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: theme.colors.accent.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                    {c.nome?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: theme.colors.text.primary, fontSize: 15 }}>{c.nome}</div>
                    <div style={{ fontSize: 12, color: theme.colors.text.secondary, marginTop: 2 }}>{c.email || "No email"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 16, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
                  <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                    <div style={{ fontWeight: 800, color: theme.colors.accent.primary, fontSize: isMobile ? 16 : 18 }}>{c.propostaValor?.toFixed(2) || "0.00"} €</div>
                    {c.propostaNumero && <div style={{ fontSize: 10, color: theme.colors.text.secondary }}>{c.propostaNumero}</div>}
                  </div>
                  <button onClick={() => onCriarFatura(c)} style={{ padding: "12px 16px", borderRadius: 8, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>
                    Create invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}