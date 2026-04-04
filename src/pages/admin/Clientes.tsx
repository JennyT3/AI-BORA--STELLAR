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
  { id: "iniciado", label: "Iniciado", colorClass: "bg-violet-50 text-violet-600", icon: Play },
  { id: "em_processo", label: "Em Processo", colorClass: "bg-amber-50 text-amber-600", icon: Clock },
  { id: "em_revisao", label: "Em Revisão", colorClass: "bg-sky-50 text-sky-600", icon: Eye },
  { id: "publicado", label: "Publicado", colorClass: "bg-emerald-50 text-emerald-600", icon: CheckCircle },
];

const getCategoriaClasses = (cat: string) => {
  if (cat === "cliente") return "bg-emerald-50 text-emerald-600";
  if (cat === "proposta_enviada") return "bg-amber-50 text-amber-600";
  if (cat === "potencial") return "bg-orange-50 text-orange-600";
  if (cat === "curioso") return "bg-violet-50 text-violet-600";
  if (cat === "sem_interesse") return "bg-red-50 text-red-600";
  return "bg-gray-100 text-gray-500";
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
        <div className="mb-6">
          <button onClick={() => onSelectCliente(null)} className="px-4 py-2.5 rounded-lg bg-white text-gray-900 border border-gray-200 text-xs cursor-pointer flex items-center gap-2">
            ← Voltar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div className="w-15 h-15 rounded-full bg-[#F25C05] flex items-center justify-center text-white font-bold text-2xl shrink-0">
                {selectedCliente.nome?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-sans font-extrabold text-2xl text-gray-900 mb-1">{selectedCliente.nome}</h2>
                <div className="flex gap-2 items-center">
                  <span className={`text-[11px] px-2.5 py-1 rounded-xl font-semibold ${getCategoriaClasses(selectedCliente.categoria)}`}>
                    {getCategoriaLabel(selectedCliente.categoria)}
                  </span>
                  <button 
                    onClick={() => { const currentIndex = PROCESSOS.findIndex(p => p.id === (selectedCliente.processo || "iniciado")); const nextIndex = (currentIndex + 1) % PROCESSOS.length; onUpdateProcesso(selectedCliente.id, PROCESSOS[nextIndex].id); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-none text-[11px] font-semibold cursor-pointer ${processo.colorClass}`}
                  >
                    <ProcessoIcon size={12} />
                    {processo.label}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {selectedCliente.categoria === "cliente" && (
                <button onClick={() => onFaturar(selectedCliente)} className="px-5 py-3 rounded-xl bg-[#F25C05] text-white border-none font-semibold cursor-pointer text-[13px]">Gerar Fatura</button>
              )}
              <button onClick={() => onEditar(selectedCliente)} className="px-5 py-3 rounded-xl bg-white text-gray-900 border border-gray-200 font-semibold cursor-pointer text-[13px]">Editar</button>
              <button onClick={() => { if (confirm("Eliminar cliente?")) onEliminar(selectedCliente.id); }} className="px-5 py-3 rounded-xl bg-red-100 text-red-600 border-none font-semibold cursor-pointer text-[13px]">Eliminar</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Dados de Contacto</h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-400" />
                <span className="text-gray-900">{selectedCliente.telemovel || "—"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-gray-400" />
                <span className="text-gray-900">{selectedCliente.email || "—"}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-gray-900">{selectedCliente.morada || "—"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Building size={16} className="text-gray-400" />
                <span className="text-gray-900">{selectedCliente.nif || "—"} (NIF)</span>
              </div>
              {selectedCliente.empresa && (
                <div className="flex items-center gap-3">
                  <Building size={16} className="text-gray-400" />
                  <span className="text-gray-900">{selectedCliente.empresa}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Orçamento</h3>
            {selectedCliente.propostaNumero ? (
              <div className="grid gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-[13px]">Número</span>
                  <a href={`/admin/orcamento?edit=${selectedCliente.propostaId}`} target="_blank" className="text-sky-500 font-bold text-sm no-underline">{selectedCliente.propostaNumero}</a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-[13px]">Valor</span>
                  <span className="text-[#F25C05] font-bold text-lg">{selectedCliente.propostaValor?.toFixed(2) || "0.00"} €</span>
                </div>
                {selectedCliente.dataEnvio && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-[13px]">Enviada</span>
                    <span className="text-sky-500 text-[13px]">{selectedCliente.dataEnvio}</span>
                  </div>
                )}
                {selectedCliente.resposta && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-[13px]">Resposta</span>
                    <span className={`text-[12px] px-2.5 py-1 rounded-md font-semibold ${(selectedCliente?.resposta || c?.resposta) === "sim" ? "bg-emerald-100 text-emerald-600" : (selectedCliente?.resposta || c?.resposta) === "nao" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                      {selectedCliente.resposta === "sim" ? "✓ Aceito" : selectedCliente.resposta === "nao" ? "✕ Recusado" : "↻ Reagendado"}
                    </span>
                  </div>
                )}
                {selectedCliente.propostaId && (
                  <div style={{ marginTop: 8 }}>
                    <a href={`/p/${selectedCliente.propostaId}`} target="_blank" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-500 text-white border-none text-xs font-semibold no-underline cursor-pointer">
                      <FileText size={14} /> Ver Proposta
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-5 text-gray-400">
                <FileText size={32} className="mb-2 opacity-50" />
                <div className="text-[13px]">Sem orçamento vinculado</div>
                <button onClick={() => onVincularProposta(selectedCliente)} className="mt-3 px-4 py-2 rounded-lg bg-amber-500 text-white border-none text-xs font-semibold cursor-pointer">Vincular Proposta</button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Histórico</h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-gray-500 text-[13px]">Entrada</span>
                <span className="text-gray-900 text-[13px] ml-auto">
                  {selectedCliente.createdAt ? new Date(selectedCliente.createdAt).toLocaleDateString("pt-PT") : "—"}
                </span>
              </div>
              {selectedCliente.origem && (
                <div className="flex items-center gap-3">
                  <Building size={16} className="text-gray-400" />
                  <span className="text-gray-500 text-[13px]">Origem</span>
                  <span className="text-gray-900 text-[13px] ml-auto">{selectedCliente.origem}</span>
                </div>
              )}
              {selectedCliente.dataResposta && (
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-gray-500 text-[13px]">Data Resposta</span>
                  <span className="text-gray-900 text-[13px] ml-auto">{new Date(selectedCliente.dataResposta).toLocaleDateString("pt-PT")}</span>
                </div>
              )}
            </div>
            
            {selectedCliente.observacoes && (
              <div className="mt-5 pt-4 border-t border-gray-200">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Observações</h4>
                <p className="text-[13px] text-gray-900 leading-relaxed">{selectedCliente.observacoes}</p>
              </div>
            )}
          </div>
        </div>

        {selectedCliente.categoria === "cliente" && (
          <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Plano de Trabalho</h3>
                <p className="text-xs text-gray-500">
                  {selectedCliente.servicos && selectedCliente.servicos.length > 0 
                    ? `Baseado em: ${selectedCliente.servicos.join(", ")}`
                    : "Selecione as tarefas e defina datas"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-xs text-gray-500">
                  Progresso: {tarefasAtuais.filter((t: any) => t.concluida).length} / {tarefasAtuais.length}
                </div>
                <div className="w-[100px] h-2 bg-gray-200 rounded-sm overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-sm" style={{ width: `${(tarefasAtuais.filter((t: any) => t.concluida).length / tarefasAtuais.length) * 100 || 0}%` }} />
                </div>
              </div>
            </div>

            {processo.id === "publicado" && selectedCliente.publicacaoData && (
              <div className="bg-emerald-50 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={20} color="#10B981" />
                  <span className="font-bold text-emerald-500">ProjetoPublicado!</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-[11px] text-gray-500">Data</span>
                    <div className="text-sm font-semibold text-gray-900">{selectedCliente.publicacaoData}</div>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500">Horário</span>
                    <div className="text-sm font-semibold text-gray-900">{selectedCliente.publicacaoHora || "—"}</div>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500">Plataforma</span>
                    <div className="text-sm font-semibold text-gray-900">{selectedCliente.publicacaoPlataforma || "—"}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
              {tarefasAtuais.map((tarefa: any, index: number) => {
                const Icon = tarefa.icon || FileText;
                return (
                  <div key={index} className={`rounded-xl p-4 border-2 transition-colors ${tarefa.concluida ? "bg-emerald-50 border-emerald-500" : "bg-gray-50 border-gray-200"}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <button 
                        onClick={() => toggleTarefa(index)}
                        className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer shrink-0 transition-colors ${tarefa.concluida ? "bg-emerald-500 border-transparent text-white" : "bg-white border-2 border-gray-200 text-transparent"}`}
                      >
                        {tarefa.concluida && <Check size={14} color="#fff" />}
                      </button>
                      <div style={{ flex: 1 }}>
                        <div className={`font-semibold text-[13px] text-gray-900 ${tarefa.concluida ? "line-through opacity-60" : ""}`}>{tarefa.nome}</div>
                        <div style={{ fontSize: 11, color: theme.colors.text.secondary, marginTop: 2 }}>{tarefa.descricao}</div>
                      </div>
                      <Icon size={18} color={tarefa.concluida ? "#10B981" : theme.colors.text.tertiary} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-500 block mb-1">Data Início</label>
                        <input 
                          type="date" 
                          value={tarefa.dataInicio || ""} 
                          onChange={(e) => updateDataTarefa(index, "dataInicio", e.target.value)}
                          className="w-full px-2 py-1.5 rounded-md border border-gray-200 text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 block mb-1">Data Entrega</label>
                        <input 
                          type="date" 
                          value={tarefa.dataEntrega || ""} 
                          onChange={(e) => updateDataTarefa(index, "dataEntrega", e.target.value)}
                          className="w-full px-2 py-1.5 rounded-md border border-gray-200 text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {tarefasAtuais.length === 0 && (
              <div className="text-center p-10 text-gray-400">
                <FileText size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
                <div className="text-sm mb-2">Sem tarefas definidas</div>
                <div className="text-xs">As tarefas são geradas automaticamente com base nos serviços do orçamento</div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-sans text-2xl md:text-3xl font-black text-gray-900 mb-2">Clientes</h1>
          <p className="text-gray-500 text-sm">{clientes.length} clientes</p>
        </div>
        <button onClick={onNovoCliente} className="px-5 py-3 rounded-xl bg-[#F25C05] text-white border-none font-semibold cursor-pointer text-[13px]">+ Novo Cliente</button>
      </div>

      <div className="bg-white rounded-2xl p-5 mb-6 border border-gray-200">
        <div className="flex gap-3 flex-wrap items-center">
          <input type="text" placeholder="Buscar..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="flex-1 min-w-[150px] px-3.5 py-2.5 rounded-lg border-2 border-gray-200 text-xs" />
          <select value={filterCategoria} onChange={(e) => onFilterCategoriaChange(e.target.value)} className="px-3.5 py-2.5 rounded-lg border-2 border-gray-200 text-xs min-w-[120px]">
            <option value="todos">Todos</option>
            <option value="cliente">Cliente</option>
            <option value="potencial">Potencial</option>
            <option value="curioso">Curioso</option>
          </select>
          <select value={sortBy} onChange={(e) => onSortByChange(e.target.value)} className="px-3.5 py-2.5 rounded-lg border-2 border-gray-200 text-xs">
            <option value="createdAt">Data</option>
            <option value="nome">Nome</option>
            <option value="propostaValor">Valor</option>
          </select>
          <button onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")} className="px-3.5 py-2.5 rounded-lg border-2 border-gray-200 bg-white cursor-pointer">{sortOrder === "asc" ? "↑" : "↓"}</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <th className="px-3.5 py-3 text-[11px] font-semibold text-gray-500 text-left">Nome</th>
              <th className="px-3.5 py-3 text-[11px] font-semibold text-gray-500 text-left">Categoria</th>
              <th className="px-3.5 py-3 text-[11px] font-semibold text-gray-500 text-left">Processo</th>
              <th className="px-3.5 py-3 text-[11px] font-semibold text-gray-500 text-left">Telefone</th>
              <th className="px-3.5 py-3 text-[11px] font-semibold text-gray-500 text-left">Email</th>
              <th className="px-3.5 py-3 text-[11px] font-semibold text-gray-500 text-left">Orçamento</th>
              <th className="px-3.5 py-3 text-[11px] font-semibold text-gray-500 text-left">Proposta</th>
              <th className="px-3.5 py-3 text-[11px] font-semibold text-gray-500 text-left">Resposta</th>
              <th className="px-3.5 py-3 text-[11px] font-semibold text-gray-500 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const processo = getProcessoInfo(c.processo || "iniciado");
              const ProcessoIcon = processo.icon;
              return (
                <tr key={c.id} onClick={() => onSelectCliente(c)} className="cursor-pointer border-t border-gray-100 bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-3.5 py-3 text-xs"><div className="font-bold text-gray-900">{c.nome}</div></td>
                  <td className="px-3.5 py-3"><span className={`text-[10px] px-2.5 py-1 rounded-xl font-semibold ${getCategoriaClasses(c.categoria)}`}>{getCategoriaLabel(c.categoria)}</span></td>
                  <td className="px-3.5 py-3">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation();
                        const currentIndex = PROCESSOS.findIndex(p => p.id === (c.processo || "iniciado"));
                        const nextIndex = (currentIndex + 1) % PROCESSOS.length;
                        onUpdateProcesso(c.id, PROCESSOS[nextIndex].id);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-none text-[11px] font-semibold cursor-pointer ${processo.colorClass}`}
                    >
                      <ProcessoIcon size={12} />
                      {processo.label}
                    </button>
                  </td>
                  <td className="px-3.5 py-3 text-xs text-gray-500">{c.telemovel || "—"}</td>
                  <td className="px-3.5 py-3 text-xs text-gray-500">{c.email || "—"}</td>
                  <td className="px-3.5 py-3">
                    {c.propostaNumero ? (
                      <a href={`/admin/orcamento?edit=${c.propostaId}`} target="_blank" onClick={(e) => e.stopPropagation()} className="text-sky-500 font-semibold text-xs cursor-pointer no-underline hover:text-sky-600 transition-colors">{c.propostaNumero}</a>
                    ) : <span className="text-xs text-gray-300">—</span>}
                  </td>
                  <td className="px-3.5 py-3">
                    {c.propostaId ? (
                      <a href={`/p/${c.propostaId}`} target="_blank" onClick={(e) => e.stopPropagation()} className="px-3 py-1.5 rounded-md bg-sky-500 text-white border-none text-[11px] font-semibold cursor-pointer no-underline inline-block hover:bg-sky-600 transition-colors">Proposta</a>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); onVincularProposta(c); }} className="px-2.5 py-1 rounded-md bg-amber-500 text-white border-none text-[10px] font-semibold cursor-pointer hover:bg-amber-600 transition-colors">Vincular</button>
                    )}
                  </td>
                  <td className="px-3.5 py-3">
                    {c.resposta ? (
                      <span className={`text-[10px] px-2.5 py-1 rounded-md font-semibold ${(selectedCliente?.resposta || c?.resposta) === "sim" ? "bg-emerald-100 text-emerald-600" : (selectedCliente?.resposta || c?.resposta) === "nao" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                        {c.resposta === "sim" ? "✓ Aceito" : c.resposta === "nao" ? "✕ Recusado" : "↻ Reagendado"}
                      </span>
                    ) : <span className="text-[10px] px-2 py-1 rounded-sm bg-gray-100 text-gray-400 font-semibold">Pendente</span>}
                  </td>
                  <td className="px-3.5 py-3 text-center">
                    <div className="flex gap-1 justify-center" onClick={(e) => e.stopPropagation()}>
                      {c.categoria === "cliente" && (
                        <button onClick={() => onFaturar(c)} title="Faturar" className="px-2 py-1.5 rounded-md bg-emerald-500 text-white border-none text-[11px] cursor-pointer hover:bg-emerald-600 transition-colors">€</button>
                      )}
                      <button onClick={() => onEditar(c)} title="Editar" className="px-2 py-1.5 rounded-md bg-gray-100 text-gray-500 border-none text-[11px] cursor-pointer hover:bg-gray-200 transition-colors">✎</button>
                      <button onClick={() => onEliminar(c.id)} title="Eliminar" className="px-2 py-1.5 rounded-md bg-red-100 text-red-600 border-none text-[11px] cursor-pointer hover:bg-red-200 transition-colors">✕</button>
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