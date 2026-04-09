import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "How long does it take to build my website?",
    answer: "Usually between 2 and 3 weeks. It depends on complexity and how quickly you send content (copy and images)."
  },
  {
    question: "Do I need to pay anything upfront?",
    answer: "No. You only pay when the site is live and working. No risk on your side."
  },
  {
    question: "What if I know nothing about technology?",
    answer: "Perfect — we handle everything. You do not need to code or manage servers. We explain everything in plain language."
  },
  {
    question: "Does the site belong to me?",
    answer: "Yes, fully. The domain is yours, the site is yours. We do not keep any of it."
  },
  {
    question: "After launch, will I need help?",
    answer: "We include 30 days of free support. After that you can choose a maintenance plan or reach out when you need us."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 bg-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
            Frequently asked questions
          </h2>
          <p className="text-sm text-text-secondary">
            Answers to the most common questions
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
