import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { FloatingWhatsApp } from '../components/FloatingWhatsApp';

export function Privacidade() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-fuchsia">
          <h1 className="font-extrabold text-4xl mb-8 text-text-primary">Política de Privacidade</h1>
          <p className="text-text-muted mb-6">Última atualização: 24 de Março de 2026</p>
          
          <h2 className="font-bold text-2xl mt-12 mb-4 text-text-primary">1. Informação que recolhemos</h2>
          <p className="text-text-secondary mb-6">
            Recolhemos informações que nos fornece diretamente quando preenche o nosso formulário de contacto ou nos envia uma mensagem via WhatsApp. Isto pode incluir o seu nome, nome do negócio, número de telemóvel e endereço de email.
          </p>

          <h2 className="font-bold text-2xl mt-12 mb-4 text-text-primary">2. Como usamos a sua informação</h2>
          <p className="text-text-secondary mb-6">
            Utilizamos a informação recolhida exclusivamente para:
          </p>
          <ul className="list-disc pl-6 text-text-secondary mb-6 space-y-2">
            <li>Responder às suas questões e pedidos de contacto.</li>
            <li>Fornecer os serviços de marketing digital solicitados.</li>
            <li>Enviar informações relevantes sobre o seu projeto.</li>
          </ul>

          <h2 className="font-bold text-2xl mt-12 mb-4 text-text-primary">3. Partilha de dados</h2>
          <p className="text-text-secondary mb-6">
            Não vendemos, alugamos ou partilhamos as suas informações pessoais com terceiros, exceto quando estritamente necessário para a prestação dos nossos serviços (por exemplo, registo de domínio em seu nome) ou quando exigido por lei.
          </p>

          <h2 className="font-bold text-2xl mt-12 mb-4 text-text-primary">4. Segurança</h2>
          <p className="text-text-secondary mb-6">
            Implementamos medidas de segurança adequadas para proteger as suas informações pessoais contra acesso, alteração, divulgação ou destruição não autorizados.
          </p>

          <h2 className="font-bold text-2xl mt-12 mb-4 text-text-primary">5. Contacto</h2>
          <p className="text-text-secondary mb-6">
            Se tiver alguma dúvida sobre esta Política de Privacidade, por favor contacte-nos através do nosso WhatsApp ou formulário de contacto.
          </p>
        </div>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
