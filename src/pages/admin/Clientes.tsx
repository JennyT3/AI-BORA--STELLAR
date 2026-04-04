import { theme } from "../../styles/theme";
import { Play, Clock, Eye, CheckCircle, Phone, Mail, MapPin, Building, Calendar, FileText, Plus, X, Check, Image, Video, Layout, Send, BarChart3, PenTool, Sparkles } from "lucide-react";

interface ClientesProps {
  clientes: any[];
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
}

const PROCESSOS = [
  { id: "iniciado", label: "Iniciado", color: "#8B5CF6", icon: Play },
  { id: "em_processo", label: "Em Processo", color: "#F59E0B", icon: Clock },
  { id: "em_revisao", label: "Em Revisão", color: "#3498DB", icon: Eye },
  { id: "publicado", label: "Publicado", color: "#10B981", icon: CheckCircle },
];

const getCategoriaColor = (cat: string) => {
  if (cat === "cliente") return "#10B981";
  if (cat === "proposta_enviada") return "#F59E0B";
  if (cat === "potencial") return "#F97316";
  if (cat === "curioso") return "#8B5CF6";
  if (cat === "sem_interesse") return "#DC2626";
  return theme.colors.text.secondary;
};

const getCategoriaLabel = (cat: string) => {
  if (cat === "cliente") return "Cliente";
  if (cat === "proposta_enviada") return "Proposta Enviada";
  if (cat === "potencial") return "Potencial";
  if (cat === "curioso") return "Curioso";
  if (cat === "sem_interesse") return "Sem Interesse";
  return cat;
};

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

