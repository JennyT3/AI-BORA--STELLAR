import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "Quanto tempo demora a criar o meu site?",
    answer: "Normalmente entre 2 a 3 semanas. Depende da complexidade e da rapidez com que nos envia o conteúdo (textos e imagens)."
  },
  {
    question: "Preciso de pagar alguma coisa antes?",
    answer: "Não. O pagamento só é feito quando o site estiver online e a funcionar. Sem riscos para si."
  },
  {
    question: "E se eu não perceber nada de tecnologia?",
    answer: "Perfeito! Nós tratamos de tudo. Não precisa de saber programar nem gerir servidores. Explicamos tudo de forma simples."
  },
  {
    question: "O site fica a meu nome?",
    answer: "Sim, totalmente. O domínio é seu, o site é seu. Não ficamos com nada."
  },
  {
    question: "E depois de ficar online, preciso de ajuda?",
    answer: "Oferecemos 30 dias de suporte gratuito. Depois pode escolher um plano de manutenção ou chamar-nos quando precisar."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 bg-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
            Perguntas frequentes
          </h2>
          <p className="text-sm text-text-secondary">
            Esclarecemos as dúvidas mais comuns
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="card rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="font-semibold text-sm text-text-primary pr-4">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown size={18} className="text-fuchsia-brand" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 text-sm text-text-secondary leading-relaxed border-t border-black/5 pt-3">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
