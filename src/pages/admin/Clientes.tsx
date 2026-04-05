import { useState, useEffect } from "react";
import { Play, Clock, Eye, CheckCircle, Phone, Mail, MapPin, Building, Calendar, FileText, Plus, X, Check, Image, Video, Layout, Send, BarChart3, PenTool, Sparkles, User, ArrowRight } from "lucide-react";
import { getCategoriaClasses, getCategoriaLabel } from "../../utils/labels";
import { theme } from "../../styles/theme";

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
  { id: "iniciado", label: "Iniciado", colorClass: "bg-violet-50 text-violet-600", icon: Play },
  { id: "em_processo", label: "Em Processo", colorClass: "bg-amber-50 text-amber-600", icon: Clock },
  { id: "em_revisao", label: "Em Revisão", colorClass: "bg-sky-50 text-sky-600", icon: Eye },
  { id: "publicado", label: "Publicado", colorClass: "bg-emerald-50 text-emerald-600", icon: CheckCircle },
];

const getProcessoInfo = (processo: string) => {
  return PROCESSOS.find(p => p.id === processo) || PROCESSOS[0];
};

const SERVICOS_TAREFAS: Record<string, { nome: string; descricao: string; icon: any }[]> = {
  "Gestão de Redes Sociais": [
    { nome: "Análise", descricao: "Análise da marca e concorrência", icon: BarChart3 },
    { nome: "Planeamento", descricao: "Criar calendário de conteúdo", icon: Calendar },
    { nome: "Criação de Posts", descricao: "Design de posts semanais", icon: Image },
    { nome: "Criação de Stories", descricao: "Design de stories diários", icon: Layout },
    { nome: "Copywriting", descricao: "Textos para publicações", icon: PenTool },
    { nome: "Publicação", descricao: "Publicar e agendar conteúdo", icon: Send },
  ],
  "Criação de Conteúdo": [
    { nome: "Briefing", descricao: "Reunião de briefing", icon: FileText },
    { nome: "Conceito", descricao: "Desenvolver conceito criativo", icon: Sparkles },
    { nome: "Produção", descricao: "Criar conteúdo agreed", icon: Image },
    { nome: "Revisão", descricao: "Apresentar e ajustar", icon: Eye },
  ],
  "Community Management": [
    { nome: "Monitorização", descricao: "Monitorizar menções e mensagens", icon: Send },
    { nome: "Respostas", descricao: "Responder comentários e DMs", icon: PenTool },
    { nome: "Relatório", descricao: "Relatório semanal de métricas", icon: BarChart3 },
  ],
  "Design de Posts": [
    { nome: "Briefing Design", descricao: "Entender objetivos", icon: FileText },
    { nome: "Conceito Visual", descricao: "Criar direção estética", icon: Sparkles },
    { nome: "Criação", descricao: "Desenvolver peça final", icon: Image },
    { nome: "Entrega", descricao: "Entregar arquivos finais", icon: Check },
  ],
  "Produção de Videos": [
    { nome: "Roteiro", descricao: "Escrever roteiro", icon: PenTool },
    { nome: "Filmagem", descricao: "Gravar conteúdo", icon: Video },
    { nome: "Edição", descricao: "Editar e finalizar vídeo", icon: Video },
    { nome: "Entrega", descricao: "Entregar vídeo final", icon: Check },
  ],
  "Criação de Reels": [
    { nome: "Ideia", descricao: "Brainstorm de ideias", icon: Sparkles },
    { nome: "Roteiro", descricao: "Escrever roteiro", icon: PenTool },
    { nome: "Produção", descricao: "Gravar e editar", icon: Video },
    { nome: "Publicação", descricao: "Publicar no Instagram", icon: Send },
  ],
  "Google Ads": [
    { nome: " auditoria", descricao: "Auditoria da conta atual", icon: BarChart3 },
    { nome: "Estrutura", descricao: "Estruturar campanhas", icon: Layout },
    { nome: "Criação", descricao: "Criar anúncios", icon: Image },
    { nome: "Otimização", descricao: "Ajustar e otimizar", icon: Check },
  ],
  "Chatbot WhatsApp": [
    { nome: "Mapeamento", descricao: "Mapear fluxos", icon: Layout },
    { nome: "Configuração", descricao: "Configurar chatbot", icon: Send },
    { nome: "Testes", descricao: "Testar fluxos", icon: Check },
    { nome: "Entrega", descricao: "Entregar e treinar", icon: FileText },
  ],
};

