import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { FloatingWhatsApp } from '../components/FloatingWhatsApp';

export function Termos() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-fuchsia">
          <h1 className="font-extrabold text-4xl mb-8 text-text-primary">Terms of Service</h1>
          <p className="text-text-muted mb-6">Last updated: 24 March 2026</p>

          <h2 className="font-bold text-2xl mt-12 mb-4 text-text-primary">1. Acceptance of terms</h2>
          <p className="text-text-secondary mb-6">
            By accessing and using AI BORA services, you agree to comply with and be bound by these Terms of Service. If you do not agree with any part of these terms, you should not use our services.
          </p>

          <h2 className="font-bold text-2xl mt-12 mb-4 text-text-primary">2. Services provided</h2>
          <p className="text-text-secondary mb-6">
            AI BORA provides digital marketing services for local businesses, including website creation, social media management, local business profile optimisation, and online advertising campaigns, as detailed in our &quot;Packs&quot; and &quot;Management Plans&quot;.
          </p>

          <h2 className="font-bold text-2xl mt-12 mb-4 text-text-primary">3. Payments and invoicing</h2>
          <p className="text-text-secondary mb-6">
            &quot;Setup Packs&quot; are one-time payment services. Payment is generally split into two instalments: 50% at project start and 50% on final delivery, unless otherwise agreed. &quot;Management Plans&quot; are billed monthly. All prices shown are subject to VAT at the applicable legal rate.
          </p>

          <h2 className="font-bold text-2xl mt-12 mb-4 text-text-primary">4. Intellectual property</h2>
          <p className="text-text-secondary mb-6">
            After full payment, the client owns the rights to the website created and content produced specifically for their business. AI BORA reserves the right to feature completed work in its portfolio unless the client requests otherwise in writing.
          </p>

          <h2 className="font-bold text-2xl mt-12 mb-4 text-text-primary">5. Limitation of liability</h2>
          <p className="text-text-secondary mb-6">
            AI BORA strives to achieve the best possible results but cannot guarantee specific search engine rankings or an exact number of leads or sales, as these depend on external factors (algorithms, competition, and others).
          </p>

          <h2 className="font-bold text-2xl mt-12 mb-4 text-text-primary">6. Changes to terms</h2>
          <p className="text-text-secondary mb-6">
            We reserve the right to modify these Terms of Service at any time. Changes take effect immediately after publication on our website.
          </p>
        </div>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
