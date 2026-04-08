import React from 'react';
import { BookOpen, Play, Award, Zap, Users, ArrowRight, Star, Quote } from 'lucide-react';

// CORES AI BORA - SEMPRE USAR ESTAS
const colors = {
  orange: '#ff6f2e',
  magenta: '#cb1a74', 
  coral: '#fb4a50',
  yellow: '#ede72e',
  dark: '#1c1b1b',
  light: '#fcf9f8'
};

// Dados mock - depois virão do backend
const cursosEmDestaque = [
  {
    id: 1,
    titulo: 'Dominar Prompts',
    descricao: 'Aprende a linguagem das máquinas para obter resultados perfeitos em segundos.',
    duracao: '2h 30min',
    aulas: 12,
    nivel: 'Iniciante',
    imagem: '/academia/prompts.jpg',
    categoria: 'IA',
    emProgresso: true,
    progresso: 65
  },
  {
    id: 2,
    titulo: 'Automatização de Tarefas',
    descricao: 'Zapier, Make e Python básico para delegar as tuas tarefas repetitivas.',
    duracao: '3h 15min',
    aulas: 8,
    nivel: 'Intermédio',
    imagem: '/academia/automacao.jpg',
    categoria: 'Automação',
    emProgresso: false,
    progresso: 0
  },
  {
    id: 3,
    titulo: 'IA para Criadores',
    descricao: 'Gera vídeo, áudio e imagens de alta qualidade com ferramentas generativas.',
    duracao: '4h',
    aulas: 15,
    nivel: 'Iniciante',
    imagem: '/academia/criadores.jpg',
    categoria: 'Criação',
    emProgresso: false,
    progresso: 0
  },
  {
    id: 4,
    titulo: 'Análise Preditiva',
    descricao: 'Usa modelos de linguagem para entender tendências e tomar decisões de negócio.',
    duracao: '3h',
    aulas: 10,
    nivel: 'Avançado',
    imagem: '/academia/analise.jpg',
    categoria: 'Dados',
    emProgresso: false,
    progresso: 0
  }
];

const testemunhos = [
  {
    nome: 'Álvaro Rodrigues',
    cargo: 'Marketing Manager',
    texto: 'Antes perdia horas a redigir relatórios. Agora, com o que aprendi no módulo de Prompts, faço-o em minutos e com melhor qualidade. É uma mudança de jogo total.',
    cor: colors.orange
  },
  {
    nome: 'Lucía Méndez',
    cargo: 'Freelance Designer',
    texto: 'A Bora Lá não é teoria aborrecida. Entras, vês um vídeo de 10 minutos e já estás a implementar uma automatização no teu Slack. Incrível!',
    cor: colors.magenta
  }
];

