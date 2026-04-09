import { motion } from 'motion/react';
import { SectionBadge } from './SectionBadge';
import { useSectionInView } from '../hooks/useSectionInView';

const steps = [
  {
    num: "01",
    title: "Introductory call",
    desc: "We learn your business and what your customers need."
  },
  {
    num: "02",
    title: "Digital diagnosis",
    desc: "We audit your current presence and define the plan."
  },
  {
    num: "03",
    title: "Fast execution",
    desc: "We implement everything. No heavy lifting on your side."
  },
  {
    num: "04",
    title: "Real results",
    desc: "Monitoring and monthly tweaks included."
  }
];

export function ComoFuncionaSection() {
  const { ref, isInView } = useSectionInView();

  return (
    <section id="processo" className="py-24 bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <SectionBadge text="HOW IT WORKS" />
          <motion.h2 
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6"
          >
            From first contact to <span className="underline-gradient">live</span>
          </motion.h2>
        </div>

        <div className="relative mt-20">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-7 left-[10%] right-[10%] h-[2px] bg-grad opacity-30" />

          <div className="grid lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center lg:items-start text-center lg:text-left"
              >
                <div className="w-14 h-14 rounded-full bg-grad flex items-center justify-center mb-6 shadow-md">
                  <span className="font-black text-xl text-white">{step.num}</span>
                </div>
                <h3 className="font-bold text-xl text-text-primary mb-3">{step.title}</h3>
                <p className="text-text-secondary leading-relaxed max-w-[280px] font-medium">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
