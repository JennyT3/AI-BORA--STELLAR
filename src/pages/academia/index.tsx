import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Play, Award, Zap, Users, ArrowRight, Star, Quote } from 'lucide-react';

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
    <div className="min-h-screen bg-bg" style={{ fontFamily: '"Montserrat", sans-serif' }}>
      
      {/* ===== NAVBAR GLOBAL ===== */}
      <Navbar />

      <main className="pt-16">
        {/* ===== HERO SECTION ===== */}
        <section className="relative overflow-hidden pt-20 pb-32 px-8 bg-white">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
            
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
                <a 
                  href="/academia/login"
                  className="px-8 py-4 rounded-2xl font-bold text-lg text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.coral} 100%)` }}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Acessar Plataforma
                </a>
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
          <div className="max-w-6xl mx-auto">
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
                style={{ backgroundColor: colors.dark }}
              >
                <Award className="w-10 h-10 mb-4" style={{ color: colors.orange }} />
                <h3 className="text-xl font-bold mb-3">Certificados</h3>
                <p className="text-sm leading-relaxed opacity-90">
                  Certificações reconhecidas que podes partilhar no LinkedIn.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-10 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-shadow">
                <div>
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${colors.magenta}15` }}
                  >
                    <Users className="w-7 h-7" style={{ color: colors.magenta }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-[#1c1b1b]">Comunidade</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Aprende com outros e partilha as tuas descobertas.
                  </p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white p-10 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-shadow">
                <div>
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${colors.coral}15` }}
                  >
                    <Zap className="w-7 h-7" style={{ color: colors.coral }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-[#1c1b1b]">Atualizações</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Novos cursos e conteúdo adicionado regularmente.
                  </p>
                </div>
              </div>

              {/* Card 5 */}
              <div className="bg-white p-10 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-shadow">
                <div>
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${colors.yellow}20` }}
                  >
                    <Star className="w-7 h-7" style={{ color: colors.yellow }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-[#1c1b1b]">Suporte</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Acesso a tutoriais, FAQs e suporte direto.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CURSOS EM DESTAQUE ===== */}
        <section id="cursos" className="py-24 px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <h2 className="text-3xl font-extrabold text-[#1c1b1b] mb-4">
                Cursos em Destaque
              </h2>
              <div 
                className="h-1.5 w-24 rounded-full"
                style={{ background: `linear-gradient(90deg, ${colors.orange} 0%, ${colors.coral} 100%)` }}
              ></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {cursosEmDestaque.map((curso) => (
                <div key={curso.id} className="group rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-48 overflow-hidden bg-gray-200">
                    <img 
                      src={curso.imagem} 
                      alt={curso.titulo}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = `https://images.unsplash.com/photo-1516534775068-bb57e39c8ac0?w=400&h=300&fit=crop`;
                      }}
                    />
                    {curso.emProgresso && (
                      <div className="absolute top-4 right-4 bg-[#10B981] text-white px-3 py-1 rounded-full text-xs font-bold">
                        Em Progresso
                      </div>
                    )}
                  </div>
                  <div className="bg-white p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-[#1c1b1b] mb-1">{curso.titulo}</h3>
                        <p className="text-xs font-bold uppercase" style={{ color: colors.orange }}>
                          {curso.categoria}
                        </p>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 rounded-full" 
                        style={{ backgroundColor: `${colors.orange}15`, color: colors.orange }}>
                        {curso.nivel}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{curso.descricao}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{curso.duracao}</span>
                      <span>{curso.aulas} aulas</span>
                    </div>
                    {curso.emProgresso && (
                      <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#10B981] h-2 rounded-full transition-all"
                          style={{ width: `${curso.progresso}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== TESTEMUNHOS ===== */}
        <section className="py-24 px-8 bg-[#f6f3f2]">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <h2 className="text-3xl font-extrabold text-[#1c1b1b] mb-4">
                O que dizem os utilizadores
              </h2>
              <div 
                className="h-1.5 w-24 rounded-full"
                style={{ background: `linear-gradient(90deg, ${colors.orange} 0%, ${colors.coral} 100%)` }}
              ></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testemunhos.map((testemunho, idx) => (
                <div key={idx} className="bg-white p-8 rounded-2xl hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <Quote className="w-5 h-5" style={{ color: testemunho.cor }} />
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed italic">"{testemunho.texto}"</p>
                  <div className="flex items-center gap-3">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${testemunho.nome}&background=random`}
                      alt={testemunho.nome}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-bold text-[#1c1b1b]">{testemunho.nome}</p>
                      <p className="text-xs text-gray-500">{testemunho.cargo}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA FINAL ===== */}
        <section className="py-24 px-8 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#1c1b1b] mb-6">
              Pronto para começar?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Junta-te a centenas de utilizadores que já estão a transformar a forma como trabalham com IA.
            </p>
            <a 
              href="/academia/login"
              className="inline-flex items-center px-8 py-4 rounded-2xl font-bold text-lg text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
              style={{ background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.coral} 100%)` }}
            >
              <Play className="w-5 h-5 mr-2" />
              Acessar Plataforma
            </a>
          </div>
        </section>
      </main>

      {/* ===== FOOTER GLOBAL ===== */}
      <Footer />
    </div>
  );
}
