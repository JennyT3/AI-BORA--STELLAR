import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'motion/react';
import { Building2, ShoppingCart, Briefcase, ArrowRight } from 'lucide-react';

export default function SelectionPage() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelection = async (type: 'company' | 'service' | 'work') => {
    setLoading(type);
    
    setTimeout(() => {
      switch (type) {
        case 'company':
          localStorage.setItem('aibora_authenticated', 'true');
          localStorage.setItem('aibora_role', 'admin');
          setLocation('/admin');
          break;
        case 'service':
          setLocation('/servicos');
          break;
        case 'work':
          localStorage.setItem('aibora_authenticated', 'true');
          localStorage.setItem('aibora_role', 'vendedor');
          setLocation('/vendas');
          break;
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <span style={{ 
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            fontSize: 14,
            color: '#F25C05',
            letterSpacing: '0.3em',
            textTransform: 'uppercase'
          }}>
            AI BORA
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            color: '#FFFFFF',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            lineHeight: 1.2,
            marginBottom: 12
          }}
        >
          What would you like to do?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '1rem',
            marginBottom: 40
          }}
        >
          Select one option to continue
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <button
            onClick={() => handleSelection('company')}
            disabled={loading !== null}
            className="w-full py-6 px-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-2xl flex items-center justify-between hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-lg shadow-orange-500/25 disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold">It's for my Company</div>
                <div className="text-orange-100 text-sm">Create proposals and manage clients</div>
              </div>
            </div>
            {loading === 'company' ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={() => handleSelection('service')}
            disabled={loading !== null}
            className="w-full py-6 px-8 bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 text-white font-bold rounded-2xl flex items-center justify-between hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-lg shadow-fuchsia-500/25 disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <ShoppingCart className="w-7 h-7" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold">I want to Request a Service</div>
                <div className="text-fuchsia-100 text-sm">Browse and request our services</div>
              </div>
            </div>
            {loading === 'service' ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={() => handleSelection('work')}
            disabled={loading !== null}
            className="w-full py-6 px-8 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold rounded-2xl flex items-center justify-between hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-lg shadow-cyan-500/25 disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Briefcase className="w-7 h-7" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold">I want to Work</div>
                <div className="text-cyan-100 text-sm">Join our team as a collaborator</div>
              </div>
            </div>
            {loading === 'work' ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-6 h-6" />
            )}
          </button>
        </motion.div>

        <motion.a
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          href="/"
          className="mt-8 inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          ← Back to Home
        </motion.a>
      </motion.div>
    </div>
  );
}