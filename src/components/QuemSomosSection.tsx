import { motion } from 'motion/react';
import { SectionBadge } from './SectionBadge';
import { useSectionInView } from '../hooks/useSectionInView';

export function QuemSomosSection() {
  const { ref, isInView } = useSectionInView();

  return (
    <section id="quem-somos" className="py-24 bg-bg overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>

        <div className="text-center max-w-2xl mx-auto mb-16">
          <SectionBadge text="QUEM SOMOS" />
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, ease: [0.22,1,0.36,1] }}
            className="mt-6 text-text-primary"
          >
            A equipa que coloca o seu<br />negócio no mapa.
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22,1,0.36,1] }}
            className="space-y-5 text-base text-text-secondary leading-relaxed font-medium"
          >
            <p>
              A <strong>AI BORA</strong> nasceu com uma missão simples:<br />
              descomplicar o marketing digital para negócios locais em Portugal.
            </p>
            <p>
              Gerir uma padaria, uma oficina ou um cabeleireiro<br />
              já dá muito trabalho. Não precisa de se preocupar<br />
              com o Google ou as redes sociais.
            </p>
            <p>
              Nós tratamos de tudo — desde o site até aparecer<br />
              no Google Maps quando alguém procura perto de si.<br />
              Sem jargões. Sem complicações. Resultados reais.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 24 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22,1,0.36,1] }}
            className="relative rounded-2xl overflow-hidden aspect-video shadow-xl"
          >
            <img
              src="/quem-somos.jpg"
              alt="Equipa AI BORA"
              className="w-full h-full object-cover" referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-brand/20 to-orange-brand/20 mix-blend-overlay" />
          </motion.div>
        </div>

      </div>
    </section>
  );
}
