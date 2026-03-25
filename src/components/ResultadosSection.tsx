import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { useEffect } from 'react';
import { SectionBadge } from './SectionBadge';
import { useSectionInView } from '../hooks/useSectionInView';

function AnimatedCounter({ from, to, duration = 1.8, suffix = "" }: { from: number, to: number, duration?: number, suffix?: string }) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest) + suffix);
  const { ref, isInView } = useSectionInView();

  useEffect(() => {
    if (isInView) {
      animate(count, to, { duration, ease: "easeOut" });
    }
  }, [count, isInView, to, duration]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export function ResultadosSection() {
  const { ref, isInView } = useSectionInView();

  return (
    <section id="resultados" className="py-24 bg-bg overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <SectionBadge text="RESULTADOS REAIS" />
          <motion.h2 
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-text-primary"
          >
            Negócios reais. Resultados que se vêem.
          </motion.h2>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="card p-8 text-center flex flex-col justify-center"
          >
            <span className="font-extrabold text-5xl text-fuchsia-brand mb-2 block">
              <AnimatedCounter from={0} to={12} suffix="+" />
            </span>
            <span className="text-text-secondary font-bold">Negócios já connosco</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="card p-8 text-center flex flex-col justify-center"
          >
            <span className="font-extrabold text-5xl text-orange-brand mb-2 block">
              <AnimatedCounter from={0} to={98} suffix="%" />
            </span>
            <span className="text-text-secondary font-bold">Clientes satisfeitos</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="card p-8 text-center flex flex-col justify-center"
          >
            <span className="font-extrabold text-5xl text-fuchsia-brand mb-2 block">
              3 sem.
            </span>
            <span className="text-text-secondary font-bold">Para estar online</span>
          </motion.div>
        </div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="card p-10 md:p-12 max-w-3xl mx-auto border-fuchsia-brand/20 relative"
        >
          <div className="text-orange-brand text-2xl tracking-widest mb-6">★★★★★</div>
          <p className="text-xl md:text-2xl text-text-primary font-medium leading-relaxed mb-10">
            "Não percebia nada de tecnologia e eles trataram de tudo. Em duas semanas já aparecia no Google Maps e as chamadas aumentaram logo."
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center text-text-primary font-bold text-lg border border-black/5">
              MR
            </div>
            <div>
              <div className="font-bold text-text-primary">Manuel Rodrigues</div>
              <div className="text-sm text-text-muted font-medium">Padaria Rodrigues, Braga</div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Marquee */}
      <div className="mt-24 relative flex overflow-x-hidden">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-bg to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-bg to-transparent z-10" />
        
        <motion.div
          animate={{ x: [0, '-50%'] }}
          transition={{ duration: 25, ease: 'linear', repeat: Infinity }}
          className="flex whitespace-nowrap items-center gap-16 px-8 opacity-40"
        >
          {/* Duplicate items for seamless loop */}
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-16">
              <span className="font-bold text-2xl text-text-muted">Padaria Central</span>
              <span className="w-2 h-2 rounded-full bg-text-muted/20" />
              <span className="font-bold text-2xl text-text-muted">Oficina do João</span>
              <span className="w-2 h-2 rounded-full bg-text-muted/20" />
              <span className="font-bold text-2xl text-text-muted">Café da Esquina</span>
              <span className="w-2 h-2 rounded-full bg-text-muted/20" />
              <span className="font-bold text-2xl text-text-muted">Cabeleireiro Maria</span>
              <span className="w-2 h-2 rounded-full bg-text-muted/20" />
              <span className="font-bold text-2xl text-text-muted">Restaurante O Pescador</span>
              <span className="w-2 h-2 rounded-full bg-text-muted/20" />
            </div>
          ))}
        </motion.div>
      </div>

    </section>
  );
}
