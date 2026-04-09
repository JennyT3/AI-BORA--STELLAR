import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Loader2 } from 'lucide-react';
import { useSectionInView } from '../hooks/useSectionInView';
import { WHATSAPP_LINK, GOOGLE_SCRIPT_URL } from '../lib/constants';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { createContacto } from '../services/firebase';
import { sendMensagemConfirmacao } from '../services/emailService';

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
      // Save to Firestore
      await createContacto({
        nome: formData.nome,
        negocio: formData.nomeNegocio,
        telemovel: formData.telefone,
        email: formData.email,
        mensagem: formData.mensagem,
        origem: 'Home',
        tipo: 'contacto',
        status: 'pendente',
      });

      // Send confirmation email if email provided
      if (formData.email) {
        try {
          await sendMensagemConfirmacao(formData.email, formData.nome);
        } catch (emailErr) {
          console.error('Erro ao enviar email de confirmação:', emailErr);
        }
      }

      // Google Script fallback removed as per user request

      setSubmitStatus('success');
      setFormData({ nome: '', nomeNegocio: '', telefone: '', email: '', mensagem: '' });
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
    <section id="contacto" className="py-12 bg-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="card rounded-[1.5rem] p-6 md:p-8 relative overflow-hidden bg-white shadow-lg border border-black/5"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] h-[150px] bg-fuchsia-brand/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 relative z-10 items-stretch">
            
            <div className="flex flex-col space-y-4">
              <div className="text-center md:text-left">
                <h2 style={{fontSize:"clamp(18px, 2.5vw, 24px)",fontWeight:900,lineHeight:1.2,marginBottom:"8px",maxWidth:"220px"}}>Pronto para começar?<br />  <span className="text-fuchsia-brand">Fale connosco hoje.</span></h2>
                <p className="text-xs text-text-secondary font-medium">Resposta em menos de 24 horas.</p>
              </div>

              <a 
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[#25D366]/10 border border-[#25D366]/20 rounded-xl p-4 flex items-center gap-3 hover:bg-[#25D366]/20 transition-colors duration-300"
              >
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_4px_12px_rgba(37,211,102,0.4)] group-hover:scale-110 transition-transform duration-300">
                  <WhatsAppIcon size={20} />
                </div>
                <div>
                  <div className="font-bold text-sm text-text-primary mb-0">Fale no WhatsApp</div>
                  <div className="text-[#25D366] text-xs font-bold">Resposta em minutos</div>
                </div>
              </a>

              <ul className="space-y-2">
                {[
                  "Sem compromisso — conversa gratuita",
                  "Resposta em menos de 24 horas",
                  "Empresa portuguesa, suporte em português",
                  "Pagamento só quando estiver online"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-text-secondary font-medium">
                    <div className="w-4 h-4 rounded-full bg-surface2 border border-black/5 flex items-center justify-center shrink-0">
                      <Check size={10} className="text-fuchsia-brand" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-surface2 border border-black/5 rounded-xl p-5">
              <form className="space-y-3" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="nome" className="block text-xs font-bold text-text-primary mb-1">Nome <span className="text-fuchsia-brand">*</span></label>
                    <input 
                      type="text" 
                      id="nome" 
                      required
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="O seu nome"
                      className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-fuchsia-brand focus:ring-1 focus:ring-fuchsia-brand transition-colors shadow-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="nomeNegocio" className="block text-xs font-bold text-text-primary mb-1">Negócio <span className="text-fuchsia-brand">*</span></label>
                    <input 
                      type="text" 
                      id="nomeNegocio" 
                      required
                      value={formData.nomeNegocio}
                      onChange={handleChange}
                      placeholder="Ex: Padaria"
                      className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-fuchsia-brand focus:ring-1 focus:ring-fuchsia-brand transition-colors shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="telefone" className="block text-xs font-bold text-text-primary mb-1">Telemóvel <span className="text-fuchsia-brand">*</span></label>
                    <input 
                      type="tel" 
                      id="telefone" 
                      required
                      value={formData.telefone}
                      onChange={handleChange}
                      placeholder="+351 9XX XXX XXX"
                      className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-fuchsia-brand focus:ring-1 focus:ring-fuchsia-brand transition-colors shadow-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-text-primary mb-1">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@exemplo.pt"
                      className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-fuchsia-brand focus:ring-1 focus:ring-fuchsia-brand transition-colors shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="mensagem" className="block text-xs font-bold text-text-primary mb-1">Mensagem</label>
                  <textarea 
                    id="mensagem" 
                    rows={2}
                    value={formData.mensagem}
                    onChange={handleChange}
                    placeholder="Conta-nos sobre o teu negócio..."
                    className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-fuchsia-brand focus:ring-1 focus:ring-fuchsia-brand transition-colors resize-none shadow-sm"
                  />
                </div>

                {submitStatus === 'success' && (
                  <div className="bg-green-100 border border-green-200 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                    ✅ Enviado com sucesso!
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="bg-red-100 border border-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                    ❌ Erro. Tente pelo WhatsApp.
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(242,34,131,0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-grad text-white font-bold text-xs h-9 rounded-full flex items-center justify-center gap-2 mt-1 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
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
