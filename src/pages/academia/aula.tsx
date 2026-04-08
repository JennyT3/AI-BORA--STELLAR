import React, { useState } from 'react';
import { 
  Play, 
  Check, 
  Lock, 
  ArrowLeft, 
  ArrowRight, 
  Download, 
  MessageCircle,
  ChevronRight,
  Clock,
  FileText,
  Checklist,
  Settings,
  Maximize
} from 'lucide-react';

// CORES AI BORA
const colors = {
  orange: '#ff6f2e',
  magenta: '#cb1a74', 
  coral: '#fb4a50',
  yellow: '#ede72e',
  dark: '#1c1b1b',
  light: '#fcf9f8'
};

// Dados mock
const moduloAtual = {
  numero: '04',
  titulo: 'Automatização Avançada',
  progresso: 65
};

const aulaAtual = {
  numero: '03',
  titulo: 'Desenho de disparadores e ações',
  duracao: '24:00',
  tempoAtual: '14:22',
  descricao: 'Automatiza o teu primeiro fluxo de trabalho sem intervenção manual. Aprende a ligar CRM com email marketing.'
};

const licoes = [
  { id: 1, titulo: 'Introdução aos Webhooks', duracao: '8:00', completa: true },
  { id: 2, titulo: 'Configuração do Trigger', duracao: '12:30', completa: true },
  { id: 3, titulo: 'Desenho de disparadores', duracao: '24:00', ativa: true },
  { id: 4, titulo: 'Testing e Depuração', duracao: '15:10', bloqueada: true },
  { id: 5, titulo: 'Caso Prático: Ecommerce', duracao: '32:00', bloqueada: true }
];

const recursos = [
  { nome: 'Guia de Automatização', tipo: 'PDF', tamanho: '2.4 MB', icone: FileText, cor: colors.orange },
  { nome: 'Checklist de Integração', tipo: 'XLS', tamanho: '1.1 MB', icone: Checklist, cor: colors.magenta }
];

export default function Aula() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-[#fcf9f8]" style={{ fontFamily: '"Montserrat", sans-serif' }}>
      
      {/* HEADER */}
      <header className="bg-[#fcf9f8]/80 backdrop-blur-md sticky top-0 z-50 shadow-[0_12px_32px_-4px_rgba(255,111,46,0.08)]">
        <div className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
          
          {/* Logo Bora Lá */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)` }}>
              <Play className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold" style={{ color: colors.orange }}>Bora</span>
              <span className="text-xl font-extrabold text-[#1c1b1b]"> Aprender</span>
            </div>
          </div>

          {/* Navegação */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="/academia" className="text-gray-600 font-medium hover:text-[#ff6f2e] transition-colors">Home</a>
            <a href="#" className="px-4 py-1.5 rounded-full font-bold text-sm transition-all"
              style={{ backgroundColor: `${colors.orange}15`, color: colors.orange }}>Catálogo</a>
            <a href="#" className="text-gray-600 font-medium hover:text-[#ff6f2e] transition-colors">Dashboard</a>
            <a href="#" className="text-gray-600 font-medium hover:text-[#ff6f2e] transition-colors">Recursos</a>
          </nav>

          {/* Perfil */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:text-[#ff6f2e] transition-colors">
              <MessageCircle className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#ff6f2e]/20">
              <img src="https://ui-avatars.com/api/?name=User&background=ff6f2e&color=fff" alt="Perfil" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-8 py-12">
        
        {/* BARRA DE PROGRESSO */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
              <span>Módulo {moduloAtual.numero}</span>
              <ChevronRight className="w-4 h-4" />
              <span style={{ color: colors.orange }}>{moduloAtual.titulo}</span>
            </div>
            <div className="text-sm font-bold" style={{ color: colors.magenta }}>{moduloAtual.progresso}% Completo</div>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full"
              style={{ width: `${moduloAtual.progresso}%`, background: `linear-gradient(90deg, ${colors.magenta} 0%, ${colors.coral} 100%)` }}>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* COLUNA ESQUERDA - CONTEÚDO */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Título */}
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1c1b1b] mb-4">{aulaAtual.titulo}</h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
                <span className="font-bold" style={{ color: colors.orange }}>Objetivo:</span> {aulaAtual.descricao}
              </p>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video bg-[#1c1b1b] rounded-[2rem] overflow-hidden shadow-2xl group cursor-pointer"
              onClick={() => setIsPlaying(!isPlaying)}>
              <img src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=675&fit=crop" 
                alt="Thumbnail" className="w-full h-full object-cover opacity-60" />
              
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300"
                    style={{ background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.coral} 100%)` }}>
                    <Play className="w-8 h-8 fill-current" />
                  </div>
                </div>
              )}
              
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center text-white text-sm font-medium">
                <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">{aulaAtual.tempoAtual} / {aulaAtual.duracao}</div>
                <div className="flex gap-4">
                  <Settings className="w-5 h-5 cursor-pointer hover:text-[#ff6f2e]" />
                  <Maximize className="w-5 h-5 cursor-pointer hover:text-[#ff6f2e]" />
                </div>
              </div>
            </div>

            {/* Recursos */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold tracking-tight text-[#1c1b1b]">Material de Apoio</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recursos.map((recurso, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl flex items-center gap-4 hover:shadow-lg transition-all group cursor-pointer border border-gray-200">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${recurso.cor}15` }}>
                      <recurso.icone className="w-6 h-6" style={{ color: recurso.cor }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#1c1b1b]">{recurso.nome}</p>
                      <p className="text-xs text-gray-500">{recurso.tipo} • {recurso.tamanho}</p>
                    </div>
                    <Download className="w-5 h-5 text-gray-400 group-hover:text-[#ff6f2e] transition-colors" />
                  </div>
                ))}
