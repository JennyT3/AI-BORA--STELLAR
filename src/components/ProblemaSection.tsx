import { motion } from 'motion/react';
import { MapPin, Globe, Smartphone } from 'lucide-react';
import { SectionBadge } from './SectionBadge';
import { useSectionInView } from '../hooks/useSectionInView';

const problems = [
  {
    icon: <MapPin className="w-8 h-8 text-fuchsia-brand" />,
    title: "Invisível no Google Maps",
    desc: "82% dos clientes procuram negócios locais no telemóvel antes de sair de casa.",
    solution: "Colocamos o seu negócio no topo do Google Maps."
  },
  {
    icon: <Globe className="w-8 h-8 text-fuchsia-brand" />,
    title: "Sem presença profissional",
    desc: "Um email @gmail afasta clientes. Sem site, o negócio parece amador.",
    solution: "Criamos o seu site profissional e email com domínio."
  },
  {
    icon: <Smartphone className="w-8 h-8 text-fuchsia-brand" />,
    title: "Redes sociais paradas",
    desc: "Uma página sem publicações parece que o negócio fechou.",
    solution: "Gerimos as suas redes com conteúdo que atrai clientes locais."
  }
];

export function ProblemaSection() {
  const { ref, isInView } = useSectionInView();

  return (
    <section id="problema" className="py-24 bg-bg relative overflow-hidden" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <SectionBadge text="O PROBLEMA" />
          <motion.h2 
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 mb-4 text-text-primary"
          >
            O seu negócio é <span className="underline-brand">excelente</span>.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl md:text-2xl font-bold grad-text"
          >
            Mas alguém o encontra no telemóvel?
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {problems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group h-[280px] perspective-1000"
            >
              <div className="relative w-full h-full transition-all duration-500 preserve-3d group-hover:rotate-y-180">
                
                {/* Front */}
                <div className="absolute inset-0 backface-hidden card p-8 flex flex-col items-center text-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-fuchsia-brand/10 flex items-center justify-center mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-3">{item.title}</h3>
                  <p className="text-text-secondary leading-relaxed font-medium">{item.desc}</p>
                </div>

                {/* Back */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 card bg-grad p-8 flex flex-col items-center text-center justify-center border-none">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-6">
                    <div className="text-white">{item.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">A Solução</h3>
                  <p className="text-white/90 leading-relaxed font-medium">{item.solution}</p>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