export function Clientes({ clientes, search, onSearchChange, filterCategoria, onFilterCategoriaChange, filterOrigem, onFilterOrigemChange, filterResposta, onFilterRespostaChange, sortBy, onSortByChange, sortOrder, onSortOrderChange, selectedCliente, onSelectCliente, onNovoCliente, onVincularProposta, onVerProposta, onEditarProposta, onFaturar, onEditar, onEliminar, onNavigateFaturacao, onUpdateProcesso, onUpdateTarefas }: ClientesProps) {
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
          <button onClick={() => onSelectCliente(null)} style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: theme.colors.bg.secondary, color: theme.colors.text.primary, border: `1px solid ${theme.colors.border}`, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            ← Voltar
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", backgroundColor: theme.colors.accent.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 24 }}>
                {selectedCliente.nome?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontFamily: theme.fontFamily.sans, fontWeight: 800, fontSize: 24, color: theme.colors.text.primary, marginBottom: 4 }}>{selectedCliente.nome}</h2>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 11, backgroundColor: getCategoriaColor(selectedCliente.categoria) + "20", padding: "4px 10px", borderRadius: 12, color: getCategoriaColor(selectedCliente.categoria), fontWeight: 600 }}>
                    {getCategoriaLabel(selectedCliente.categoria)}
                  </span>
                  <button 
                    onClick={() => { const currentIndex = PROCESSOS.findIndex(p => p.id === (selectedCliente.processo || "iniciado")); const nextIndex = (currentIndex + 1) % PROCESSOS.length; onUpdateProcesso(selectedCliente.id, PROCESSOS[nextIndex].id); }}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, backgroundColor: processo.color + "15", color: processo.color, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                  >
                    <ProcessoIcon size={12} />
                    {processo.label}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              {selectedCliente.categoria === "cliente" && (
                <button onClick={() => onFaturar(selectedCliente)} style={{ padding: "12px 20px", borderRadius: 10, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Gerar Fatura</button>
              )}
              <button onClick={() => onEditar(selectedCliente)} style={{ padding: "12px 20px", borderRadius: 10, backgroundColor: theme.colors.bg.secondary, color: theme.colors.text.primary, border: `1px solid ${theme.colors.border}`, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Editar</button>
              <button onClick={() => { if (confirm("Eliminar cliente?")) onEliminar(selectedCliente.id); }} style={{ padding: "12px 20px", borderRadius: 10, backgroundColor: "#fee2e2", color: "#dc2626", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Eliminar</button>
            </div>
          </div>

          <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: theme.colors.text.secondary, textTransform: "uppercase", marginBottom: 16 }}>Dados de Contacto</h3>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Phone size={16} color={theme.colors.text.tertiary} />
                <span style={{ color: theme.colors.text.primary }}>{selectedCliente.telemovel || "—"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Mail size={16} color={theme.colors.text.tertiary} />
                <span style={{ color: theme.colors.text.primary }}>{selectedCliente.email || "—"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <MapPin size={16} color={theme.colors.text.tertiary} />
                <span style={{ color: theme.colors.text.primary }}>{selectedCliente.morada || "—"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Building size={16} color={theme.colors.text.tertiary} />
                <span style={{ color: theme.colors.text.primary }}>{selectedCliente.nif || "—"} (NIF)</span>
              </div>
              {selectedCliente.empresa && (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Building size={16} color={theme.colors.text.tertiary} />
                  <span style={{ color: theme.colors.text.primary }}>{selectedCliente.empresa}</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: theme.colors.text.secondary, textTransform: "uppercase", marginBottom: 16 }}>Orçamento</h3>
            {selectedCliente.propostaNumero ? (
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: theme.colors.text.secondary, fontSize: 13 }}>Número</span>
                  <a href={`/admin/orcamento?edit=${selectedCliente.propostaId}`} target="_blank" style={{ color: "#3498DB", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>{selectedCliente.propostaNumero}</a>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: theme.colors.text.secondary, fontSize: 13 }}>Valor</span>
                  <span style={{ color: theme.colors.accent.primary, fontWeight: 700, fontSize: 18 }}>{selectedCliente.propostaValor?.toFixed(2) || "0.00"} €</span>
                </div>
                {selectedCliente.dataEnvio && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: theme.colors.text.secondary, fontSize: 13 }}>Enviada</span>
                    <span style={{ color: "#3498DB", fontSize: 13 }}>{selectedCliente.dataEnvio}</span>
                  </div>
                )}
                {selectedCliente.resposta && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: theme.colors.text.secondary, fontSize: 13 }}>Resposta</span>
                    <span style={{ 
                      fontSize: 12, padding: "4px 10px", borderRadius: 6, fontWeight: 600,
                      backgroundColor: selectedCliente.resposta === "sim" ? "#dcfce7" : selectedCliente.resposta === "nao" ? "#fee2e2" : "#fef3c7",
                      color: selectedCliente.resposta === "sim" ? "#16a34a" : selectedCliente.resposta === "nao" ? "#dc2626" : "#d97706"
                    }}>
                      {selectedCliente.resposta === "sim" ? "✓ Aceito" : selectedCliente.resposta === "nao" ? "✕ Recusado" : "↻ Reagendado"}
                    </span>
                  </div>
                )}
                {selectedCliente.propostaId && (
                  <div style={{ marginTop: 8 }}>
                    <a href={`/p/${selectedCliente.propostaId}`} target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 8, backgroundColor: "#3498DB", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, textDecoration: "none", cursor: "pointer" }}>
                      <FileText size={14} /> Ver Proposta
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 20, color: theme.colors.text.tertiary }}>
                <FileText size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                <div style={{ fontSize: 13 }}>Sem orçamento vinculado</div>
                <button onClick={() => onVincularProposta(selectedCliente)} style={{ marginTop: 12, padding: "8px 16px", borderRadius: 8, backgroundColor: "#F59E0B", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Vincular Proposta</button>
              </div>
            )}
          </div>

          <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: theme.colors.text.secondary, textTransform: "uppercase", marginBottom: 16 }}>Histórico</h3>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Calendar size={16} color={theme.colors.text.tertiary} />
                <span style={{ color: theme.colors.text.secondary, fontSize: 13 }}>Entrada</span>
                <span style={{ color: theme.colors.text.primary, fontSize: 13, marginLeft: "auto" }}>
                  {selectedCliente.createdAt ? new Date(selectedCliente.createdAt).toLocaleDateString("pt-PT") : "—"}
                </span>
              </div>
              {selectedCliente.origem && (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Building size={16} color={theme.colors.text.tertiary} />
                  <span style={{ color: theme.colors.text.secondary, fontSize: 13 }}>Origem</span>
                  <span style={{ color: theme.colors.text.primary, fontSize: 13, marginLeft: "auto" }}>{selectedCliente.origem}</span>
                </div>
              )}
              {selectedCliente.dataResposta && (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Calendar size={16} color={theme.colors.text.tertiary} />
                  <span style={{ color: theme.colors.text.secondary, fontSize: 13 }}>Data Resposta</span>
                  <span style={{ color: theme.colors.text.primary, fontSize: 13, marginLeft: "auto" }}>{new Date(selectedCliente.dataResposta).toLocaleDateString("pt-PT")}</span>
                </div>
              )}
            </div>
            
            {selectedCliente.observacoes && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #e8e8e8" }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: theme.colors.text.secondary, textTransform: "uppercase", marginBottom: 12 }}>Observações</h4>
                <p style={{ fontSize: 13, color: theme.colors.text.primary, lineHeight: 1.6 }}>{selectedCliente.observacoes}</p>
              </div>
            )}
          </div>
        </div>

        {selectedCliente.categoria === "cliente" && (
          <div style={{ marginTop: 24, backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: theme.colors.text.primary, marginBottom: 4 }}>Plano de Trabalho</h3>
                <p style={{ fontSize: 12, color: theme.colors.text.secondary }}>
                  {selectedCliente.servicos && selectedCliente.servicos.length > 0 
                    ? `Baseado em: ${selectedCliente.servicos.join(", ")}`
                    : "Selecione as tarefas e defina datas"}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ fontSize: 12, color: theme.colors.text.secondary }}>
                  Progresso: {tarefasAtuais.filter((t: any) => t.concluida).length} / {tarefasAtuais.length}
                </div>
                <div style={{ width: 100, height: 8, backgroundColor: "#e8e8e8", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${(tarefasAtuais.filter((t: any) => t.concluida).length / tarefasAtuais.length) * 100 || 0}%`, height: "100%", backgroundColor: theme.colors.status.success, borderRadius: 4 }} />
                </div>
              </div>
            </div>

            {processo.id === "publicado" && selectedCliente.publicacaoData && (
              <div style={{ backgroundColor: "#E8F5E9", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <CheckCircle size={20} color="#10B981" />
                  <span style={{ fontWeight: 700, color: "#10B981" }}>ProjetoPublicado!</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                  <div>
                    <span style={{ fontSize: 11, color: theme.colors.text.secondary }}>Data</span>
                    <div style={{ fontSize: 14, fontWeight: 600, color: theme.colors.text.primary }}>{selectedCliente.publicacaoData}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: theme.colors.text.secondary }}>Horário</span>
                    <div style={{ fontSize: 14, fontWeight: 600, color: theme.colors.text.primary }}>{selectedCliente.publicacaoHora || "—"}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: theme.colors.text.secondary }}>Plataforma</span>
                    <div style={{ fontSize: 14, fontWeight: 600, color: theme.colors.text.primary }}>{selectedCliente.publicacaoPlataforma || "—"}</div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {tarefasAtuais.map((tarefa: any, index: number) => {
                const Icon = tarefa.icon || FileText;
                return (
                  <div key={index} style={{ 
                    backgroundColor: tarefa.concluida ? "#dcfce7" : "#fafafa", 
                    borderRadius: 12, 
                    padding: 16, 
                    border: `2px solid ${tarefa.concluida ? "#10B981" : "#e8e8e8"}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                      <button 
                        onClick={() => toggleTarefa(index)}
                        style={{ 
                          width: 24, height: 24, borderRadius: 6, 
                          backgroundColor: tarefa.concluida ? "#10B981" : "#fff",
                          border: tarefa.concluida ? "none" : `2px solid ${theme.colors.border}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", flexShrink: 0 
                        }}
                      >
                        {tarefa.concluida && <Check size={14} color="#fff" />}
                      </button>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: theme.colors.text.primary, textDecoration: tarefa.concluida ? "line-through" : "none" }}>{tarefa.nome}</div>
                        <div style={{ fontSize: 11, color: theme.colors.text.secondary, marginTop: 2 }}>{tarefa.descricao}</div>
                      </div>
                      <Icon size={18} color={tarefa.concluida ? "#10B981" : theme.colors.text.tertiary} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <label style={{ fontSize: 10, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Data Início</label>
                        <input 
                          type="date" 
                          value={tarefa.dataInicio || ""} 
                          onChange={(e) => updateDataTarefa(index, "dataInicio", e.target.value)}
                          style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: `1px solid ${theme.colors.border}`, fontSize: 11 }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 10, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Data Entrega</label>
                        <input 
                          type="date" 
                          value={tarefa.dataEntrega || ""} 
                          onChange={(e) => updateDataTarefa(index, "dataEntrega", e.target.value)}
                          style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: `1px solid ${theme.colors.border}`, fontSize: 11 }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {tarefasAtuais.length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: theme.colors.text.tertiary }}>
                <FileText size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
                <div style={{ fontSize: 14, marginBottom: 8 }}>Sem tarefas definidas</div>
                <div style={{ fontSize: 12 }}>As tarefas são geradas automaticamente com base nos serviços do orçamento</div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: 28, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>Clientes</h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>{clientes.length} clientes</p>
        </div>
        <button onClick={onNovoCliente} style={{ padding: "12px 20px", borderRadius: 10, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>+ Novo Cliente</button>
      </div>

      <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 20, marginBottom: 24, border: "1px solid #e8e8e8" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input type="text" placeholder="Buscar..." value={search} onChange={(e) => onSearchChange(e.target.value)} style={{ flex: 1, minWidth: 150, padding: "10px 14px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 12 }} />
          <select value={filterCategoria} onChange={(e) => onFilterCategoriaChange(e.target.value)} style={{ padding: "10px 14px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 12, minWidth: 120 }}>
            <option value="todos">Todos</option>
            <option value="cliente">Cliente</option>
            <option value="potencial">Potencial</option>
            <option value="curioso">Curioso</option>
          </select>
          <select value={sortBy} onChange={(e) => onSortByChange(e.target.value)} style={{ padding: "10px 14px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 12 }}>
            <option value="createdAt">Data</option>
            <option value="nome">Nome</option>
            <option value="propostaValor">Valor</option>
          </select>
          <button onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")} style={{ padding: "10px 14px", borderRadius: 8, border: "2px solid #e0e0e0", backgroundColor: "#fff", cursor: "pointer" }}>{sortOrder === "asc" ? "↑" : "↓"}</button>
        </div>
      </div>

      <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e8e8e8", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "left" }}>Nome</th>
              <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "left" }}>Categoria</th>
              <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "left" }}>Processo</th>
              <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "left" }}>Telefone</th>
              <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "left" }}>Email</th>
              <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "left" }}>Orçamento</th>
              <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "left" }}>Proposta</th>
              <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "left" }}>Resposta</th>
              <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "center" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const processo = getProcessoInfo(c.processo || "iniciado");
              const ProcessoIcon = processo.icon;
              return (
                <tr key={c.id} onClick={() => onSelectCliente(c)} style={{ cursor: "pointer", borderTop: "1px solid #f0f0f0", backgroundColor: "#fff" }}>
                  <td style={{ padding: "12px 14px", fontSize: 12 }}><div style={{ fontWeight: 700, color: theme.colors.text.primary }}>{c.nome}</div></td>
                  <td style={{ padding: "12px 14px" }}><span style={{ fontSize: 10, backgroundColor: getCategoriaColor(c.categoria) + "20", padding: "4px 8px", borderRadius: 12, color: getCategoriaColor(c.categoria), fontWeight: 600 }}>{getCategoriaLabel(c.categoria)}</span></td>
                  <td style={{ padding: "12px 14px" }}>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation();
                        const currentIndex = PROCESSOS.findIndex(p => p.id === (c.processo || "iniciado"));
                        const nextIndex = (currentIndex + 1) % PROCESSOS.length;
                        onUpdateProcesso(c.id, PROCESSOS[nextIndex].id);
                      }}
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 6, 
                        padding: "6px 12px", 
                        borderRadius: 20, 
                        backgroundColor: processo.color + "15", 
                        color: processo.color, 
                        border: "none", 
                        fontSize: 11, 
                        fontWeight: 600, 
                        cursor: "pointer" 
                      }}
                    >
                      <ProcessoIcon size={12} />
                      {processo.label}
                    </button>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "#666" }}>{c.telemovel || "—"}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "#666" }}>{c.email || "—"}</td>
                  <td style={{ padding: "12px 14px" }}>
                    {c.propostaNumero ? (
                      <a href={`/admin/orcamento?edit=${c.propostaId}`} target="_blank" onClick={(e) => e.stopPropagation()} style={{ color: "#3498DB", fontWeight: 600, fontSize: 12, cursor: "pointer", textDecoration: "none" }}>{c.propostaNumero}</a>
                    ) : <span style={{ fontSize: 12, color: "#d1d5db" }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    {c.propostaId ? (
                      <a href={`/p/${c.propostaId}`} target="_blank" onClick={(e) => e.stopPropagation()} style={{ padding: "6px 12px", borderRadius: 6, backgroundColor: "#3498DB", color: "#fff", border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "inline-block" }}>Proposta</a>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); onVincularProposta(c); }} style={{ padding: "4px 10px", borderRadius: 6, backgroundColor: "#F59E0B", color: "#fff", border: "none", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>Vincular</button>
                    )}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    {c.resposta ? (
                      <span style={{ fontSize: 10, padding: "4px 8px", borderRadius: 4, fontWeight: 600, backgroundColor: c.resposta === "sim" ? "#dcfce7" : c.resposta === "nao" ? "#fee2e2" : "#fef3c7", color: c.resposta === "sim" ? "#16a34a" : c.resposta === "nao" ? "#dc2626" : "#d97706" }}>
                        {c.resposta === "sim" ? "✓ Aceito" : c.resposta === "nao" ? "✕ Recusado" : "↻ Reagendado"}
                      </span>
                    ) : <span style={{ fontSize: 10, padding: "4px 8px", borderRadius: 4, backgroundColor: "#f3f4f6", color: "#9ca3af" }}>Pendente</span>}
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "center" }} onClick={(e) => e.stopPropagation()}>
                      {c.categoria === "cliente" && (
                        <button onClick={() => onFaturar(c)} title="Faturar" style={{ padding: "6px 8px", borderRadius: 6, backgroundColor: "#10B981", color: "#fff", border: "none", fontSize: 11, cursor: "pointer" }}>€</button>
                      )}
                      <button onClick={() => onEditar(c)} title="Editar" style={{ padding: "6px 8px", borderRadius: 6, backgroundColor: "#f3f4f6", color: "#6b7280", border: "none", fontSize: 11, cursor: "pointer" }}>✎</button>
                      <button onClick={() => onEliminar(c.id)} title="Eliminar" style={{ padding: "6px 8px", borderRadius: 6, backgroundColor: "#fee2e2", color: "#dc2626", border: "none", fontSize: 11, cursor: "pointer" }}>✕</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}