n              </div>
            </div>

            {/* Navegação */}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-8 gap-4 border-t border-gray-200">
              <button className="flex items-center gap-2 text-gray-500 font-bold hover:text-[#ff6f2e] transition-colors">
                <ArrowLeft className="w-5 h-5" /> Lição Anterior
              </button>
              <button className="w-full sm:w-auto px-10 py-4 rounded-full font-extrabold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 text-white"
                style={{ background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.coral} 100%)` }}>
                Próximo Passo <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* COLUNA DIREITA - LISTA DE LIÇÕES */}
          <div className="lg:col-span-4">
            <div className="bg-[#f6f3f2] rounded-[2rem] p-8 space-y-8 sticky top-28">
              
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold tracking-tight text-[#1c1b1b]">Conteúdo do Módulo</h2>
                <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: colors.yellow, color: colors.dark }}>Em curso</span>
              </div>

              <div className="space-y-3">
                {licoes.map((licao) => (
                  <div key={licao.id} className={`flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer ${
                    licao.ativa ? 'bg-white outline outline-2 shadow-md' : licao.completa ? 'bg-white shadow-sm' : 'bg-[#f6f3f2] opacity-60'
                  }`} style={licao.ativa ? { outlineColor: colors.orange } : {}}>
                    
                    <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      licao.completa ? 'text-white' : licao.ativa ? 'border-2' : 'border-2 border-gray-300'
                    }`} style={{
                      backgroundColor: licao.completa ? colors.orange : 'transparent',
                      borderColor: licao.ativa ? colors.orange : licao.bloqueada ? '#d4d4d4' : 'transparent'
                    }}>
                      {licao.completa && <Check className="w-4 h-4" />}
                      {licao.ativa && <Play className="w-4 h-4" style={{ color: colors.orange }} />}
                      {licao.bloqueada && <Lock className="w-4 h-4 text-gray-400" />}
                    </div>

                    <div className="flex-1">
                      <p className={`text-sm font-bold ${licao.ativa ? 'text-[#ff6f2e]' : licao.completa ? 'text-[#1c1b1b]' : 'text-gray-500'}`}>
                        {String(licao.id).padStart(2, '0')}. {licao.titulo}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3" /> {licao.duracao}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Widget de Ajuda */}
              <div className="p-6 rounded-2xl border" style={{ backgroundColor: `${colors.orange}08`, borderColor: `${colors.orange}20` }}>
                <p className="text-sm font-bold mb-2" style={{ color: colors.orange }}>Precisas de ajuda?</p>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">Acede à comunidade de Slack para resolver dúvidas técnicas.</p>
                <button className="w-full py-2 rounded-lg text-xs font-bold text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: colors.dark }}>
                  Abrir Comunidade
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#f6f3f2] py-12 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-start px-8 max-w-screen-2xl mx-auto gap-8">
          <div className="space-y-4">
            <div className="text-lg font-bold" style={{ color: colors.orange }}>Bora Lá</div>
            <p className="text-gray-500 text-sm max-w-xs">A empoderar a próxima geração de profissionais através da Inteligência Artificial prática.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.orange }}>Plataforma</p>
              <ul className="space-y-2 text-sm text-gray-500 font-medium">
                <li><a href="#" className="hover:text-[#cb1a74] transition-colors">Centro de Ajuda</a></li>
                <li><a href="#" className="hover:text-[#cb1a74] transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-[#cb1a74] transition-colors">Contacto</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.orange }}>Legal</p>
              <ul className="space-y-2 text-sm text-gray-500 font-medium">
                <li><a href="#" className="hover:text-[#cb1a74] transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-[#cb1a74] transition-colors">Termos de Serviço</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="max-w-screen-2xl mx-auto px-8 mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">© 2024 Bora Lá. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
