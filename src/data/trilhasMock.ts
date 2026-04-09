// FIXED: DRY violation - moved trilhasMock to shared data file

export interface Trilha {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  total_aulas: number;
  tempo_total: string;
  nivel: 'Iniciante' | 'Intermédio' | 'Avançado';
  cor: string;
}

export const TRILHAS_MOCK: Trilha[] = [
  {
    id: 'ia-negocios',
    nome: 'IA para Negócios Locais',
    descricao: 'Aprende a usar inteligência artificial para aumentar vendas e clientes no teu negócio.',
    icone: '🤖',
    total_aulas: 12,
    tempo_total: '3h 20min',
    nivel: 'Iniciante',
    cor: '#ff6f2e',
  },
  {
    id: 'automacao',
    nome: 'Automação sem Código',
    descricao: 'Automatiza tarefas repetitivas com Zapier, Make e ferramentas sem programação.',
    icone: '⚡',
    total_aulas: 8,
    tempo_total: '2h 45min',
    nivel: 'Intermédio',
    cor: '#cb1a74',
  },
  {
    id: 'comunicacao',
    nome: 'Comunicação Digital',
    descricao: 'Cria conteúdo, copy e campanhas que convertem para redes sociais.',
    icone: '📢',
    total_aulas: 10,
    tempo_total: '2h 10min',
    nivel: 'Iniciante',
    cor: '#10B981',
  },
  {
    id: 'produtividade',
    nome: 'Produtividade com IA',
    descricao: 'Organiza o teu dia, agenda e tarefas con assistentes virtuais.',
    icone: '⏱️',
    total_aulas: 6,
    tempo_total: '1h 30min',
    nivel: 'Iniciante',
    cor: '#3B82F6',
  },
];

export const getTrilhaById = (id: string): Trilha | undefined => {
  return TRILHAS_MOCK.find(t => t.id === id);
};