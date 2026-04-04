// ─── Vendedor ───────────────────────────────────────────────
export interface Vendedor {
  id: string;
  nome: string;
  email: string;
  telemovel?: string;
  ativo: boolean;
  criadoEm?: string;
}

// ─── Proposta ────────────────────────────────────────────────
export interface Marca {
  id: string;
  nome: string;
  redes: string[];
  servicos: string[];
}

export interface Proposal {
  id: string;
  cliente: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  website?: string;
  servicos?: string[];
  marcas?: Marca[];
  total?: number;
  status?: string;
  resposta?: "sim" | "nao" | "reagendar";
  dataEnvio?: string;
  enviadoPor?: string;
  atualizadoPor?: string;
  atualizadoEm?: string;
  criadoPor?: string;
  criadoEm?: string;
}

// ─── Cliente ─────────────────────────────────────────────────
export interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telemovel?: string;
  nif?: string;
  morada?: string;
  empresa?: string;
  website?: string;
  categoria?: "potencial" | "ativo" | "inativo";
  origem?: string;
  observacoes?: string;
  solicitacaoId?: string;
  servicos?: string[];
  criadoPor?: string;
  criadoEm?: string;
}

// ─── Solicitação (pedido de orçamento público) ────────────────
export interface Solicitude {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  website?: string;
  servicos?: string[];
  marcas?: Marca[];
  origem?: string;
  status?: "pendente" | "contactado" | "convertido" | "descartado";
  criadoEm?: string;
}

// ─── Orçamento (pedido interno/admin) ────────────────────────
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
}

// ─── Status helpers ───────────────────────────────────────────
export type ProposalStatus = "pendente" | "enviada" | "aceite" | "recusada" | "reagendada";
export type ClienteCategoria = "potencial" | "ativo" | "inativo";
