import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Loader2 } from 'lucide-react';
import { useSectionInView } from '../hooks/useSectionInView';
import { WHATSAPP_LINK } from '../lib/constants';

const WaIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// URL DE TU GOOGLE APPS SCRIPT - REEMPLAZA ESTO
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/TU_URL_AQUI/exec';

export function CTAFooterSection() {
  const { ref, isInView } = useSectionInView();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    nome: '',
    nomeNegocio: '',
    telefone: '',
    email: '',
    mensagem: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          origem: 'Formulario Website AIBORA'
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors' // Importante para Google Apps Script
      });

      setSubmitStatus('success');
      setFormData({ nome: '', nomeNegocio: '', telefone: '', email: '', mensagem: '' });
      
      // Resetear después de 3 segundos
      setTimeout(() => setSubmitStatus('idle'), 3000);
      
    } catch (error) {
      console.error('Erro ao enviar:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  return (
    <section id="contacto" className="py-24 bg-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="card rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden bg-white shadow-xl border border-black/5"
        >
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[300px] bg-fuchsia-brand/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="text-center mb-16 relative z-10">
            <h2 className="text-text-primary mb-2">Pronto para começar?</h2>
            <h2 className="text-fuchsia-brand mb-6">Fale connosco hoje.</h2>
            <p className="text-lg text-text-secondary font-medium">Resposta garantida em menos de 24 horas.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 relative z-10">
            
            {/* Left Column - WhatsApp & Trust */}
            <div className="flex flex-col justify-center">
              <a 
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[#25D366]/10 border border-[#25D366]/20 rounded-2xl p-6 flex items-center gap-6 mb-10 hover:bg-[#25D366]/20 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <div className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] group-hover:scale-110 transition-transform duration-300">
                  <WaIcon size={32} />
                </div>
                <div>
                  <div className="font-bold text-xl text-text-primary mb-1">Fale directamente no WhatsApp</div>
                  <div className="text-[#25D366] font-bold">Resposta em minutos</div>
                </div>
              </a>

              <ul className="space-y-5">
                {[
                  "Sem compromisso — conversa gratuita",
                  "Resposta em menos de 24 horas",
                  "Empresa portuguesa, suporte em português",
                  "Pagamento só quando estiver online"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-text-secondary font-medium">
                    <div className="w-6 h-6 rounded-full bg-surface2 border border-black/5 flex items-center justify-center shrink-0">
                      <Check size={14} className="text-fuchsia-brand" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column - Form */}
            <div className="bg-surface2 border border-black/5 rounded-3xl p-8">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="nome" className="block text-sm font-bold text-text-primary mb-2">Nome <span className="text-fuchsia-brand">*</span></label>
                  <input 
                    type="text" 
                    id="nome" 
                    required
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="O seu nome"
                    className="w-full bg-white border border-black/10 rounded-xl px-4 py-3.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-fuchsia-brand focus:ring-1 focus:ring-fuchsia-brand transition-colors shadow-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="nomeNegocio" className="block text-sm font-bold text-text-primary mb-2">Nome do Negócio <span className="text-fuchsia-brand">*</span></label>
                  <input 
                    type="text" 
                    id="nomeNegocio" 
                    required
                    value={formData.nomeNegocio}
                    onChange={handleChange}
                    placeholder="Ex: Padaria do Bairro"
                    className="w-full bg-white border border-black/10 rounded-xl px-4 py-3.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-fuchsia-brand focus:ring-1 focus:ring-fuchsia-brand transition-colors shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="telefone" className="block text-sm font-bold text-text-primary mb-2">Telemóvel <span className="text-fuchsia-brand">*</span></label>
                    <input 
                      type="tel" 
                      id="telefone" 
                      required
                      value={formData.telefone}
                      onChange={handleChange}
                      placeholder="+351 9XX XXX XXX"
                      className="w-full bg-white border border-black/10 rounded-xl px-4 py-3.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-fuchsia-brand focus:ring-1 focus:ring-fuchsia-brand transition-colors shadow-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-text-primary mb-2">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@exemplo.pt"
                      className="w-full bg-white border border-black/10 rounded-xl px-4 py-3.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-fuchsia-brand focus:ring-1 focus:ring-fuchsia-brand transition-colors shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="mensagem" className="block text-sm font-bold text-text-primary mb-2">Mensagem</label>
                  <textarea 
                    id="mensagem" 
                    rows={3}
                    value={formData.mensagem}
                    onChange={handleChange}
                    placeholder="Conta-nos um pouco sobre o teu negócio..."
                    className="w-full bg-white border border-black/10 rounded-xl px-4 py-3.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-fuchsia-brand focus:ring-1 focus:ring-fuchsia-brand transition-colors resize-none shadow-sm"
                  />
                </div>

                {/* Mensaje de estado */}
                {submitStatus === 'success' && (
                  <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                    ✅ Mensagem enviada com sucesso! Entraremos em contacto em breve.
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                    ❌ Erro ao enviar. Por favor, tente novamente ou contacte-nos pelo WhatsApp.
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 20px rgba(242,34,131,0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-grad text-white font-bold text-lg h-14 rounded-full flex items-center justify-center gap-2 mt-4 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      A enviar...
                    </>
                  ) : (
                    <>Enviar mensagem →</>
                  )}
                </motion.button>
              </form>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
