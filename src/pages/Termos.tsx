import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { FloatingWhatsApp } from '../components/FloatingWhatsApp';

export function Termos() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-fuchsia">
          <h1 className="font-extrabold text-4xl mb-8 text-text-primary">Termos de Serviço</h1>
          <p className="text-text-muted mb-6">Última atualização: 24 de Março de 2026</p>
          
          <h2 className="font-bold text-2xl mt-12 mb-4 text-text-primary">1. Aceitação dos Termos</h2>
          <p className="text-text-secondary mb-6">
            Ao aceder e utilizar os serviços da AI BORA, concorda em cumprir e ficar vinculado aos seguintes Termos de Serviço. Se não concordar com alguma parte destes termos, não deverá utilizar os nossos serviços.
          </p>

          <h2 className="font-bold text-2xl mt-12 mb-4 text-text-primary">2. Serviços Prestados</h2>
          <p className="text-text-secondary mb-6">
            A AI BORA fornece serviços de marketing digital para negócios locais, incluindo a criação de websites, gestão de redes sociais, otimização de Google Business Profile e campanhas de publicidade online, conforme detalhado nos nossos "Packs" e "Planos de Gestão".
          </p>

          <h2 className="font-bold text-2xl mt-12 mb-4 text-text-primary">3. Pagamentos e Faturação</h2>
          <p className="text-text-secondary mb-6">
            Os "Packs de Setup" são serviços de pagamento único. O pagamento é geralmente dividido em duas tranches: 50% no início do projeto e 50% na entrega final, salvo acordo em contrário. Os "Planos de Gestão" são cobrados mensalmente. Todos os valores apresentados acrescem IVA à taxa legal em vigor.
          </p>

          <h2 className="font-bold text-2xl mt-12 mb-4 text-text-primary">4. Propriedade Intelectual</h2>
          <p className="text-text-secondary mb-6">
            Após o pagamento integral, o cliente detém os direitos de propriedade sobre o website criado e os conteúdos produzidos especificamente para o seu negócio. A AI BORA reserva-se o direito de utilizar os trabalhos realizados no seu portfólio, a menos que o cliente solicite o contrário por escrito.
          </p>

          <h2 className="font-bold text-2xl mt-12 mb-4 text-text-primary">5. Limitação de Responsabilidade</h2>
          <p className="text-text-secondary mb-6">
            A AI BORA envida todos os esforços para alcançar os melhores resultados possíveis, mas não pode garantir posições específicas nos motores de busca ou um número exato de leads/vendas, uma vez que estes dependem de fatores externos (algoritmos, concorrência, etc.).
          </p>

          <h2 className="font-bold text-2xl mt-12 mb-4 text-text-primary">6. Alterações aos Termos</h2>
          <p className="text-text-secondary mb-6">
            Reservamo-nos o direito de modificar estes Termos de Serviço a qualquer momento. As alterações entrarão em vigor imediatamente após a sua publicação no nosso website.
          </p>
        </div>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
