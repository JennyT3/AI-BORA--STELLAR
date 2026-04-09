import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Play, Award, Zap, Users, ArrowRight, Star, Quote, BookOpen, MessageSquare } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

const colors = {
  orange: '#ff6f2e',
  magenta: '#cb1a74', 
  coral: '#fb4a50',
  yellow: '#ede72e',
  dark: '#1c1b1b',
  light: '#fcf9f8'
};

const cursosEmDestaque = [
  {
    id: 1,
    titulo: 'Master prompts',
    descricao: 'Learn how to talk to models so you get polished results in seconds.',
    duracao: '2h 30min',
    aulas: 12,
    nivel: 'Beginner',
    categoria: 'AI',
    cor: colors.orange
  },
  {
    id: 2,
    titulo: 'Task automation',
    descricao: 'Zapier, Make and basic Python to offload repetitive work.',
    duracao: '3h 15min',
    aulas: 8,
    nivel: 'Intermediate',
    categoria: 'Automation',
    cor: colors.magenta
  },
  {
    id: 3,
    titulo: 'AI for creators',
    descricao: 'Generate video, audio and images with leading generative tools.',
    duracao: '4h',
    aulas: 15,
    nivel: 'Beginner',
    categoria: 'Creation',
    cor: colors.coral
  }
];

export default function Academia() {
  return (
    <div className="min-h-screen bg-bg" style={{ fontFamily: '"Montserrat", sans-serif' }}>
      <Navbar />

      <main className="pt-16">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-24 pb-32 px-8 bg-white">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-8 z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center px-4 py-1.5 rounded-full font-bold text-sm uppercase tracking-wider"
                style={{ backgroundColor: `${colors.orange}15`, color: colors.orange }}
              >
                <Zap className="w-4 h-4 mr-2" />
                Bora Lá — learn
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-[#1c1b1b]"
              >
                Learn fast.<br />
                Apply today.<br />
                <span className="text-[#ff6f2e]">Less theory, more action.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-600 max-w-xl leading-relaxed"
              >
                Master the tools reshaping how we work. Practical AI and automation focused on immediate outcomes for your business.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Link href="/academia/login">
                  <div className="px-10 py-5 rounded-2xl font-black text-lg text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer"
                    style={{ background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)` }}
                  >
                    <Play className="w-5 h-5 mr-2 fill-white" />
                    Start learning
                  </div>
                </Link>
                <Link href="/academia/trilhas">
                  <div className="px-10 py-5 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-lg hover:border-[#ff6f2e] hover:text-[#ff6f2e] transition-all flex items-center justify-center cursor-pointer">
                    Browse paths
                  </div>
                </Link>
              </motion.div>
            </div>

            <div className="flex-1 relative">
              <div className="absolute inset-0 rounded-full blur-3xl -z-10 transform translate-x-12 translate-y-12" style={{ backgroundColor: `${colors.orange}20` }}></div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                animate={{ opacity: 1, scale: 1, rotate: 2 }}
                transition={{ duration: 0.8 }}
                className="relative rounded-[40px] overflow-hidden shadow-2xl border-8 border-white"
              >
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=1000&fit=crop" 
                  alt="Learner using AI" 
                  className="w-full h-auto object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* BENTO GRID BENEFITS */}
        <section className="py-32 bg-[#fcf9f8] px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-black text-[#1c1b1b] mb-6">Why learn with us?</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">We focus on what moves the needle: your productivity and business growth.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 bg-white p-12 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${colors.orange}15` }}>
                  <Zap className="w-8 h-8" style={{ color: colors.orange }} />
                </div>
                <h3 className="text-3xl font-black mb-6 text-[#1c1b1b]">AI for the real world</h3>
                <p className="text-gray-600 text-xl leading-relaxed max-w-xl">
                  We do not teach you to debate AI in the abstract. We teach you to draft, design and analyse in minutes what used to take hours.
                </p>
              </div>

              <div className="bg-[#1c1b1b] p-12 rounded-[32px] text-white flex flex-col justify-between hover:scale-[1.02] transition-all shadow-2xl">
                <Award className="w-12 h-12 mb-8" style={{ color: colors.orange }} />
                <div>
                  <h3 className="text-2xl font-black mb-4">Official certificates</h3>
                  <p className="text-gray-400 leading-relaxed">Validate your skills with verifiable certificates you can share on LinkedIn.</p>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                <Users className="w-10 h-10 mb-6" style={{ color: colors.magenta }} />
                <h3 className="text-xl font-black mb-4">Active community</h3>
                <p className="text-gray-600">Learn alongside other founders and share your best automations.</p>
              </div>

              <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                <BookOpen className="w-10 h-10 mb-6" style={{ color: colors.coral }} />
                <h3 className="text-xl font-black mb-4">Guided learning paths</h3>
                <p className="text-gray-600">Structured journeys from zero to advanced—without filler.</p>
              </div>

              <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                <MessageSquare className="w-10 h-10 mb-6" style={{ color: colors.orange }} />
                <h3 className="text-xl font-black mb-4">Direct support</h3>
                <p className="text-gray-600">Stuck on something technical? Our specialists are here to help.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-32 px-8 bg-white">
          <div className="max-w-5xl mx-auto rounded-[48px] p-16 text-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${colors.dark} 0%, #333 100%)` }}>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8">Ready to level up?</h2>
              <p className="text-gray-400 text-xl mb-12 max-w-2xl mx-auto">Join hundreds of professionals already using AI to save time and grow revenue.</p>
              <Link href="/academia/login">
                <div className="inline-flex px-12 py-6 rounded-2xl font-black text-xl text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                  style={{ background: colors.orange }}
                >
                  Start with Bora Lá 🚀
                </div>
              </Link>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-magenta-500/10 blur-[100px] rounded-full"></div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