export function Clientes({ clientes, vendedores, search, onSearchChange, filterCategoria, onFilterCategoriaChange, filterOrigem, onFilterOrigemChange, filterResposta, onFilterRespostaChange, sortBy, onSortByChange, sortOrder, onSortOrderChange, selectedCliente, onSelectCliente, onNovoCliente, onVincularProposta, onVerProposta, onEditarProposta, onFaturar, onEditar, onEliminar, onNavigateFaturacao, onUpdateProcesso, onUpdateTarefas, onDelegarVendedor }: ClientesProps) {
  const [showVendedorDropdown, setShowVendedorDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filtered = clientes.filter(c => {
    const searchLower = search.toLowerCase();
    const matchesSearch = !search || c.nome?.toLowerCase().includes(searchLower) || c.email?.toLowerCase().includes(searchLower) || c.nif?.includes(search) || c.telemovel?.includes(search);
    const matchesCategoria = filterCategoria === "todos" || c.categoria === filterCategoria;
    const matchesOrigem = filterOrigem === "todos" || c.origem === filterOrigem;
    const matchesResposta = filterResposta === "todos" || (filterResposta === "pendente" ? !c.resposta : c.resposta === filterResposta);
    return matchesSearch && matchesCategoria && matchesOrigem && matchesResposta;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortBy === "nome") comparison = (a.nome || "").localeCompare(b.nome || "");
    else if (sortBy === "createdAt") comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    else if (sortBy === "propostaValor") comparison = (a.propostaValor || 0) - (b.propostaValor || 0);
    return sortOrder === "asc" ? comparison : -comparison;
  });

  if (selectedCliente) {
    const processo = getProcessoInfo(selectedCliente.processo || "iniciado");
    const ProcessoIcon = processo.icon;

    const getTarefasFromServicos = () => {
      const servicos = selectedCliente.servicos || [];
      let tarefas: any[] = [];
      servicos.forEach((s: string) => {
        if (SERVICOS_TAREFAS[s]) {
          tarefas = [...tarefas, ...SERVICOS_TAREFAS[s].map(t => ({
            ...t,
            concluida: false,
            dataInicio: "",
            dataEntrega: "",
          }))];
        }
      });
      return tarefas.length > 0 ? tarefas : selectedCliente.tarefas || [];
    };

    const tarefasAtuais = selectedCliente.tarefas && selectedCliente.tarefas.length > 0
      ? selectedCliente.tarefas
      : getTarefasFromServicos();

    const toggleTarefa = (index: number) => {
      const novasTarefas = [...tarefasAtuais];
      novasTarefas[index] = { ...novasTarefas[index], concluida: !novasTarefas[index].concluida };
      onUpdateTarefas(selectedCliente.id, novasTarefas);
    };

    const updateDataTarefa = (index: number, campo: string, valor: string) => {
      const novasTarefas = [...tarefasAtuais];
      novasTarefas[index] = { ...novasTarefas[index], [campo]: valor };
      onUpdateTarefas(selectedCliente.id, novasTarefas);
    };

    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => onSelectCliente(null)} style={{ padding: '12px 16px', borderRadius: 8, backgroundColor: '#fff', color: theme.colors.text.primary, border: `1px solid ${theme.colors.border}`, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, minHeight: 44 }}>
            ← Voltar
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? 16 : 24 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: isMobile ? 16 : 24, border: `1px solid ${theme.colors.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: '#F25C05', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 24, flexShrink: 0 }}>
                {selectedCliente.nome?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color: theme.colors.text.primary, marginBottom: 8 }}>{selectedCliente.nome}</h2>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 600, backgroundColor: getCategoriaClasses(selectedCliente.categoria).split(' ')[0].replace('bg-', 'rgba(').replace('-50', ',0.1)'), color: getCategoriaClasses(selectedCliente.categoria).includes('emerald') ? '#10B981' : getCategoriaClasses(selectedCliente.categoria).includes('amber') ? '#F59E0B' : getCategoriaClasses(selectedCliente.categoria).includes('violet') ? '#8B5CF6' : '#6B7280' }}>
                    {getCategoriaLabel(selectedCliente.categoria)}
                  </span>
                  <button
                    onClick={() => { const currentIndex = PROCESSOS.findIndex(p => p.id === (selectedCliente.processo || "iniciado")); const nextIndex = (currentIndex + 1) % PROCESSOS.length; onUpdateProcesso(selectedCliente.id, PROCESSOS[nextIndex].id); }}
                    style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, backgroundColor: processo.colorClass.includes('violet') ? '#ede9fe' : processo.colorClass.includes('amber') ? '#fef3c7' : processo.colorClass.includes('sky') ? '#e0f2fe' : '#d1fae5', color: processo.colorClass.includes('violet') ? '#7c3aed' : processo.colorClass.includes('amber') ? '#d97706' : processo.colorClass.includes('sky') ? '#0284c7' : '#059669', border: 'none' }}
                  >
                    <ProcessoIcon size={12} />
                    {processo.label}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {selectedCliente.categoria === "cliente" && (
                <button onClick={() => onFaturar(selectedCliente)} style={{ padding: '14px 20px', borderRadius: 12, backgroundColor: '#F25C05', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 13, minHeight: 44 }}>Gerar Fatura</button>
              )}
              <button onClick={() => onEditar(selectedCliente)} style={{ padding: '14px 20px', borderRadius: 12, backgroundColor: '#fff', color: theme.colors.text.primary, border: `1px solid ${theme.colors.border}`, fontWeight: 600, cursor: 'pointer', fontSize: 13, minHeight: 44 }}>Editar</button>
              <button onClick={() => { if (confirm("Eliminar cliente?")) onEliminar(selectedCliente.id); }} style={{ padding: '14px 20px', borderRadius: 12, backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 13, minHeight: 44 }}>Eliminar</button>
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: isMobile ? 16 : 24, border: `1px solid ${theme.colors.border}` }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: theme.colors.text.secondary, textTransform: 'uppercase', marginBottom: 16 }}>Dados de Contacto</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Phone size={16} color="#9CA3AF" />
                <span style={{ color: theme.colors.text.primary }}>{selectedCliente.telemovel || "—"}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Mail size={16} color="#9CA3AF" />
                <span style={{ color: theme.colors.text.primary }}>{selectedCliente.email || "—"}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <MapPin size={16} color="#9CA3AF" />
                <span style={{ color: theme.colors.text.primary }}>{selectedCliente.morada || "—"}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Building size={16} color="#9CA3AF" />
                <span style={{ color: theme.colors.text.primary }}>{selectedCliente.nif || "—"} (NIF)</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: isMobile ? 16 : 24, border: `1px solid ${theme.colors.border}` }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: theme.colors.text.secondary, textTransform: 'uppercase', marginBottom: 16 }}>Orçamento</h3>
            {selectedCliente.propostaNumero ? (
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: theme.colors.text.secondary, fontSize: 13 }}>Número</span>
                  <a href={`/admin/orcamento?edit=${selectedCliente.propostaId}`} target="_blank" style={{ color: '#0ea5e9', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>{selectedCliente.propostaNumero}</a>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: theme.colors.text.secondary, fontSize: 13 }}>Valor</span>
                  <span style={{ color: '#F25C05', fontWeight: 700, fontSize: 18 }}>{selectedCliente.propostaValor?.toFixed(2) || "0.00"} €</span>
                </div>
                {selectedCliente.propostaId && (
                  <div style={{ marginTop: 12 }}>
                    <a href={`/p/${selectedCliente.propostaId}`} target="_blank" style={{ padding: '12px 16px', borderRadius: 8, backgroundColor: '#0ea5e9', color: '#fff', fontSize: 12, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44 }}>
                      <FileText size={14} /> Ver Proposta
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 24, color: theme.colors.text.secondary }}>
                <FileText size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                <div style={{ fontSize: 13 }}>Sem orçamento vinculado</div>
                <button onClick={() => onVincularProposta(selectedCliente)} style={{ marginTop: 12, padding: '12px 16px', borderRadius: 8, backgroundColor: '#f59e0b', color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', minHeight: 44 }}>Vincular Proposta</button>
              </div>
            )}
          </div>

          <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: isMobile ? 16 : 24, border: `1px solid ${theme.colors.border}` }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: theme.colors.text.secondary, textTransform: 'uppercase', marginBottom: 16 }}>Histórico</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Calendar size={16} color="#9CA3AF" />
                <span style={{ color: theme.colors.text.secondary, fontSize: 13 }}>Entrada</span>
                <span style={{ color: theme.colors.text.primary, fontSize: 13, marginLeft: 'auto' }}>
                  {selectedCliente.createdAt ? new Date(selectedCliente.createdAt).toLocaleDateString("pt-PT") : "—"}
                </span>
              </div>
              {selectedCliente.origem && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Building size={16} color="#9CA3AF" />
                  <span style={{ color: theme.colors.text.secondary, fontSize: 13 }}>Origem</span>
                  <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 600, marginLeft: 'auto', backgroundColor: '#e0e7ff', color: '#4f46e5' }}>{selectedCliente.origem}</span>
                </div>
              )}
              {selectedCliente.dataResposta && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Calendar size={16} color="#9CA3AF" />
                  <span style={{ color: theme.colors.text.secondary, fontSize: 13 }}>Data Resposta</span>
                  <span style={{ color: theme.colors.text.primary, fontSize: 13, marginLeft: 'auto' }}>{new Date(selectedCliente.dataResposta).toLocaleDateString("pt-PT")}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedCliente.categoria === "cliente" && (
          <div style={{ marginTop: 24, backgroundColor: '#fff', borderRadius: 16, padding: isMobile ? 16 : 24, border: `1px solid ${theme.colors.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: theme.colors.text.primary, marginBottom: 4 }}>Plano de Trabalho</h3>
                <p style={{ fontSize: 12, color: theme.colors.text.secondary }}>
                  {selectedCliente.servicos && selectedCliente.servicos.length > 0
                    ? `Baseado em: ${selectedCliente.servicos.join(", ")}`
                    : "Selecione as tarefas e defina datas"}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: theme.colors.text.secondary }}>
                  Progresso: {tarefasAtuais.filter((t: any) => t.concluida).length} / {tarefasAtuais.length}
                </span>
                <div style={{ width: 100, height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', backgroundColor: '#10B981', borderRadius: 4, width: `${(tarefasAtuais.filter((t: any) => t.concluida).length / tarefasAtuais.length) * 100 || 0}%` }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {tarefasAtuais.map((tarefa: any, index: number) => {
                const Icon = tarefa.icon || FileText;
                return (
                  <div key={index} style={{ borderRadius: 12, padding: 16, border: `2px solid ${tarefa.concluida ? '#10B981' : '#e5e7eb'}`, backgroundColor: tarefa.concluida ? '#ecfdf5' : '#f9fafb' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                      <button
                        onClick={() => toggleTarefa(index)}
                        style={{ width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: tarefa.concluida ? 'none' : '2px solid #e5e7eb', backgroundColor: tarefa.concluida ? '#10B981' : '#fff' }}
                      >
                        {tarefa.concluida && <Check size={14} color="#fff" />}
                      </button>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: theme.colors.text.primary, textDecoration: tarefa.concluida ? 'line-through' : 'none', opacity: tarefa.concluida ? 0.6 : 1 }}>{tarefa.nome}</div>
                        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{tarefa.descricao}</div>
                      </div>
                      <Icon size={18} color={tarefa.concluida ? "#10B981" : "#9CA3AF"} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>
                        <label style={{ fontSize: 10, color: '#6B7280', display: 'block', marginBottom: 4 }}>Data Início</label>
                        <input
                          type="date"
                          value={tarefa.dataInicio || ""}
                          onChange={(e) => updateDataTarefa(index, "dataInicio", e.target.value)}
                          style={{ width: '100%', padding: '8px', borderRadius: 6, border: `1px solid ${theme.colors.border}`, fontSize: 11 }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 10, color: '#6B7280', display: 'block', marginBottom: 4 }}>Data Entrega</label>
                        <input
                          type="date"
                          value={tarefa.dataEntrega || ""}
                          onChange={(e) => updateDataTarefa(index, "dataEntrega", e.target.value)}
                          style={{ width: '100%', padding: '8px', borderRadius: 6, border: `1px solid ${theme.colors.border}`, fontSize: 11 }}
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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: isMobile ? 24 : 32, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>Clientes</h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>{clientes.length} clientes</p>
        </div>
        <button onClick={onNovoCliente} style={{ padding: '14px 20px', borderRadius: 12, backgroundColor: '#F25C05', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 13, minHeight: 44 }}>+ Novo Cliente</button>
      </div>

      {/* Filtros */}
      <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: isMobile ? 12 : 20, border: `1px solid ${theme.colors.border}`, marginBottom: isMobile ? 16 : 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={search} 
            onChange={(e) => onSearchChange(e.target.value)} 
            style={{ flex: '1 1 150px', padding: '12px 16px', borderRadius: 8, border: `1px solid ${theme.colors.border}`, fontSize: 13, minHeight: 44, outline: 'none' }} 
          />
          <select 
            value={filterCategoria} 
            onChange={(e) => onFilterCategoriaChange(e.target.value)} 
            style={{ padding: '12px 16px', borderRadius: 8, border: `1px solid ${theme.colors.border}`, fontSize: 13, minHeight: 44, minWidth: 120 }}
          >
            <option value="todos">Todos</option>
            <option value="cliente">Cliente</option>
            <option value="potencial">Potencial</option>
            <option value="curioso">Curioso</option>
          </select>
          <select 
            value={sortBy} 
            onChange={(e) => onSortByChange(e.target.value)} 
            style={{ padding: '12px 16px', borderRadius: 8, border: `1px solid ${theme.colors.border}`, fontSize: 13, minHeight: 44 }}
          >
            <option value="createdAt">Data</option>
            <option value="nome">Nome</option>
            <option value="propostaValor">Valor</option>
          </select>
          <button 
            onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")} 
            style={{ padding: '12px 16px', borderRadius: 8, border: `1px solid ${theme.colors.border}`, backgroundColor: '#fff', cursor: 'pointer', minHeight: 44, minWidth: 44 }}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {/* Mobile Cards View */}
      {isMobile ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {filtered.map((c, i) => {
            const processo = getProcessoInfo(c.processo || "iniciado");
            return (
              <div 
                key={`${c.id}-${i}`} 
                onClick={() => onSelectCliente(c)}
                style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, border: `1px solid ${theme.colors.border}`, cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#F25C05', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>
                    {c.nome?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: theme.colors.text.primary, fontSize: 14 }}>{c.nome}</div>
                    <div style={{ fontSize: 12, color: theme.colors.text.secondary }}>{c.email || '—'}</div>
                  </div>
                  <span style={{ fontSize: 10, padding: '4px 8px', borderRadius: 20, fontWeight: 600, backgroundColor: '#d1fae5', color: '#059669' }}>
                    {getCategoriaLabel(c.categoria)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: theme.colors.text.secondary }}>{c.telemovel || '—'}</span>
                  {c.propostaValor ? (
                    <span style={{ fontWeight: 700, color: '#F25C05', fontSize: 14 }}>{c.propostaValor?.toFixed(2)} €</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Desktop Table View */
        <div style={{ backgroundColor: '#fff', borderRadius: 16, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
            <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: `1px solid ${theme.colors.border}` }}>
                  <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: 'left' }}>Nome</th>
                  <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: 'left' }}>Categoria</th>
                  <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: 'left' }}>Processo</th>
                  <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: 'left' }}>Telefone</th>
                  <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: 'left' }}>Orçamento</th>
                  <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: 'left' }}>Resposta</th>
                  <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const processo = getProcessoInfo(c.processo || "iniciado");
                  const ProcessoIcon = processo.icon;
                  return (
                    <tr 
                      key={`${c.id}-${i}`} 
                      onClick={() => onSelectCliente(c)} 
                      style={{ cursor: 'pointer', borderTop: `1px solid ${theme.colors.border}`, backgroundColor: '#fff' }}
                    >
                      <td style={{ padding: '12px 16px', fontSize: 12 }}><div style={{ fontWeight: 700, color: theme.colors.text.primary }}>{c.nome}</div></td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 20, fontWeight: 600, backgroundColor: '#d1fae5', color: '#059669' }}>{getCategoriaLabel(c.categoria)}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentIndex = PROCESSOS.findIndex(p => p.id === (c.processo || "iniciado"));
                            const nextIndex = (currentIndex + 1) % PROCESSOS.length;
                            onUpdateProcesso(c.id, PROCESSOS[nextIndex].id);
                          }}
                          style={{ fontSize: 11, padding: '6px 12px', borderRadius: 20, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#ede9fe', color: '#7c3aed', border: 'none' }}
                        >
                          <ProcessoIcon size={12} />
                          {processo.label}
                        </button>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: theme.colors.text.secondary }}>{c.telemovel || "—"}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: theme.colors.text.secondary }}>{c.email || "—"}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {c.propostaNumero ? (
                          <a href={`/admin/orcamento?edit=${c.propostaId}`} target="_blank" onClick={(e) => e.stopPropagation()} style={{ color: '#0ea5e9', fontWeight: 600, fontSize: 12, textDecoration: 'none' }}>{c.propostaNumero}</a>
                        ) : <span style={{ fontSize: 12, color: '#d1d5db' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {c.resposta ? (
                          <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 4, fontWeight: 600, backgroundColor: c.resposta === 'sim' ? '#d1fae5' : c.resposta === 'nao' ? '#fee2e2' : '#fef3c7', color: c.resposta === 'sim' ? '#059669' : c.resposta === 'nao' ? '#dc2626' : '#d97706' }}>
                            {c.resposta === "sim" ? "✓ Aceito" : c.resposta === "nao" ? "✕ Recusado" : "↻ Reagendado"}
                          </span>
                        ) : <span style={{ fontSize: 10, padding: '4px 8px', borderRadius: 4, backgroundColor: '#f3f4f6', color: '#9ca3af', fontWeight: 600 }}>Pendente</span>}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
                          {c.categoria === "cliente" && (
                            <button onClick={() => onFaturar(c)} title="Faturar" style={{ padding: '8px 12px', borderRadius: 6, backgroundColor: '#10b981', color: '#fff', border: 'none', fontSize: 11, cursor: 'pointer', minHeight: 32 }}>€</button>
                          )}
                          <button onClick={() => onEditar(c)} title="Editar" style={{ padding: '8px 12px', borderRadius: 6, backgroundColor: '#f3f4f6', color: theme.colors.text.secondary, border: 'none', fontSize: 11, cursor: 'pointer', minHeight: 32 }}>✎</button>
                          <button onClick={() => onEliminar(c.id)} title="Eliminar" style={{ padding: '8px 12px', borderRadius: 6, backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', fontSize: 11, cursor: 'pointer', minHeight: 32 }}>✕</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
