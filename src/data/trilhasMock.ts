// FIXED: DRY violation - moved trilhasMock to shared data file

export interface Trilha {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  total_aulas: number;
  tempo_total: string;
  nivel: 'Beginner' | 'Intermediate' | 'Advanced';
  cor: string;
}

export const TRILHAS_MOCK: Trilha[] = [
  {
    id: 'ia-negocios',
    nome: 'AI for local business',
    descricao: 'Learn to use artificial intelligence to grow sales and customers for your business.',
    icone: '🤖',
    total_aulas: 12,
    tempo_total: '3h 20min',
    nivel: 'Beginner',
    cor: '#ff6f2e',
  },
  {
    id: 'automacao',
    nome: 'No-code automation',
    descricao: 'Automate repetitive tasks with Zapier, Make, and tools without coding.',
    icone: '⚡',
    total_aulas: 8,
    tempo_total: '2h 45min',
    nivel: 'Intermediate',
    cor: '#cb1a74',
  },
  {
    id: 'comunicacao',
    nome: 'Digital communication',
    descricao: 'Create content, copy, and campaigns that convert on social media.',
    icone: '📢',
    total_aulas: 10,
    tempo_total: '2h 10min',
    nivel: 'Beginner',
    cor: '#10B981',
  },
  {
    id: 'produtividade',
    nome: 'Productivity with AI',
    descricao: 'Organize your day, calendar, and tasks with virtual assistants.',
    icone: '⏱️',
    total_aulas: 6,
    tempo_total: '1h 30min',
    nivel: 'Beginner',
    cor: '#3B82F6',
  },
];

export const getTrilhaById = (id: string): Trilha | undefined => {
  return TRILHAS_MOCK.find(t => t.id === id);
};
