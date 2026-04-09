import { motion } from 'motion/react';
import { useSectionInView } from '../hooks/useSectionInView';

export function NossoTrabalhoSection() {
  const { ref, isInView } = useSectionInView();

  return (
    <section id="trabalho" className="py-24 bg-bg overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>

        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary leading-tight mb-4">
            Real results. Always.
          </h2>
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: 60 } : { width: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ 
              height: '3px', 
              backgroundColor: '#F25C05', 
              borderRadius: '2px',
              margin: '0 auto'
            }}
          />
          <p className="text-sm text-text-secondary mt-4 max-w-md mx-auto">
            Real work with real clients. Every project with measurable impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative aspect-square overflow-hidden rounded-lg"
          >
            <img src="/antes.webp" alt="Before — visual identity redesign project" className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative aspect-square overflow-hidden rounded-lg"
          >
            <img src="/depois.webp" alt="After — visual identity redesign project" className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative aspect-square overflow-hidden rounded-lg"
          >
            <img src="/estudio.webp" alt="Studio — AI BORA creative production space" className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative aspect-square overflow-hidden rounded-lg"
          >
            <img src="/foto-criativa.webp" alt="Creative photography — visual content production" className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative aspect-square overflow-hidden rounded-lg"
          >
            <img src="/mopack.webp" alt="Packaging — packaging design for a local brand" className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="relative aspect-square overflow-hidden rounded-lg"
          >
            <img src="/branding.webp" alt="Branding — full visual identity for a business" className="w-full h-full object-cover" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
