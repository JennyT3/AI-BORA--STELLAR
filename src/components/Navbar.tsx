import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'wouter';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    if (window.location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
        isScrolled ? 'shadow-[0_1px_12px_rgba(0,0,0,0.06)] border-b border-black/5 py-3' : 'py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link href="/">
          <div className="cursor-pointer flex items-center">
            <img src="/logo.png" alt="AI BORA" className="h-10 w-auto" />
            <span style={{fontFamily:"Montserrat,sans-serif",fontWeight:900,fontSize:18,color:"#1A1A1A",marginLeft:8}}>AI BORA</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/servicos" className="text-sm font-bold text-text-primary hover:text-[#cb1a74] transition-colors">Serviços</Link>
          <button onClick={() => scrollToSection('quem-somos')} className="text-sm font-bold text-text-primary hover:text-[#cb1a74] transition-colors">Quem Somos</button>
          <button onClick={() => scrollToSection('processo')} className="text-sm font-bold text-text-primary hover:text-[#cb1a74] transition-colors">Como Funciona</button>
          <button onClick={() => scrollToSection('faq')} className="text-sm font-bold text-text-primary hover:text-[#cb1a74] transition-colors">FAQ</button>
          <Link href="/prompts" className="text-sm font-bold text-[#ff6f2e] hover:text-[#cb1a74] transition-colors">Prompts AI</Link>
          <motion.button
            onClick={() => scrollToSection('contacto')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="text-white font-bold px-6 py-2.5 rounded-full shadow-[0_4px_14px_rgba(255,111,46,0.3)] text-sm"
            style={{ background: 'linear-gradient(135deg, #ff6f2e 0%, #cb1a74 100%)' }}
          >
            Consultoria
          </motion.button>
        </div>

        <button
          className="md:hidden text-text-primary p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed inset-0 top-[64px] bg-white z-40 flex flex-col items-center pt-12 gap-8 md:hidden"
        >
          <Link href="/servicos" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold text-text-primary hover:text-[#cb1a74]">Serviços</Link>
          <button onClick={() => scrollToSection('quem-somos')} className="text-xl font-bold text-text-primary hover:text-[#cb1a74]">Quem Somos</button>
          <button onClick={() => scrollToSection('processo')} className="text-xl font-bold text-text-primary hover:text-[#cb1a74]">Como Funciona</button>
          <button onClick={() => scrollToSection('faq')} className="text-xl font-bold text-text-primary hover:text-[#cb1a74]">FAQ</button>
          <Link href="/prompts" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold text-[#ff6f2e]">Prompts AI</Link>
          <button
            onClick={() => scrollToSection('contacto')}
            className="text-white font-bold px-8 py-4 rounded-full text-lg shadow-lg"
            style={{ background: 'linear-gradient(135deg, #ff6f2e 0%, #cb1a74 100%)' }}
          >
            Consultoria
          </button>
        </motion.div>
      )}
    </motion.nav>
  );
}
