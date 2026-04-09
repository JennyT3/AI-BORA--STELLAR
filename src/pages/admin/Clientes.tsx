import { useState, useEffect, useMemo } from "react";
import { Play, Clock, Eye, CheckCircle, Phone, Mail, MapPin, Building, Calendar, FileText, Plus, X, Check, Image, Video, Layout, Send, BarChart3, PenTool, Sparkles, User, ArrowRight, ExternalLink, Trash2, Edit, AlignJustify, Grid, DollarSign, Search, Filter, Target, Globe, MessageSquare, Download } from "lucide-react";
import { getCategoriaClasses, getCategoriaLabel } from "../../utils/labels";
import { theme } from "../../styles/theme";
import { listVendedoresAtivos } from "../../services/vendedores";
import * as XLSX from "xlsx";

interface ClientesProps {
  clientes: any[];
  vendedores: any[];
  search: string;
  onSearchChange: (v: string) => void;
  filterCategoria: string;
  onFilterCategoriaChange: (v: string) => void;
  filterOrigem: string;
  onFilterOrigemChange: (v: string) => void;
  filterResposta: string;
  onFilterRespostaChange: (v: string) => void;
  sortBy: string;
  onSortByChange: (v: any) => void;
  sortOrder: string;
  onSortOrderChange: (v: any) => void;
  selectedCliente: any;
  onSelectCliente: (c: any) => void;
  onNovoCliente: () => void;
  onVincularProposta: (c: any) => void;
  onVerProposta: (id: string) => void;
  onVerFicha: (id: string) => void;
  onEditarProposta: (id: string) => void;
  onFaturar: (c: any) => void;
  onEditar: (c: any) => void;
  onEliminar: (id: string) => void;
  onNavigateFaturacao: () => void;
  onUpdateProcesso: (clienteId: string, processo: string) => void;
  onUpdateTarefas: (clienteId: string, tarefas: any[]) => void;
  onDelegarVendedor: (clienteId: string, vendedorId: string) => void;
}

const PROCESSOS = [
  { id: "iniciado", label: "Started", colorClass: "bg-violet-50 text-violet-600", icon: Play },
  { id: "em_processo", label: "In progress", colorClass: "bg-amber-50 text-amber-600", icon: Clock },
  { id: "em_revisao", label: "In review", colorClass: "bg-sky-50 text-sky-600", icon: Eye },
  { id: "publicado", label: "Published", colorClass: "bg-emerald-50 text-emerald-600", icon: CheckCircle },
];

const getProcessoInfo = (processo: string) => {
  return PROCESSOS.find(p => p.id === processo) || PROCESSOS[0];
};

const SERVICOS_TAREFAS: Record<string, { nome: string; descricao: string; icon: any }[]> = {
  "Gestão de Redes Sociais": [
    { nome: "Analysis", descricao: "Brand and competitor analysis", icon: BarChart3 },
    { nome: "Planning", descricao: "Build content calendar", icon: Calendar },
    { nome: "Criação de Posts", descricao: "Weekly post design", icon: Image },
    { nome: "Criação de Stories", descricao: "Daily story design", icon: Layout },
    { nome: "Copywriting", descricao: "Copy for posts", icon: PenTool },
    { nome: "Publicação", descricao: "Publish and schedule content", icon: Send },
  ],
  "Criação de Conteúdo": [
    { nome: "Briefing", descricao: "Briefing session", icon: FileText },
    { nome: "Conceito", descricao: "Develop creative concept", icon: Sparkles },
    { nome: "Produção", descricao: "Produce agreed content", icon: Image },
    { nome: "Revisão", descricao: "Present and refine", icon: Eye },
  ],
  "Community Management": [
    { nome: "Monitorização", descricao: "Monitor mentions and messages", icon: Send },
    { nome: "Respostas", descricao: "Reply to comments and DMs", icon: PenTool },
    { nome: "Relatório", descricao: "Weekly metrics report", icon: BarChart3 },
  ],
  "Design de Posts": [
    { nome: "Briefing Design", descricao: "Clarify goals", icon: FileText },
    { nome: "Conceito Visual", descricao: "Define visual direction", icon: Sparkles },
    { nome: "Criação", descricao: "Produce final asset", icon: Image },
    { nome: "Entrega", descricao: "Deliver final files", icon: Check },
  ],
  "Produção de Videos": [
    { nome: "Roteiro", descricao: "Write script", icon: PenTool },
    { nome: "Filmagem", descricao: "Record footage", icon: Video },
    { nome: "Edição", descricao: "Edit and finish video", icon: Video },
    { nome: "Entrega", descricao: "Deliver final video", icon: Check },
  ],
  "Criação de Reels": [
    { nome: "Ideia", descricao: "Brainstorm ideas", icon: Sparkles },
    { nome: "Roteiro", descricao: "Write script", icon: PenTool },
    { nome: "Produção", descricao: "Shoot and edit", icon: Video },
    { nome: "Publicação", descricao: "Publish on Instagram", icon: Send },
  ],

  "Chatbot WhatsApp": [
    { nome: "Mapeamento", descricao: "Map flows", icon: Layout },
    { nome: "Configuração", descricao: "Configure chatbot", icon: Send },
    { nome: "Testes", descricao: "Test flows", icon: Check },
    { nome: "Entrega", descricao: "Deliver and train", icon: FileText },
  ],
};

