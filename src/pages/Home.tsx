import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { ComoFuncionaSection } from '../components/ComoFuncionaSection';
import { NossoTrabalhoSection } from '../components/NossoTrabalhoSection';
import GestaoSection from '../components/GestaoSection';
import { ServicosSection } from '../components/ServicosSection';
import { QuemSomosSection } from '../components/QuemSomosSection';
import { FAQSection } from '../components/FAQSection';
import { CTAFooterSection } from '../components/CTAFooterSection';
import { FloatingWhatsApp } from '../components/FloatingWhatsApp';
import { Footer } from '../components/Footer';

export function Home() {
  const [showPacks, setShowPacks] = useState(false);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main>
        <HeroSection />
        <ComoFuncionaSection />
        <NossoTrabalhoSection />
        <GestaoSection />

        <div className="flex justify-center py-16 bg-bg">
          <button
            onClick={() => setShowPacks(!showPacks)}
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: '1.5px solid #F22283',
              color: '#F22283',
              background: 'transparent',
              padding: '0 2rem',
              height: '48px',
              borderRadius: '100px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {showPacks ? "Fechar promoções" : "Ver packs — pagamento único"}
          </button>
        </div>

        {showPacks && <ServicosSection />}

        <QuemSomosSection />
        <FAQSection />
        <CTAFooterSection />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
