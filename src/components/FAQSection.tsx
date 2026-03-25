import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { SectionBadge } from './SectionBadge';
import { useSectionInView } from '../hooks/useSectionInView';

const faqs = [
  {
    q: "Não percebo nada de tecnologia. Consigo mesmo assim?",
    a: "Sim, é precisamente para si que trabalhamos. Não precisa de saber nada — nós tratamos de tudo e explicamos em linguagem simples. Se souber usar o WhatsApp, consegue trabalhar connosco."
  },
  {
    q: "Já tenho um Facebook. Não chega?",
    a: "O Facebook é um bom começo, mas não substitui o Google Maps, um site próprio ou um email profissional. A maioria dos clientes procura no Google — e se não aparecer lá, perde oportunidades todos os dias."
  },
  {
    q: "Quanto tempo demora até estar tudo pronto?",
    a: "Em média 2 a 3 semanas para o Pack Essencial, 3 a 4 semanas para os outros packs. Começamos logo após a primeira conversa."
  },
  {
    q: "Posso alterar o site ou as redes depois?",
    a: "Sim. Todos os packs incluem um período de suporte para ajustes. No Pack Total as actualizações são ilimitadas. Nunca fica dependente de nós para mudanças simples."
  },
  {
    q: "Como se faz o pagamento?",
    a: "Aceitamos transferência bancária, MB Way e cartão de crédito. O pagamento é feito em duas partes: metade no início, metade quando está tudo online. Sem surpresas."
  },
  {
    q: "Os packs têm mensalidades?",
    a: "Não. Os packs de Setup são pagamento único — paga uma vez e é seu. Se quiser gestão contínua, temos planos mensais separados. Mas nunca é obrigado."
  }
];

export function FAQSection() {
  const { ref, isInView } = useSectionInView();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-surface2">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        
        <div className="text-center mb-16">
          <SectionBadge text="DÚVIDAS FREQUENTES" />
          <motion.h2 
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-text-primary"
          >
            Perguntas frequentes
          </motion.h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="card rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface2 rounded-2xl"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-lg text-text-primary pr-8">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      isOpen ? 'bg-grad text-white' : 'bg-surface2 text-text-muted border border-black/5'
                    }`}
                  >
                    <Plus size={18} strokeWidth={isOpen ? 3 : 2} />
                  </motion.div>
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-text-secondary leading-relaxed font-medium">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
