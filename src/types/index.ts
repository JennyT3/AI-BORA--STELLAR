export interface Vendedor {
  id: string;
  nome: string;
  email: string;
  telemovel?: string;
  ativo: boolean;
  criadoEm?: string;
  // Referral system
  referidoPor?: string;
  referidosInvitados?: string[];
  referidosConvertidos?: number;
  bonusProximoCliente?: boolean;
}

export interface Marca {
  id?: string;
  nome: string;
  redes: string[];
  servicos?: string[];
}

export interface Proposal {
  id: string;
  cliente: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  website?: string;
  nif?: string;
  morada?: string;
  servicos?: string[];
  marcas?: Marca[];
  total?: number;
  valor?: number;
  numeroOrcamento?: string;
  descontoPercent?: number;
  descontoValor?: number;
  status?: string;
  resposta?: "sim" | "nao" | "reagendar";
  dataEnvio?: string;
  dataResposta?: string;
  enviadoPor?: string;
  respondidoPor?: string;
  atualizadoPor?: string;
  atualizadoEm?: string;
  criadoPor?: string;
  criadoEm?: string;
  createdAt?: string;
  updatedAt?: string;
  validUntil?: string;
  clienteId?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telemovel?: string;
  nif?: string;
  morada?: string;
  empresa?: string;
  website?: string;
  categoria?: "potencial" | "ativo" | "inativo" | "cliente" | "sem_interesse" | "proposta_enviada";
  origem?: string;
  observacoes?: string;
  solicitacaoId?: string;
  propostaId?: string;
  vendedorId?: string;
  processo?: string;
  tarefas?: string[];
  servicos?: string[];
  resposta?: string;
  dataResposta?: string;
  criadoPor?: string;
  criadoEm?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Solicitude {
  id?: string;
  nome: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  website?: string;
  servicos?: string[];
  marcas?: Marca[];
  origem?: string;
  observacoes?: string;
  status?: "pendente" | "em-analise" | "proposta-enviada" | "contactado" | "convertido" | "descartado";
  vendedorId?: string;
  criadoEm?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrcamentoRequest {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  website?: string;
  servicos?: string[];
  marcas?: Marca[];
  status?: string;
  criadoEm?: string;
  createdAt?: string;
}

export type ProposalStatus = "pendente" | "enviada" | "aceite" | "recusada" | "reagendada";
export type ClienteCategoria = "potencial" | "ativo" | "inativo";

export interface Tarea {
  id: string;
  titulo: string;
  descricao?: string;
  servicoId?: string;
  servicoNome?: string;
  clienteId: string;
  clienteNome?: string;
  clienteEmail?: string;
  propostaId?: string;
  valorCliente?: number;
  porcentagemColaborador?: number;
  porcentagemVendedor?: number;
  recorrente?: boolean;
  periodicidade?: 'mensal' | 'pontual';
  estado: 'disponivel' | 'asignada' | 'entregue' | 'aprovada_admin' | 'aprovada_cliente' | 'paga';
  solicitantes?: string[];
  asignadaA?: string;
  asignadoNome?: string;
  prazo?: string;
  entregaUrl?: string;
  entregaNota?: string;
  comissaoColaboradorValor?: number;
  comissaoColaboradorTipo?: 'fixo' | 'percentagem';
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface FaturaRecorrente {
  id: string;
  clienteId: string;
  valor: number;
  dataEmissao: string;
  dueDate: string;
  status: "pendente" | "pago_notificado" | "pago" | "atrasada";
  createdAt: string;
  updatedAt?: string;
}

export interface RegistoEmail {
  id: string;
  clienteId: string;
  tipo: "confirmacao" | "proposta" | "fatura" | "entrega" | "reminder";
  destinatario: string;
  assunto: string;
  dataEnvio: string;
}
