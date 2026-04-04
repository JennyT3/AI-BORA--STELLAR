import { Link } from 'wouter';
import { Mail, Phone } from 'lucide-react';

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
                <span className="text-lg font-semibold text-text-primary tracking-tight">AI BORA</span>
              </div>
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed font-normal line-clamp-2">
              Ajudamos negócios locais em Portugal a crescerem na internet. Sem jargões, apenas resultados reais.
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
              <a href="https://wa.me/351936021747" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-8 h-8 rounded-full bg-white border border-black/10 flex items-center justify-center hover:border-[#25D366] hover:text-[#25D366] transition-colors text-text-secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Rápidos - MÁS COMPACTO */}
          <div>
            <h4 className="font-semibold text-text-primary mb-3 uppercase tracking-wider text-xs">Links Rápidos</h4>
            <ul className="space-y-2">
              <li><Link href="/servicos" className="text-sm font-normal text-text-secondary hover:text-fuchsia-brand transition-colors">Serviços</Link></li>
              <li><a href="/#quem-somos" className="text-sm font-normal text-text-secondary hover:text-fuchsia-brand transition-colors">Quem Somos</a></li>
              <li><a href="/#processo" className="text-sm font-normal text-text-secondary hover:text-fuchsia-brand transition-colors">Como Funciona</a></li>
              <li><a href="/#faq" className="text-sm font-normal text-text-secondary hover:text-fuchsia-brand transition-colors">FAQ</a></li>
              <li><a href="/#contacto" className="text-sm font-normal text-text-secondary hover:text-fuchsia-brand transition-colors">Contacto</a></li>
            </ul>
          </div>

          {/* Legal - MÁS COMPACTO */}
          <div>
            <h4 className="font-semibold text-text-primary mb-3 uppercase tracking-wider text-xs">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacidade" className="text-sm font-normal text-text-secondary hover:text-fuchsia-brand transition-colors">Política de Privacidade</Link></li>
              <li><Link href="/termos" className="text-sm font-normal text-text-secondary hover:text-fuchsia-brand transition-colors">Termos de Serviço</Link></li>
            </ul>
          </div>

          {/* Contactos - MÁS COMPACTO */}
          <div>
            <h4 className="font-semibold text-text-primary mb-3 uppercase tracking-wider text-xs">Contactos</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm font-normal text-text-secondary">
                <Mail size={16} className="text-fuchsia-brand shrink-0 mt-0.5" />
                <a href="mailto:geral@aibora.pt" className="hover:text-fuchsia-brand transition-colors">geral@aibora.pt</a>
              </li>
              <li className="flex items-start gap-2 text-sm font-normal text-text-secondary">
                <Phone size={16} className="text-fuchsia-brand shrink-0 mt-0.5" />
                <a href="tel:+351936021747" className="hover:text-fuchsia-brand transition-colors">+351 936 021 747</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="text-center pt-6 border-t border-black/5">
          <p className="text-xs text-text-muted font-normal">
            © {new Date().getFullYear()} AI BORA · Todos os direitos reservados · Feito com ❤️ pela equipa AI BORA
          </p>
        </div>

      </div>
    </footer>
  );
}
