import { HeroSection } from '../components/HeroSection';
import { StellarTransactionMarquee } from '../components/StellarTransactionMarquee';
import { PaymentFlowsSection } from '../components/PaymentFlowsSection';
import { ServicesSection } from '../components/ServicesSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { AboutUsSection } from '../components/AboutUsSection';
import { WorkWithUsSection } from '../components/CollaborateWithUsSection';
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
        <HowItWorksSection />
        
        {/* Light: Services */}
        <ServicesSection />
        
        {/* Light: Team */}
        <AboutUsSection />
        
        {/* Dark: Collaborate */}
        <WorkWithUsSection />
        
        {/* Light: CTA */}
        <CTAFooterSection />
      </main>
      <Footer />
    </div>
  );
}