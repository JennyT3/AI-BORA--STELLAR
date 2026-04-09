import React, { useState } from 'react';
import { theme } from "../../styles/theme";
import { Search, Plus, Download, Upload, X, Phone, Mail, Edit2, Check, Trash2, ExternalLink } from "lucide-react";

export interface VendasClientesTabProps {
  clientes: any[];
  showNovoCliente: boolean;
  novoCliente: any;
  onNovoClienteChange: (field: string, value: string) => void;
  onToggleForm: () => void;
  onSubmit: () => void;
  onEditCliente?: (cliente: any) => void;
  onDeleteCliente?: (id: string) => void;
}

const CATEGORIAS = [
  { value: 'potencial', label: 'Potencial', color: '#F59E0B' },
  { value: 'cliente', label: 'Cliente', color: '#10B981' },
  { value: 'inativo', label: 'Inativo', color: '#6B7280' },
  { value: 'sem_interesse', label: 'Sem Interesse', color: '#DC2626' },
  { value: 'proposta_enviada', label: 'Proposta Enviada', color: '#3498DB' },
  { value: 'curioso', label: 'Curioso', color: '#9CA3AF' },
];

export function VendasClientesTab({ 
  clientes, 
  showNovoCliente, 
  novoCliente, 
  onNovoClienteChange, 
  onToggleForm, 
  onSubmit,
  onEditCliente,
  onDeleteCliente 
}: VendasClientesTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const filteredClientes = clientes.filter(c => {
    const matchesSearch = !searchTerm || 
      c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.telemovel?.includes(searchTerm) ||
      c.empresa?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCategoria === "all" || c.categoria === filterCategoria;
    return matchesSearch && matchesCat;
  });

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

  const startEdit = (c: any) => {
    setEditingId(c.id);
    setEditData({ ...c });
  };

  const saveEdit = async () => {
    if (onEditCliente && editingId) {
      await onEditCliente({ ...editData, id: editingId });
    }
    setEditingId(null);
    setEditData({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const hasValidProposta = (c: any) => c.propostaId && c.propostaId.trim() !== '';

  const exportToCSV = () => {
    const headers = ['Nome', 'Categoria', 'Empresa', 'Telefone', 'Email', 'Origem', 'Proposta', 'Resposta', 'Criado em'];
    const rows = filteredClientes.map(c => [
      c.nome || '',
      getCategoriaLabel(c.categoria) || '',
      c.empresa || '',
      c.telemovel || '',
      c.email || '',
      c.origem || '',
      c.propostaNumero || c.propostaId || '',
      c.resposta || '',
      c.createdAt || '',
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: 24, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 4 }}>Meus Clientes</h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: 13 }}>{filteredClientes.length} de {clientes.length} clientes</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={exportToCSV} style={{ padding: "8px 12px", borderRadius: 6, backgroundColor: "#fff", color: "#666", border: "1px solid #e0e0e0", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Download size={14} /> Exportar
          </button>
          <button onClick={onToggleForm} style={{ padding: "8px 12px", borderRadius: 6, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={14} /> Novo
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 200px", minWidth: 180 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#999" }} />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: "8px 10px 8px 30px", borderRadius: 6, border: "1px solid #e0e0e0", fontSize: 13, backgroundColor: "#fff" }}
          />
        </div>
        <select
          value={filterCategoria}
          onChange={e => setFilterCategoria(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #e0e0e0", fontSize: 13, backgroundColor: "#fff" }}
        >
          <option value="all">Todas categorías</option>
          {CATEGORIAS.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Nuevo Cliente Form */}
      {showNovoCliente && (
        <div style={{ backgroundColor: "#fff", borderRadius: 10, padding: 16, border: "1px solid #e8e8e8", marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Novo Cliente</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
            <div>
              <label style={{ fontSize: 10, color: "#666", display: "block", marginBottom: 3 }}>Nome *</label>
              <input value={novoCliente.nome} onChange={(e) => onNovoClienteChange('nome', e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: 4, border: "1px solid #ddd", fontSize: 12 }} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: "#666", display: "block", marginBottom: 3 }}>Email</label>
              <input value={novoCliente.email} onChange={(e) => onNovoClienteChange('email', e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: 4, border: "1px solid #ddd", fontSize: 12 }} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: "#666", display: "block", marginBottom: 3 }}>Telemóvel</label>
              <input value={novoCliente.telemovel} onChange={(e) => onNovoClienteChange('telemovel', e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: 4, border: "1px solid #ddd", fontSize: 12 }} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: "#666", display: "block", marginBottom: 3 }}>Empresa</label>
              <input value={novoCliente.empresa} onChange={(e) => onNovoClienteChange('empresa', e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: 4, border: "1px solid #ddd", fontSize: 12 }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={onSubmit} disabled={!novoCliente.nome?.trim()} style={{ padding: "8px 16px", borderRadius: 4, backgroundColor: novoCliente.nome?.trim() ? theme.colors.accent.primary : '#ccc', color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: novoCliente.nome?.trim() ? "pointer" : "not-allowed" }}>
              Guardar
            </button>
            <button onClick={onToggleForm} style={{ padding: "8px 16px", borderRadius: 4, backgroundColor: "#f5f5f5", color: "#666", border: "none", fontSize: 12, cursor: "pointer" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ backgroundColor: "#fff", borderRadius: 10, border: "1px solid #e8e8e8", overflow: "hidden" }}>
        <div style={{ overflowX: "auto", maxHeight: "70vh" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1400 }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 10 }}>
                <th style={{ padding: "10px 8px", fontSize: 9, fontWeight: 700, color: "#666", textAlign: "left", whiteSpace: "nowrap" }}>Nome</th>
                <th style={{ padding: "10px 8px", fontSize: 9, fontWeight: 700, color: "#666", textAlign: "left", whiteSpace: "nowrap" }}>Categoria</th>
                <th style={{ padding: "10px 8px", fontSize: 9, fontWeight: 700, color: "#666", textAlign: "left", whiteSpace: "nowrap" }}>Empresa</th>
                <th style={{ padding: "10px 8px", fontSize: 9, fontWeight: 700, color: "#666", textAlign: "left", whiteSpace: "nowrap" }}>NIF</th>
                <th style={{ padding: "10px 8px", fontSize: 9, fontWeight: 700, color: "#666", textAlign: "left", whiteSpace: "nowrap" }}>Telefone</th>
                <th style={{ padding: "10px 8px", fontSize: 9, fontWeight: 700, color: "#666", textAlign: "left", whiteSpace: "nowrap" }}>Email</th>
                <th style={{ padding: "10px 8px", fontSize: 9, fontWeight: 700, color: "#666", textAlign: "left", whiteSpace: "nowrap" }}>Origem</th>
                <th style={{ padding: "10px 8px", fontSize: 9, fontWeight: 700, color: "#666", textAlign: "left", whiteSpace: "nowrap" }}>Processo</th>
                <th style={{ padding: "10px 8px", fontSize: 9, fontWeight: 700, color: "#666", textAlign: "left", whiteSpace: "nowrap" }}>Website</th>
                <th style={{ padding: "10px 8px", fontSize: 9, fontWeight: 700, color: "#666", textAlign: "left", whiteSpace: "nowrap" }}>Morada</th>
                <th style={{ padding: "10px 8px", fontSize: 9, fontWeight: 700, color: "#666", textAlign: "left", whiteSpace: "nowrap" }}>CP</th>
                <th style={{ padding: "10px 8px", fontSize: 9, fontWeight: 700, color: "#666", textAlign: "left", whiteSpace: "nowrap" }}>Cidade</th>
                <th style={{ padding: "10px 8px", fontSize: 9, fontWeight: 700, color: "#666", textAlign: "left", whiteSpace: "nowrap" }}>Serviços</th>
                <th style={{ padding: "10px 8px", fontSize: 9, fontWeight: 700, color: "#666", textAlign: "left", whiteSpace: "nowrap" }}>Orçamento</th>
                <th style={{ padding: "10px 8px", fontSize: 9, fontWeight: 700, color: "#666", textAlign: "left", whiteSpace: "nowrap" }}>Proposta</th>
                <th style={{ padding: "10px 8px", fontSize: 9, fontWeight: 700, color: "#666", textAlign: "left", whiteSpace: "nowrap" }}>Fatura</th>
                <th style={{ padding: "10px 8px", fontSize: 9, fontWeight: 700, color: "#666", textAlign: "left", whiteSpace: "nowrap" }}>Notas Vendedor</th>
                <th style={{ padding: "10px 8px", fontSize: 9, fontWeight: 700, color: "#666", textAlign: "left", whiteSpace: "nowrap" }}>Último Contacto</th>
                <th style={{ padding: "10px 8px", fontSize: 9, fontWeight: 700, color: "#666", textAlign: "center", whiteSpace: "nowrap" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.map((c) => (
                <tr key={c.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "8px" }}>
                    {editingId === c.id ? (
                      <input value={editData.nome || ''} onChange={e => setEditData({...editData, nome: e.target.value})} style={{ width: "100%", padding: "4px", borderRadius: 4, border: "1px solid #ddd", fontSize: 11 }} />
                    ) : (
                      <span style={{ fontWeight: 600, fontSize: 12, color: theme.colors.text.primary }}>{c.nome}</span>
                    )}
                  </td>
                  <td style={{ padding: "8px" }}>
                    {editingId === c.id ? (
                      <select value={editData.categoria || ''} onChange={e => setEditData({...editData, categoria: e.target.value})} style={{ padding: "4px", borderRadius: 4, border: "1px solid #ddd", fontSize: 11 }}>
                        {CATEGORIAS.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                      </select>
                    ) : (
                      <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 8, backgroundColor: getCategoriaColor(c.categoria) + '20', color: getCategoriaColor(c.categoria), fontWeight: 600 }}>
                        {getCategoriaLabel(c.categoria)}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "8px" }}>
                    {editingId === c.id ? (
                      <input value={editData.empresa || ''} onChange={e => setEditData({...editData, empresa: e.target.value})} style={{ width: "100%", padding: "4px", borderRadius: 4, border: "1px solid #ddd", fontSize: 11 }} />
                    ) : (
                      <span style={{ fontSize: 11, color: "#666" }}>{c.empresa || '—'}</span>
                    )}
                  </td>
                  <td style={{ padding: "8px" }}>
                    {editingId === c.id ? (
                      <input value={editData.nif || ''} onChange={e => setEditData({...editData, nif: e.target.value})} style={{ width: "100%", padding: "4px", borderRadius: 4, border: "1px solid #ddd", fontSize: 11 }} />
                    ) : (
                      <span style={{ fontSize: 11, color: "#666" }}>{c.nif || '—'}</span>
                    )}
                  </td>
                  <td style={{ padding: "8px" }}>
                    {editingId === c.id ? (
                      <input value={editData.telemovel || ''} onChange={e => setEditData({...editData, telemovel: e.target.value})} style={{ width: "100%", padding: "4px", borderRadius: 4, border: "1px solid #ddd", fontSize: 11 }} />
                    ) : (
                      <a href={`tel:${c.telemovel}`} style={{ fontSize: 11, color: "#666", textDecoration: "none" }}>{c.telemovel || '—'}</a>
                    )}
                  </td>
                  <td style={{ padding: "8px" }}>
                    {editingId === c.id ? (
                      <input value={editData.email || ''} onChange={e => setEditData({...editData, email: e.target.value})} style={{ width: "100%", padding: "4px", borderRadius: 4, border: "1px solid #ddd", fontSize: 11 }} />
                    ) : (
                      <a href={`mailto:${c.email}`} style={{ fontSize: 11, color: "#666", textDecoration: "none" }}>{c.email || '—'}</a>
                    )}
                  </td>
                  <td style={{ padding: "8px" }}>
                    <span style={{ fontSize: 10, color: "#666" }}>{c.origem || '—'}</span>
                  </td>
                  <td style={{ padding: "8px" }}>
                    <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 8, backgroundColor: "#f3f4f6", color: "#666", fontWeight: 600 }}>
                      {c.processo || 'sem_processo'}
                    </span>
                  </td>
                  <td style={{ padding: "8px" }}>
                    {c.website ? (
                      <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" style={{ fontSize: 10, color: "#3498DB", textDecoration: "none" }}>
                        {c.website.substring(0, 15)}{c.website.length > 15 ? '...' : ''}
                      </a>
                    ) : <span style={{ fontSize: 11, color: "#666" }}>—</span>}
                  </td>
                  <td style={{ padding: "8px" }}>
                    <span style={{ fontSize: 10, color: "#666", maxWidth: 80, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.morada || '—'}</span>
                  </td>
                  <td style={{ padding: "8px" }}>
                    <span style={{ fontSize: 11, color: "#666" }}>{c.codigoPostal || '—'}</span>
                  </td>
                  <td style={{ padding: "8px" }}>
                    <span style={{ fontSize: 11, color: "#666" }}>{c.cidade || '—'}</span>
                  </td>
                  <td style={{ padding: "8px" }}>
                    <span style={{ fontSize: 10, color: "#666", maxWidth: 80, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {Array.isArray(c.servicos) ? c.servicos.join(', ') : (c.servicos || '—')}
                    </span>
                  </td>
                  <td style={{ padding: "8px" }}>
                    {c.orcamentoIds?.length > 0 ? (
                      <span style={{ fontSize: 10, color: "#F25C05", fontWeight: 600 }}>{c.orcamentoIds.length}</span>
                    ) : <span style={{ fontSize: 11, color: "#ccc" }}>—</span>}
                  </td>
                  <td style={{ padding: "8px" }}>
                    {hasValidProposta(c) ? (
                      <a href={`/p/${c.propostaId}`} target="_blank" style={{ fontSize: 10, color: "#3498DB", textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
                        {c.propostaNumero || c.propostaId?.slice(0, 6)} <ExternalLink size={8} />
                      </a>
                    ) : (
                      <span style={{ fontSize: 11, color: "#ccc" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "8px" }}>
                    {c.faturaIds?.length > 0 ? (
                      <span style={{ fontSize: 10, color: "#6366f1", fontWeight: 600 }}>{c.faturaIds.length}</span>
                    ) : <span style={{ fontSize: 11, color: "#ccc" }}>—</span>}
                  </td>
                  <td style={{ padding: "8px" }}>
                    <span style={{ fontSize: 10, color: "#666", maxWidth: 80, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.notasVendedor || '—'}</span>
                  </td>
                  <td style={{ padding: "8px" }}>
                    <span style={{ fontSize: 10, color: "#666" }}>{c.dataUltimoContacto ? c.dataUltimoContacto.split('T')[0] : '—'}</span>
                  </td>
                  <td style={{ padding: "8px", textAlign: "center" }}>
                    {editingId === c.id ? (
                      <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                        <button onClick={saveEdit} style={{ padding: "4px 8px", borderRadius: 4, backgroundColor: "#10B981", color: "#fff", border: "none", cursor: "pointer" }}><Check size={12} /></button>
                        <button onClick={cancelEdit} style={{ padding: "4px 8px", borderRadius: 4, backgroundColor: "#dc2626", color: "#fff", border: "none", cursor: "pointer" }}><X size={12} /></button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                        <button onClick={() => startEdit(c)} style={{ padding: "4px 8px", borderRadius: 4, backgroundColor: "#f3f4f6", color: "#666", border: "none", cursor: "pointer" }}><Edit2 size={12} /></button>
                        {onDeleteCliente && (
                          <button onClick={() => onDeleteCliente(c.id)} style={{ padding: "4px 8px", borderRadius: 4, backgroundColor: "#fee2e2", color: "#dc2626", border: "none", cursor: "pointer" }}><Trash2 size={12} /></button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredClientes.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#999" }}>
                    Nenhum cliente encontrado
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
