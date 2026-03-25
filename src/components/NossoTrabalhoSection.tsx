import { motion } from 'motion/react';
import { SectionBadge } from './SectionBadge';
import { useSectionInView } from '../hooks/useSectionInView';

const cases = [
  { title: "Antes", category: "Outil Ferretaria", img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80" },
  { title: "Depois", category: "Outil Ferretaria", img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80" },
  { title: "Estúdio Durán", category: "Fotografia e vídeo", img: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&q=80" },
  { title: "Fotografia criativa", category: "Conteúdo visual", img: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&q=80" },
  { title: "Design de produto", category: "Mopack", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80" },
  { title: "Branding e mockup", category: "Identidade visual", img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80" },
];

export function NossoTrabalhoSection() {
  const { ref, isInView } = useSectionInView();

  return (
    <section id="trabalho" className="py-24 bg-surface2">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>

        <div className="text-center max-w-2xl mx-auto mb-16">
          <SectionBadge text="O NOSSO TRABALHO" />
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, ease: [0.22,1,0.36,1] }}
            className="mt-6 mb-4 text-text-primary"
          >
            Resultados reais.{' '}
            <span className="underline-brand" style={{ textDecorationColor: '#F25C05' }}>Sempre.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22,1,0.36,1] }}
            className="text-text-secondary font-medium"
          >
            Trabalhos reais com clientes reais.<br />
            Cada projecto com impacto mensurável.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22,1,0.36,1] }}
              className="group relative aspect-[4/3] rounded-[1.25rem] overflow-hidden bg-surface shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <img
                src={item.img}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
               
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <p className="text-white font-bold text-sm uppercase tracking-wide">{item.category}</p>
                <p className="text-white/80 font-medium text-sm">{item.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
