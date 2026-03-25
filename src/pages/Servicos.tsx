import { Navbar } from '../components/Navbar';
import { ServicosSection } from '../components/ServicosSection';
import GestaoSection from '../components/GestaoSection';
import { CTAFooterSection } from '../components/CTAFooterSection';
import { FloatingWhatsApp } from '../components/FloatingWhatsApp';
import { Footer } from '../components/Footer';

export function Servicos() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="pt-20">
        <ServicosSection />
        <GestaoSection />
        <CTAFooterSection />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