export default function Academia() {
  return (
    <div className="min-h-screen bg-[#fcf9f8]" style={{ fontFamily: '"Montserrat", sans-serif' }}>
      
      {/* ===== NAVBAR ===== */}
      <nav className="bg-[#fcf9f8]/80 backdrop-blur-md sticky top-0 z-50 shadow-[0_12px_32px_-4px_rgba(255,111,46,0.08)]">
        <div className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)` }}
            >
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-[#1c1b1b]">Academia </span>
              <span 
                className="text-xl font-extrabold"
                style={{ color: colors.orange }}
              >
                Ai Bora
              </span>
            </div>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <a 
              href="#" 
              className="px-4 py-1.5 rounded-full font-bold text-sm transition-all"
              style={{ 
                backgroundColor: `${colors.orange}15`,
                color: colors.orange 
              }}
            >
              Home
            </a>
            <a 
              href="#cursos" 
              className="text-gray-600 font-medium hover:text-[#ff6f2e] transition-colors"
            >
              Catálogo
            </a>
            <a 
              href="#" 
              className="text-gray-600 font-medium hover:text-[#ff6f2e] transition-colors"
            >
              Dashboard
            </a>
            <a 
              href="#" 
              className="text-gray-600 font-medium hover:text-[#ff6f2e] transition-colors"
            >
              Recursos
            </a>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:text-[#ff6f2e] transition-colors">
              <Star className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#ff6f2e]/20">
              <img 
                src="https://ui-avatars.com/api/?name=User&background=ff6f2e&color=fff" 
                alt="Perfil" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* ===== HERO SECTION ===== */}
        <section className="relative overflow-hidden pt-20 pb-32 px-8">
          <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row items-center gap-16">
            
            {/* Texto */}
            <div className="flex-1 space-y-8 z-10">
              <div 
                className="inline-flex items-center px-4 py-1.5 rounded-full font-bold text-sm uppercase tracking-wider"
                style={{ 
                  backgroundColor: `${colors.magenta}15`,
                  color: colors.magenta 
                }}
              >
                <Zap className="w-4 h-4 mr-2" />
                Próxima Geração de Aprendizagem
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-[#1c1b1b]">
                Aprende rápido.<br />
                Aplica hoje.<br />
                <span 
                  className="bg-clip-text text-transparent"
                  style={{ 
                    backgroundImage: `linear-gradient(135deg, ${colors.magenta} 0%, ${colors.coral} 100%)` 
                  }}
                >
                  Menos teoria, mais ação.
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-xl leading-relaxed">
                Domina as ferramentas que estão a transformar o mundo. Inteligência Artificial e Automação desenhadas para resultados imediatos.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  className="px-8 py-4 rounded-2xl font-bold text-lg text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.coral} 100%)` }}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Entrar na Academia
                </button>
                <button className="px-8 py-4 rounded-2xl border-2 border-gray-300 text-gray-700 font-bold text-lg hover:border-[#ff6f2e] hover:text-[#ff6f2e] transition-all">
                  Ver currículo
                </button>
              </div>
            </div>

            {/* Imagem */}
            <div className="flex-1 relative">
              <div 
                className="absolute inset-0 rounded-full blur-3xl -z-10 transform translate-x-12 translate-y-12"
                style={{ backgroundColor: `${colors.orange}20` }}
              ></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop" 
                  alt="Equipa criativa a trabalhar" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===== BENEFÍCIOS BENTO GRID ===== */}
        <section className="py-24 bg-[#f6f3f2] px-8">
          <div className="max-w-screen-2xl mx-auto">
            <div className="mb-16">
              <h2 className="text-3xl font-extrabold text-[#1c1b1b] mb-4">
                Porquê a Bora Lá?
              </h2>
              <div 
                className="h-1.5 w-24 rounded-full"
                style={{ background: `linear-gradient(90deg, ${colors.orange} 0%, ${colors.coral} 100%)` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1 - Grande */}
              <div className="md:col-span-2 bg-white p-10 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-shadow">
                <div>
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${colors.orange}15` }}
                  >
                    <Zap className="w-7 h-7" style={{ color: colors.orange }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-[#1c1b1b]">IA para o mundo real</h3>
                  <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
                    Não te ensinamos a filosofar sobre IA. Ensinamos-te a usá-la para redigir, desenhar e analisar em minutos o que antes demorava horas.
                  </p>
                </div>
                <div className="mt-8 flex gap-2">
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                    style={{ backgroundColor: colors.yellow, color: colors.dark }}
                  >
                    Produtividade
                  </span>
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                    style={{ backgroundColor: `${colors.orange}20`, color: colors.orange }}
                  >
                    Prático
                  </span>
                </div>
              </div>

              {/* Card 2 - Pequeno escuro */}
              <div 
                className="p-10 rounded-2xl text-white flex flex-col justify-center hover:scale-[1.02] transition-transform"
                style={{ backgroundColor: colors.magenta }}
              >
                <Zap className="w-12 h-12 mb-6 fill-current" />
                <h3 className="text-2xl font-bold mb-4">Automatização Radical</h3>
                <p className="opacity-90 leading-relaxed">
                  Cria fluxos de trabalho que trabalhem por ti enquanto dormes. Deixa de ser o estrangulamento.
                </p>
              </div>

              {/* Card 3 - Pequeno */}
              <div className="bg-white p-10 rounded-2xl hover:shadow-lg transition-shadow">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${colors.coral}15` }}
                >
                  <Users className="w-7 h-7" style={{ color: colors.coral }} />
                </div>
                <h3 className="text-xl font-bold mb-4 text-[#1c1b1b]">Comunidade de Ação</h3>
                <p className="text-gray-600 leading-relaxed">
                  Conecta com outros profissionais que, como tu, preferem executar a simplesmente observar.
                </p>
              </div>

              {/* Card 4 - Grande escuro */}
              <div className="md:col-span-2 bg-[#1c1b1b] text-white p-10 rounded-2xl flex items-center gap-8 overflow-hidden relative">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-4">Mentalidade de Crescimento</h3>
                  <p className="opacity-80 leading-relaxed">
                    O conteúdo atualiza-se semanalmente. No mundo da IA, o que aprendeste ontem já é história.
                  </p>
                </div>
                <div 
                  className="hidden sm:block w-48 h-48 rounded-full absolute -right-10 -bottom-10 blur-2xl"
                  style={{ background: `linear-gradient(135deg, ${colors.orange}40 0%, ${colors.magenta}40 100%)` }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== MÓDULOS DESTACADOS ===== */}
        <section id="cursos" className="py-24 px-8">
          <div className="max-w-screen-2xl mx-auto">
            <div className="flex justify-between items-end mb-16">
              <div>
                <h2 className="text-3xl font-extrabold text-[#1c1b1b] mb-4">
                  Módulos em Destaque
                </h2>
                <p className="text-gray-600">
                  Começa pelo mais importante hoje mesmo.
                </p>
              </div>
              <a 
                href="#" 
                className="hidden md:flex items-center font-bold hover:opacity-80 transition-opacity"
                style={{ color: colors.magenta }}
              >
                Ver todo o catálogo 
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {cursosEmDestaque.map((curso) => (
                <div 
                  key={curso.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all group cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                    </div>
                    {curso.emProgresso && (
                      <div 
                        className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: colors.orange }}
                      >
                        Em Progresso
                      </div>
                    )}
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded-lg text-sm font-medium">
                      {curso.duracao}
                    </div>
                  </div>
                  
                  {/* Conteúdo */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">{curso.nivel}</span>
                      <span className="text-sm font-medium text-gray-500">{curso.aulas} aulas</span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-[#1c1b1b] mb-2 group-hover:text-[#ff6f2e] transition-colors">
                      {curso.titulo}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {curso.descricao}
                    </p>
                    
                    {curso.emProgresso ? (
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            width: `${curso.progresso}%`,
                            background: `linear-gradient(90deg, ${colors.magenta} 0%, ${colors.coral} 100%)`
                          }}
                        ></div>
                      </div>
                    ) : (
                      <button 
                        className="w-full py-2 rounded-xl font-semibold transition-all hover:text-white"
                        style={{ 
                          backgroundColor: `${colors.orange}15`,
                          color: colors.orange
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.orange;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = `${colors.orange}15`;
                        }}
                      >
                        Começar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center md:hidden">
              <a 
                href="#" 
                className="inline-flex items-center font-bold"
                style={{ color: colors.magenta }}
              >
                Ver todo o catálogo
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </div>
          </div>
        </section>

        {/* ===== TESTEMUNHOS ===== */}
        <section className="py-24 bg-[#f6f3f2] px-8">
          <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/3">
              <h2 className="text-4xl font-extrabold text-[#1c1b1b] mb-6">
                O que dizem<br />os nossos alunos
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Não somos nós, são eles que mudaram a forma de trabalhar.
              </p>
            </div>
            
            <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
              {testemunhos.map((testemunho, index) => (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-sm relative">
                  <div 
                    className="absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: testemunho.cor }}
                  >
                    <Quote className="w-6 h-6" />
                  </div>
                  <p className="text-gray-600 italic mb-6 leading-relaxed">
                    "{testemunho.texto}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${testemunho.nome}&background=random`}
                        alt={testemunho.nome}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1c1b1b]">{testemunho.nome}</h4>
                      <p className="text-xs text-gray-500 uppercase tracking-tighter">{testemunho.cargo}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA FINAL ===== */}
        <section className="py-24 px-8 text-center">
          <div 
            className="max-w-3xl mx-auto p-16 rounded-[3rem] relative overflow-hidden shadow-2xl"
            style={{ background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)` }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8">
              Bora! Começa o teu caminho agora.
            </h2>
            <p className="text-xl mb-12 text-white/90">
              Junta-te a mais de 5.000 profissionais que já estão a liderar a mudança tecnológica.
            </p>
            <button className="bg-white px-10 py-5 rounded-2xl font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-xl"
              style={{ color: colors.orange }}>
              Quero subscrever hoje
            </button>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#f6f3f2] py-12">
        <div className="flex flex-col md:flex-row justify-between items-start px-8 max-w-screen-2xl mx-auto gap-8">
          <div className="space-y-4">
            <div className="text-lg font-bold" style={{ color: colors.orange }}>
              Bora Lá
            </div>
            <p className="text-gray-500 max-w-xs text-sm">
              A empoderar a próxima geração de profissionais através da Inteligência Artificial prática.
            </p>
            <div className="text-sm text-gray-500">
              © 2024 Bora Lá. Todos os direitos reservados.
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div className="flex flex-col gap-3">
              <h5 className="font-bold text-[#1c1b1b] text-sm">Plataforma</h5>
              <a href="#" className="text-gray-500 text-sm hover:text-[#cb1a74] transition-colors">Catálogo</a>
              <a href="#" className="text-gray-500 text-sm hover:text-[#cb1a74] transition-colors">Preços</a>
              <a href="#" className="text-gray-500 text-sm hover:text-[#cb1a74] transition-colors">Ajuda</a>
            </div>
            <div className="flex flex-col gap-3">
              <h5 className="font-bold text-[#1c1b1b] text-sm">Legal</h5>
              <a href="#" className="text-gray-500 text-sm hover:text-[#cb1a74] transition-colors">Privacidade</a>
              <a href="#" className="text-gray-500 text-sm hover:text-[#cb1a74] transition-colors">Termos</a>
            </div>
            <div className="flex flex-col gap-3">
              <h5 className="font-bold text-[#1c1b1b] text-sm">Empresa</h5>
              <a href="#" className="text-gray-500 text-sm hover:text-[#cb1a74] transition-colors">Carreiras</a>
              <a href="#" className="text-gray-500 text-sm hover:text-[#cb1a74] transition-colors">Contacto</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
