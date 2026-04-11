import { HeroSection } from '../components/HeroSection';
import { StellarTransactionMarquee } from '../components/StellarTransactionMarquee';
import { PaymentFlowsSection } from '../components/PaymentFlowsSection';
import { ServicesSection } from '../components/ServicesSection';
import { ComoFuncionaSection } from '../components/ComoFuncionaSection';
import { QuemSomosSection } from '../components/QuemSomosSection';
import { ColaboraConNosotrosSection } from '../components/ColaboraConNosotrosSection';
import { CTAFooterSection } from '../components/CTAFooterSection';
import { Footer } from '../components/Footer';

export function Home() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
      <main>
        {/* Dark: Hero */}
        <HeroSection />
        
        {/* Green wave effect */}
        <StellarTransactionMarquee />
        
        {/* Payment Flows */}
        <PaymentFlowsSection />
        
        {/* Dark: How it works */}
        <ComoFuncionaSection />
        
        {/* Light: Services */}
        <ServicesSection />
        
        {/* Light: Team */}
        <QuemSomosSection />
        
        {/* Dark: Collaborate */}
        <ColaboraConNosotrosSection />
        
        {/* Light: CTA */}
        <CTAFooterSection />
      </main>
      <Footer />
    </div>
  );
}