export function Clientes({ clientes, vendedores, search, onSearchChange, filterCategoria, onFilterCategoriaChange, filterOrigem, onFilterOrigemChange, filterResposta, onFilterRespostaChange, sortBy, onSortByChange, sortOrder, onSortOrderChange, selectedCliente, onSelectCliente, onNovoCliente, onVincularProposta, onVerProposta, onVerFicha, onEditarProposta, onFaturar, onEditar, onEliminar, onNavigateFaturacao, onUpdateProcesso, onUpdateTarefas, onDelegarVendedor }: ClientesProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">(() => {
    return (localStorage.getItem("clientesViewMode") as "cards" | "table") || "cards";
  });

  const toggleViewMode = () => {
    const newMode = viewMode === "cards" ? "table" : "cards";
    setViewMode(newMode);
    localStorage.setItem("clientesViewMode", newMode);
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Local state for extra filters
  const [filterVendedor, setFilterVendedor] = useState<string>("todos");
  const [filterDataDesde, setFilterDataDesde] = useState<string>("");
  const [filterDataHasta, setFilterDataHasta] = useState<string>("");
  const [vendedoresLista, setVendedoresLista] = useState<any[]>([]);

  // Load sales reps for filter dropdown
  useEffect(() => { listVendedoresAtivos().then(setVendedoresLista).catch(console.error); }, []);

  // Chain all filters with useMemo
  const clientesFiltrados = useMemo(() => {
    return clientes.filter(c => {
      const searchLower = search.toLowerCase();
      const matchesSearch = !search || c.nome?.toLowerCase().includes(searchLower) || c.email?.toLowerCase().includes(searchLower) || c.nif?.includes(search) || c.telemovel?.includes(search) || c.empresa?.toLowerCase().includes(searchLower);
      const matchesCategoria = filterCategoria === "todos" || c.categoria === filterCategoria;
      const matchesOrigem = filterOrigem === "todos" || c.origem === filterOrigem;
      const matchesResposta = filterResposta === "todos" || (filterResposta === "pendente" ? !c.resposta : c.resposta === filterResposta);
      const matchesVendedor = filterVendedor === "todos" || c.vendedorId === filterVendedor;
      
      let matchesFecha = true;
      if (c.dataUltimoContacto) {
        const fecha = c.dataUltimoContacto.split('T')[0];
        if (filterDataDesde && fecha < filterDataDesde) matchesFecha = false;
        if (filterDataHasta && fecha > filterDataHasta) matchesFecha = false;
      }
      
      return matchesSearch && matchesCategoria && matchesOrigem && matchesResposta && matchesVendedor && matchesFecha;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === "nome") comparison = (a.nome || "").localeCompare(b.nome || "");
      else if (sortBy === "createdAt") comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      else if (sortBy === "propostaValor") comparison = (a.propostaValor || 0) - (b.propostaValor || 0);
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [clientes, search, filterCategoria, filterOrigem, filterResposta, filterVendedor, filterDataDesde, filterDataHasta, sortBy, sortOrder]);

  // Export helpers
  const exportarExcelFiltrados = () => {
    const data = clientesFiltrados.map(c => ({
      nome: c.nome || '', email: c.email || '', telemovel: c.telemovel || '', nif: c.nif || '',
      empresa: c.empresa || '', website: c.website || '', morada: c.morada || '',
      codigoPostal: c.codigoPostal || '', cidade: c.cidade || '', categoria: c.categoria || '',
      origem: c.origem || '', processo: c.processo || '', notasVendedor: c.notasVendedor || '',
      dataUltimoContacto: c.dataUltimoContacto || '',
      servicos: Array.isArray(c.servicos) ? c.servicos.join('; ') : (c.servicos || '')
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clients");
    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `clients_filtered_${fecha}.xlsx`);
  };

  const exportarBackupTotal = () => {
    const data = clientes.map(c => ({
      nome: c.nome || '', email: c.email || '', telemovel: c.telemovel || '', nif: c.nif || '',
      empresa: c.empresa || '', website: c.website || '', morada: c.morada || '',
      codigoPostal: c.codigoPostal || '', cidade: c.cidade || '', categoria: c.categoria || '',
      origem: c.origem || '', processo: c.processo || '', notasVendedor: c.notasVendedor || '',
      dataUltimoContacto: c.dataUltimoContacto || '',
      servicos: Array.isArray(c.servicos) ? c.servicos.join('; ') : (c.servicos || '')
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clients");
    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `clients_backup_${fecha}.xlsx`);
  };

  // Alias for backwards compatibility
  const filtered = clientesFiltrados;

  // Assigned sales rep display name
  const getVendedorNome = (vendedorId?: string) => {
    if (!vendedorId) return '—';
    const v = vendedores.find(v => v.id === vendedorId);
    return v ? v.nome : '—';
  };

  if (selectedCliente) {
    const currentProcesso = getProcessoInfo(selectedCliente.processo || "iniciado");
    const ProcessoIcon = currentProcesso.icon;
    const vendedorNome = getVendedorNome(selectedCliente.vendedorId);

    const getTarefasFromServicos = () => {
      const servicos = selectedCliente.servicos || [];
      let tareas: any[] = [];
      servicos.forEach((s: string) => {
        if (SERVICOS_TAREFAS[s]) {
          tareas = [...tareas, ...SERVICOS_TAREFAS[s].map(t => ({
            ...t,
            concluida: false,
            dataInicio: "",
            dataEntrega: "",
          }))];
        }
      });
      return tareas.length > 0 ? tareas : selectedCliente.tarefas || [];
    };

    const tareasAtuais = selectedCliente.tarefas && selectedCliente.tarefas.length > 0
      ? selectedCliente.tarefas
      : getTarefasFromServicos();

    const toggleTarefa = (index: number) => {
      const nuevasTarefas = [...tareasAtuais];
      nuevasTarefas[index] = { ...nuevasTarefas[index], concluida: !nuevasTarefas[index].concluida };
      onUpdateTarefas(selectedCliente.id, nuevasTarefas);
    };

    const updateDataTarefa = (index: number, campo: string, valor: string) => {
      const nuevasTarefas = [...tareasAtuais];
      nuevasTarefas[index] = { ...nuevasTarefas[index], [campo]: valor };
      onUpdateTarefas(selectedCliente.id, nuevasTarefas);
    };

    return (
      <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => onSelectCliente(null)} style={{ padding: '12px 16px', borderRadius: 12, backgroundColor: '#fff', color: '#1b1c1b', border: '1px solid #e5e7eb', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, minHeight: 44 }}>
            ← Back
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? 16 : 24 }}>
          {/* Perfil Card */}
          <div style={{ backgroundColor: '#fff', borderRadius: 24, padding: isMobile ? 20 : 32, border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #F25C05 0%, #F22283 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 24, flexShrink: 0 }}>
                {selectedCliente.nome?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 900, color: '#1b1c1b', marginBottom: 8 }}>{selectedCliente.nome}</h2>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, padding: '4px 12px', borderRadius: 100, fontWeight: 800, backgroundColor: '#fcf9f7', color: '#F25C05', border: '1px solid rgba(242, 92, 5, 0.1)' }}>
                    {getCategoriaLabel(selectedCliente.categoria)}
                  </span>
                  <button
                    onClick={() => { 
                      const currentIndex = PROCESSOS.findIndex(p => p.id === (selectedCliente.processo || "iniciado")); 
                      const nextIndex = (currentIndex + 1) % PROCESSOS.length; 
                      onUpdateProcesso(selectedCliente.id, PROCESSOS[nextIndex].id); 
                    }}
                    style={{ fontSize: 10, padding: '4px 12px', borderRadius: 100, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#f3f4f6', color: '#4b5563', border: 'none' }}
                  >
                    <ProcessoIcon size={12} strokeWidth={3} />
                    {currentProcesso.label}
                  </button>
                  <button
                    onClick={() => window.open(`/cliente/${selectedCliente.id}`, '_blank')}
                    style={{ fontSize: 10, padding: '4px 12px', borderRadius: 100, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#F25C05', color: '#fff', border: 'none' }}
                  >
                    <ExternalLink size={12} strokeWidth={3} />
                    Full client profile
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 32 }}>
              {selectedCliente.categoria === "cliente" && (
                <button onClick={() => onFaturar(selectedCliente)} style={{ flex: 1, padding: '14px 20px', borderRadius: 16, backgroundColor: '#10B981', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: 13, minHeight: 48, boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)' }}>Generate invoice</button>
              )}
              <button onClick={() => onEditar(selectedCliente)} style={{ flex: 1, padding: '14px 20px', borderRadius: 16, backgroundColor: '#fff', color: '#1b1c1b', border: '1px solid #e5e7eb', fontWeight: 800, cursor: 'pointer', fontSize: 13, minHeight: 48 }}>Edit</button>
              <button onClick={() => { if (confirm("Delete this client?")) onEliminar(selectedCliente.id); }} style={{ flex: 1, padding: '14px 20px', borderRadius: 16, backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: 13, minHeight: 48 }}>Delete</button>
            </div>
          </div>

          {/* Contact Card */}
          <div style={{ backgroundColor: '#fff', borderRadius: 24, padding: isMobile ? 20 : 32, border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: 11, fontWeight: 900, color: '#8e7165', textTransform: 'uppercase', marginBottom: 24, letterSpacing: '1px' }}>Contact details</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#fcf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={16} color="#F25C05" /></div>
                <span style={{ color: '#1b1c1b', fontWeight: 600, fontSize: 14 }}>{selectedCliente.telemovel || "—"}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#fcf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={16} color="#F25C05" /></div>
                <span style={{ color: '#1b1c1b', fontWeight: 600, fontSize: 14 }}>{selectedCliente.email || "—"}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#fcf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={16} color="#F25C05" /></div>
                <span style={{ color: '#1b1c1b', fontWeight: 600, fontSize: 14 }}>{selectedCliente.morada || "—"}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#fcf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building size={16} color="#F25C05" /></div>
                <span style={{ color: '#1b1c1b', fontWeight: 600, fontSize: 14 }}>{selectedCliente.nif || "—"} (tax ID)</span>
            </div>
          </div>

          {/* Faturas Section */}
          <div style={{ marginTop: 32, backgroundColor: '#fff', borderRadius: 24, padding: isMobile ? 20 : 32, border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1b1c1b', marginBottom: 4 }}>Invoicing</h3>
              <button onClick={() => onFaturar(selectedCliente)} style={{ padding: '10px 20px', borderRadius: 12, backgroundColor: '#F25C05', color: '#fff', border: 'none', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>+ New invoice</button>
            </div>
            {selectedCliente.faturaIds && selectedCliente.faturaIds.length > 0 ? (
              <div style={{ display: 'grid', gap: 12 }}>
                {selectedCliente.faturaIds.slice(0, 5).map((faturaId: string, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#fcf9f7', borderRadius: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1b1c1b' }}>Invoice #{idx + 1}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>ID: {faturaId.slice(0, 8)}...</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#6366f1' }}>View →</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <FileText size={32} color="#f0edeb" style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 13, color: '#8e7165', fontWeight: 600 }}>No invoices yet</div>
              </div>
            )}
          </div>
        </div>

          {/* Budget Card */}
          <div style={{ backgroundColor: '#fff', borderRadius: 24, padding: isMobile ? 20 : 32, border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: 11, fontWeight: 900, color: '#8e7165', textTransform: 'uppercase', marginBottom: 24, letterSpacing: '1px' }}>Quote</h3>
            {selectedCliente.propostaNumero ? (
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8e7165', fontSize: 13, fontWeight: 600 }}>Número</span>
                  <a href={`/admin/orcamento?edit=${selectedCliente.propostaId}`} target="_blank" style={{ color: '#F25C05', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>{selectedCliente.propostaNumero}</a>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8e7165', fontSize: 13, fontWeight: 600 }}>Valor</span>
                  <span style={{ color: '#1b1c1b', fontWeight: 900, fontSize: 20 }}>{selectedCliente.propostaValor?.toLocaleString()} €</span>
                </div>
                <div style={{ marginTop: 12 }}>
                  <a href={`/p/${selectedCliente.propostaId}`} target="_blank" style={{ width: '100%', padding: '14px', borderRadius: 12, backgroundColor: '#1b1c1b', color: '#fff', fontSize: 12, fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48 }}>
                    <FileText size={16} /> View proposal online
                  </a>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <FileText size={32} color="#f0edeb" style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 13, color: '#8e7165', fontWeight: 600 }}>No linked quote</div>
                <button onClick={() => onVincularProposta(selectedCliente)} style={{ marginTop: 16, width: '100%', padding: '14px', borderRadius: 12, backgroundColor: '#F25C05', color: '#fff', border: 'none', fontSize: 12, fontWeight: 800, cursor: 'pointer', minHeight: 48 }}>Link proposal</button>
              </div>
            )}
          </div>

          {/* History Card */}
          <div style={{ backgroundColor: '#fff', borderRadius: 24, padding: isMobile ? 20 : 32, border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: 11, fontWeight: 900, color: '#8e7165', textTransform: 'uppercase', marginBottom: 24, letterSpacing: '1px' }}>History</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#fcf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={16} color="#F25C05" /></div>
                <span style={{ color: '#8e7165', fontSize: 13, fontWeight: 600 }}>Joined</span>
                <span style={{ color: '#1b1c1b', fontSize: 13, fontWeight: 800, marginLeft: 'auto' }}>
                  {selectedCliente.createdAt ? new Date(selectedCliente.createdAt).toLocaleDateString("en-GB") : "—"}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#fcf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Target size={16} color="#F25C05" /></div>
                <span style={{ color: '#8e7165', fontSize: 13, fontWeight: 600 }}>Source</span>
                <span style={{ fontSize: 10, padding: '4px 12px', borderRadius: 100, fontWeight: 800, marginLeft: 'auto', backgroundColor: '#fcf9f7', color: '#F25C05', border: '1px solid rgba(242, 92, 5, 0.1)' }}>{selectedCliente.origem || "Simulator"}</span>
              </div>
              {selectedCliente.dataResposta && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#fcf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={16} color="#F25C05" /></div>
                  <span style={{ color: '#8e7165', fontSize: 13, fontWeight: 600 }}>Response date</span>
                  <span style={{ color: '#1b1c1b', fontSize: 13, fontWeight: 800, marginLeft: 'auto' }}>{new Date(selectedCliente.dataResposta).toLocaleDateString("en-GB")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Vendedor Card */}
          <div style={{ backgroundColor: '#fff', borderRadius: 24, padding: isMobile ? 20 : 32, border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: 11, fontWeight: 900, color: '#8e7165', textTransform: 'uppercase', marginBottom: 24, letterSpacing: '1px' }}>Sales rep / collaborator</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#fcf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={24} color="#F25C05" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#8e7165' }}>Owner</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1b1c1b' }}>{vendedorNome}</div>
              </div>
            </div>
            {selectedCliente.dataUltimoContacto && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Clock size={16} color="#F25C05" />
                  <span style={{ fontSize: 12, color: '#8e7165' }}>Last contact:</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1b1c1b' }}>
                    {new Date(selectedCliente.dataUltimoContacto).toLocaleDateString('en-GB')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Work Plan Section */}
        {selectedCliente.categoria === "cliente" && (
          <div style={{ marginTop: 32, backgroundColor: '#fff', borderRadius: 24, padding: isMobile ? 20 : 32, border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1b1c1b', marginBottom: 4 }}>Work plan</h3>
                <p style={{ fontSize: 13, color: '#8e7165', fontWeight: 600 }}>
                  {selectedCliente.servicos && selectedCliente.servicos.length > 0
                    ? `Services: ${selectedCliente.servicos.join(", ")}`
                    : "Set tasks and delivery deadlines"}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#8e7165', textTransform: 'uppercase', marginBottom: 4 }}>Progress</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#10B981' }}>{tareasAtuais.filter((t: any) => t.concluida).length} / {tareasAtuais.length}</div>
                </div>
                <div style={{ width: 120, height: 10, backgroundColor: '#f3f4f6', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ height: '100%', backgroundColor: '#10B981', borderRadius: 100, width: `${(tareasAtuais.filter((t: any) => t.concluida).length / tareasAtuais.length) * 100 || 0}%`, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {tareasAtuais.map((tarea: any, index: number) => {
                const Icon = tarea.icon || FileText;
                return (
                  <div key={index} style={{ borderRadius: 20, padding: 20, border: `2px solid ${tarea.concluida ? '#10B981' : '#f3f4f6'}`, backgroundColor: tarea.concluida ? '#f0fdf4' : '#fff', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                      <button
                        onClick={() => toggleTarefa(index)}
                        style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: tarea.concluida ? 'none' : '2px solid #e5e7eb', backgroundColor: tarea.concluida ? '#10B981' : '#fff' }}
                      >
                        {tarea.concluida && <Check size={16} color="#fff" strokeWidth={4} />}
                      </button>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#1b1c1b', textDecoration: tarea.concluida ? 'line-through' : 'none', opacity: tarea.concluida ? 0.5 : 1 }}>{tarea.nome}</div>
                        <div style={{ fontSize: 12, color: '#8e7165', marginTop: 4, fontWeight: 500 }}>{tarea.descricao}</div>
                      </div>
                      <Icon size={20} color={tarea.concluida ? "#10B981" : "#F25C05"} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 800, color: '#8e7165', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Start</label>
                        <input
                          type="date"
                          value={tarea.dataInicio || ""}
                          onChange={(e) => updateDataTarefa(index, "dataInicio", e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12, fontWeight: 600, fontFamily: 'Montserrat' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 800, color: '#8e7165', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Due</label>
                        <input
                          type="date"
                          value={tarea.dataEntrega || ""}
                          onChange={(e) => updateDataTarefa(index, "dataEntrega", e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12, fontWeight: 600, fontFamily: 'Montserrat' }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 24 }}>
        <div>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#F25C05', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>CRM & Pipeline</span>
          <h1 style={{ fontSize: isMobile ? 32 : 48, fontWeight: 900, color: '#1b1c1b', letterSpacing: '-1.5px', lineHeight: 1 }}>Clients</h1>
          <p style={{ color: '#5a4137', marginTop: 12, fontSize: 15, fontWeight: 500 }}>{clientes.length} contacts in the pipeline.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={toggleViewMode} 
            style={{ padding: '16px', borderRadius: 16, backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 10px 25px rgba(0,0,0,0.02)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={viewMode === 'cards' ? "Table view" : "Card view"}
          >
            {viewMode === 'cards' ? <AlignJustify size={20} color="#F25C05" /> : <Grid size={20} color="#F25C05" />}
          </button>
          <button onClick={onNovoCliente} style={{ padding: '16px 32px', borderRadius: 16, background: 'linear-gradient(135deg, #F25C05 0%, #F22283 100%)', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: 14, boxShadow: '0 10px 25px rgba(242,92,5,0.2)' }}>+ New client</button>
        </div>
      </div>

      {/* Filters Bento Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32, alignItems: 'center' }}>
        <div style={{ flex: '1 1 300px', backgroundColor: '#fff', borderRadius: 20, padding: '4px 16px', display: 'flex', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.02)' }}>
          <Search size={18} color="#8e7165" />
          <input 
            placeholder="Search by name, email, company, tax ID or phone…" 
            value={search} 
            onChange={(e) => onSearchChange(e.target.value)} 
            style={{ width: '100%', border: 'none', padding: '14px', fontSize: 14, fontWeight: 600, outline: 'none', color: '#1b1c1b' }} 
          />
        </div>
        
        {/* Filtro Vendedor */}
        <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: '4px 16px', display: 'flex', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.02)', minWidth: 200 }}>
          <User size={18} color="#8e7165" />
          <select value={filterVendedor} onChange={(e) => setFilterVendedor(e.target.value)} style={{ width: '100%', border: 'none', padding: '14px', fontSize: 13, fontWeight: 700, outline: 'none', color: '#5a4137', background: 'transparent' }}>
            <option value="todos">All sales reps</option>
            {vendedoresLista.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
          </select>
        </div>
        
        {/* Filtro Categoria */}
        <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: '4px 16px', display: 'flex', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.02)' }}>
          <Filter size={18} color="#8e7165" />
          <select value={filterCategoria} onChange={(e) => onFilterCategoriaChange(e.target.value)} style={{ width: '100%', border: 'none', padding: '14px', fontSize: 13, fontWeight: 700, outline: 'none', color: '#5a4137', background: 'transparent' }}>
            <option value="todos">Category: All</option>
            <option value="cliente">Client</option>
            <option value="potencial">Lead</option>
            <option value="curioso">Curious</option>
          </select>
        </div>
        
        {/* Filtro Ordenar */}
        <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: '4px 16px', display: 'flex', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.02)' }}>
          <BarChart3 size={18} color="#8e7165" />
          <select value={sortBy} onChange={(e) => onSortByChange(e.target.value)} style={{ width: '100%', border: 'none', padding: '14px', fontSize: 13, fontWeight: 700, outline: 'none', color: '#5a4137', background: 'transparent' }}>
            <option value="createdAt">Sort: Date</option>
            <option value="nome">Sort: Name</option>
          </select>
        </div>
        
        <button 
          onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")} 
          style={{ padding: '14px 20px', borderRadius: 20, border: '1px solid rgba(0,0,0,0.02)', backgroundColor: '#fff', cursor: 'pointer', fontWeight: 800, color: '#F25C05', fontSize: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
        >
          {sortOrder === "asc" ? "↑ ASC" : "↓ DESC"}
        </button>
      </div>
      
      {/* Filtros de fecha */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#5a4137' }}>From:</span>
          <input type="date" value={filterDataDesde} onChange={(e) => setFilterDataDesde(e.target.value)} style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#5a4137' }}>To:</span>
          <input type="date" value={filterDataHasta} onChange={(e) => setFilterDataHasta(e.target.value)} style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }} />
        </div>
        <button onClick={() => { setFilterDataDesde(''); setFilterDataHasta(''); }} style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff', fontSize: 12, fontWeight: 600, color: '#666', cursor: 'pointer' }}>Clear dates</button>
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={exportarExcelFiltrados} style={{ padding: '10px 16px', borderRadius: 12, backgroundColor: '#10b981', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={14} /> Export filtered ({clientesFiltrados.length})
          </button>
          <button onClick={exportarBackupTotal} style={{ padding: '10px 16px', borderRadius: 12, backgroundColor: '#6366f1', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={14} /> Full backup ({clientes.length})
          </button>
        </div>
      </div>

      {/* List / Table View */}
      {viewMode === 'table' && !isMobile ? (
        <div style={{ backgroundColor: '#fff', borderRadius: 24, overflowX: 'auto', border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <table style={{ width: '100%', minWidth: 1400, borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#fcf9f7', position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Name</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Category</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Company</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Tax ID</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Phone</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Email</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Source</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Process</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Website</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Address</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Postcode</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>City</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Services</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Quotes</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Proposal</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Invoice</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Notes</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Sales rep</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Last contact</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', textAlign: 'center', whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const vendedor = vendedores.find(v => v.id === c.vendedorId);
                return (
                <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <button 
                      onClick={() => onSelectCliente(c)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 700, color: '#1b1c1b', fontSize: 13 }}
                    >
                      {c.nome}
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 8, fontWeight: 700, backgroundColor: c.categoria === 'cliente' ? '#d1fae5' : '#fef3c7', color: '#374151' }}>
                      {getCategoriaLabel(c.categoria)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#1b1c1b', fontSize: 12, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.empresa || '—'}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#5a4137', fontSize: 12 }}>{c.nif || '—'}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500, color: '#5a4137', fontSize: 12 }}>{c.telemovel || '—'}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500, color: '#8e7165', fontSize: 11, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email || '—'}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#5a4137', fontSize: 11 }}>{c.origem || '—'}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 8, fontWeight: 700, backgroundColor: '#f3f4f6', color: '#4b5563' }}>
                      {c.processo || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {c.website ? (
                      <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" style={{ fontSize: 10, color: '#3498DB', textDecoration: 'none', maxWidth: 80, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.website}
                      </a>
                    ) : <span style={{ color: '#ccc', fontSize: 11 }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, color: '#666', maxWidth: 100, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.morada || '—'}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, color: '#666' }}>{c.codigoPostal || '—'}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, color: '#666' }}>{c.cidade || '—'}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 10, color: '#666', maxWidth: 80, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {Array.isArray(c.servicos) ? c.servicos.join(', ') : (c.servicos || '—')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {c.orcamentoIds?.length > 0 ? (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#F25C05' }}>{c.orcamentoIds.length}</span>
                    ) : <span style={{ color: '#ccc', fontSize: 11 }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {c.propostaId ? (
                      <a href={`/p/${c.propostaId}`} target="_blank" style={{ fontSize: 10, color: '#3498DB', textDecoration: 'none', fontWeight: 600 }}>View →</a>
                    ) : <span style={{ color: '#ccc', fontSize: 11 }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {c.faturaIds?.length > 0 ? (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#6366f1' }}>{c.faturaIds.length}</span>
                    ) : <span style={{ color: '#ccc', fontSize: 11 }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 10, color: '#666', maxWidth: 80, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.notasVendedor || '—'}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontWeight: 600, color: '#1b1c1b', fontSize: 12 }}>{vendedor ? vendedor.nome : '—'}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, color: '#666' }}>{c.dataUltimoContacto ? c.dataUltimoContacto.split('T')[0] : '—'}</span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEditar(c); }} 
                        title="Edit" 
                        style={{ padding: '6px 10px', borderRadius: 6, backgroundColor: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); if (confirm('Delete this client?')) onEliminar(c.id); }} 
                        title="Delete" 
                        style={{ padding: '6px 10px', borderRadius: 6, backgroundColor: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      ) : (
      <div style={{ display: 'grid', gap: 16 }}>
        {filtered.map((c, i) => {
          const proceso = getProcessoInfo(c.processo || "iniciado");
          const ProcessoIcon = proceso.icon;
          return (
            <div 
              key={`${c.id}-${i}`} 
              onClick={() => onSelectCliente(c)}
              style={{ position: 'relative', backgroundColor: '#fff', borderRadius: 24, padding: 24, display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'all 0.3s ease', overflow: 'hidden' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Status Accent Bar */}
              <div style={{ position: 'absolute', left: 0, top: 16, bottom: 16, width: 6, backgroundColor: c.categoria === 'cliente' ? '#10B981' : '#F25C05', borderRadius: '0 4px 4px 0' }}></div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1, width: '100%' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #fcf9f7 0%, #f0edeb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F25C05', fontWeight: 900, fontSize: 20, flexShrink: 0 }}>
                  {c.nome?.charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1b1c1b', marginBottom: 4 }}>{c.nome}</h3>
                  <p style={{ fontSize: 13, color: '#8e7165', fontWeight: 600 }}>{c.email || '—'}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: isMobile ? 16 : 30, width: isMobile ? '100%' : 'auto', minWidth: isMobile ? '100%' : 600 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#8e7165', textTransform: 'uppercase', marginBottom: 4 }}>Category</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#F25C05' }}>{getCategoriaLabel(c.categoria)}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#8e7165', textTransform: 'uppercase', marginBottom: 4 }}>Process</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1b1c1b', fontWeight: 800, fontSize: 14 }}>
                    <ProcessoIcon size={14} strokeWidth={3} />
                    {proceso.label}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#8e7165', textTransform: 'uppercase', marginBottom: 4 }}>Quote</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#1b1c1b' }}>{c.propostaValor ? `${c.propostaValor.toLocaleString()} €` : '—'}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#8e7165', textTransform: 'uppercase', marginBottom: 4 }}>Sales rep</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#666' }}>{vendedores.find(v => v.id === c.vendedorId)?.nome || '—'}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#8e7165', textTransform: 'uppercase', marginBottom: 4 }}>Invoices</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#6366f1' }}>{c.faturaIds?.length || 0}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: isMobile ? '100%' : 'auto' }}>
                {!c.propostaId && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); window.open(`/admin/orcamento?cliente=${c.id}`, '_blank'); }}
                    style={{ flex: 1, padding: '12px 16px', borderRadius: 12, backgroundColor: '#F25C05', color: '#fff', border: 'none', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                  >
                    + Proposal
                  </button>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); onSelectCliente(c); }}
                  style={{ flex: 1, padding: '12px 20px', borderRadius: 12, backgroundColor: '#1b1c1b', color: '#fff', border: 'none', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                >
                  Manage
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onEditar(c); }}
                  style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#fcf9f7', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Edit size={18} color="#F25C05" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); if(confirm("Delete this client?")) onEliminar(c.id); }}
                  style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(220, 38, 38, 0.05)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Trash2 size={18} color="#dc2626" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
