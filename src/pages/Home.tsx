import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { ComoFuncionaSection } from '../components/ComoFuncionaSection';
import { NossoTrabalhoSection } from '../components/NossoTrabalhoSection';
import { QuemSomosSection } from '../components/QuemSomosSection';
import { FAQSection } from '../components/FAQSection';
import { CTAFooterSection } from '../components/CTAFooterSection';
import { FloatingWhatsApp } from '../components/FloatingWhatsApp';
import { Footer } from '../components/Footer';

export function Home() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main>
        <HeroSection />
        <ComoFuncionaSection />
        <NossoTrabalhoSection />
        <section style={{ backgroundColor: "#F5F2F0", padding: "64px 16px", textAlign: "center" }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <div style={{ width: 36, height: 3, backgroundColor: "#F25C05", margin: "0 auto 16px", borderRadius: 2 }} />
            <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: "clamp(20px, 3.5vw, 30px)", color: "#1A1A1A", margin: "0 0 12px" }}>
              O que precisas para o teu negocio?
            </h2>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: "#4A4A4A", margin: "0 0 28px", lineHeight: 1.5 }}>
              Escolhe os servicos, monta o teu pacote e pede orcamento sem compromisso.
            </p>
            <a href="/servicos#simulador" style={{ display: "inline-block", fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 14, backgroundColor: "#F22283", color: "#ffffff", padding: "14px 32px", borderRadius: 100, textDecoration: "none", boxShadow: "0 4px 16px rgba(242,34,131,0.3)" }}>
              Ver servicos
            </a>
          </div>
        </section>
        <QuemSomosSection />
        <FAQSection />
        <CTAFooterSection />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
