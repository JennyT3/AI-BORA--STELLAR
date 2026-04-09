import { Link } from 'wouter';
import { Mail, Phone, Menu, GraduationCap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-surface2 border-t border-black/5 pt-12 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

          {/* Logo + Texto AI BORA + Descrição */}
          <div className="space-y-4">
            <Link href="/">
              <div className="cursor-pointer flex items-center gap-3">
                <img src="/logo.png" alt="" className="h-8 w-auto" />
                <span className="text-lg font-black text-text-primary tracking-tight">AI BORA</span>
              </div>
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed font-normal line-clamp-3">
              Ajudamos negócios locais em Portugal a crescerem com Inteligência Artificial. Sem jargões, apenas resultados reais.
            </p>
            {/* Redes Sociais */}
            <div className="flex items-center gap-3 pt-1">
              <a href="https://instagram.com/aibora.pt" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 rounded-full bg-white border border-black/10 flex items-center justify-center hover:border-fuchsia-brand hover:text-fuchsia-brand transition-colors text-text-secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="https://facebook.com/aibora.ptt" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-full bg-white border border-black/10 flex items-center justify-center hover:border-fuchsia-brand hover:text-fuchsia-brand transition-colors text-text-secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/aibora-pt" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-8 h-8 rounded-full bg-white border border-black/10 flex items-center justify-center hover:border-fuchsia-brand hover:text-fuchsia-brand transition-colors text-text-secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="font-bold text-text-primary mb-4 uppercase tracking-wider text-xs">Explorar</h4>
            <ul className="space-y-2">
              <li><Link href="/servicos" className="text-sm font-medium text-text-secondary hover:text-fuchsia-brand transition-colors">Serviços</Link></li>
              <li><Link href="/prompts" className="text-sm font-medium text-text-secondary hover:text-fuchsia-brand transition-colors">Prompts AI</Link></li>
              <li><a href="/#quem-somos" className="text-sm font-medium text-text-secondary hover:text-fuchsia-brand transition-colors">Quem Somos</a></li>
              <li><a href="/#processo" className="text-sm font-medium text-text-secondary hover:text-fuchsia-brand transition-colors">Como Funciona</a></li>
            </ul>
          </div>

          {/* Academia - BORA LÁ ESTUDAR */}
          <div>
            <h4 className="font-bold text-text-primary mb-4 uppercase tracking-wider text-xs">Educação</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/academia" className="flex items-center gap-2 text-sm font-black text-[#F22283] hover:text-[#F25C05] transition-colors">
                  <GraduationCap size={16} /> Bora Lá Estudar
                </Link>
              </li>
              <li><Link href="/academia/trilhas" className="text-sm font-medium text-text-secondary hover:text-fuchsia-brand transition-colors">Trilhas de IA</Link></li>
              <li><Link href="/academia/certificados" className="text-sm font-medium text-text-secondary hover:text-fuchsia-brand transition-colors">Certificados</Link></li>
              <li><Link href="/academia/consultoria" className="text-sm font-medium text-text-secondary hover:text-fuchsia-brand transition-colors">Ser Professor</Link></li>
            </ul>
          </div>

          {/* Contactos */}
          <div>
            <h4 className="font-bold text-text-primary mb-4 uppercase tracking-wider text-xs">Contactos</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm font-medium text-text-secondary">
                <Mail size={16} className="text-fuchsia-brand shrink-0 mt-0.5" />
                <a href="mailto:geral@aibora.pt" className="hover:text-fuchsia-brand transition-colors">geral@aibora.pt</a>
              </li>
              <li className="flex items-start gap-2 text-sm font-medium text-text-secondary">
                <Phone size={16} className="text-fuchsia-brand shrink-0 mt-0.5" />
                <a href="tel:+351936021747" className="hover:text-fuchsia-brand transition-colors">+351 936 021 747</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="text-center pt-8 border-t border-black/5">
          <p className="text-xs text-text-muted font-medium">
            © {new Date().getFullYear()} AI BORA · Todos os direitos reservados · Feito com ❤️ pela equipa AI BORA
          </p>
        </div>

      </div>
    </footer>
  );
}
