import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { FloatingWhatsApp } from '../components/FloatingWhatsApp';

export function Privacidade() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-fuchsia">
          <h1 className="font-extrabold text-4xl mb-8 text-text-primary">Privacy Policy</h1>
          <p className="text-text-muted mb-6">Last updated: 24 March 2026</p>

          <h2 className="font-bold text-2xl mt-12 mb-4 text-text-primary">1. Information we collect</h2>
          <p className="text-text-secondary mb-6">
            We collect information you provide directly when you complete our contact form or message us via WhatsApp. This may include your name, business name, phone number, and email address.
          </p>

          <h2 className="font-bold text-2xl mt-12 mb-4 text-text-primary">2. How we use your information</h2>
          <p className="text-text-secondary mb-6">
            We use the information collected solely to:
          </p>
          <ul className="list-disc pl-6 text-text-secondary mb-6 space-y-2">
            <li>Respond to your questions and contact requests.</li>
            <li>Deliver the digital marketing services you requested.</li>
            <li>Send relevant updates about your project.</li>
          </ul>

          <h2 className="font-bold text-2xl mt-12 mb-4 text-text-primary">3. Data sharing</h2>
          <p className="text-text-secondary mb-6">
            We do not sell, rent, or share your personal information with third parties except when strictly necessary to deliver our services (for example, domain registration on your behalf) or when required by law.
          </p>

          <h2 className="font-bold text-2xl mt-12 mb-4 text-text-primary">4. Security</h2>
          <p className="text-text-secondary mb-6">
            We implement appropriate security measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction.
          </p>

          <h2 className="font-bold text-2xl mt-12 mb-4 text-text-primary">5. Contact</h2>
          <p className="text-text-secondary mb-6">
            If you have questions about this Privacy Policy, please contact us via WhatsApp or our contact form.
          </p>
        </div>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
