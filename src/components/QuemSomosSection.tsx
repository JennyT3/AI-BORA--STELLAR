import { useState } from 'react';

export function QuemSomosSection() {
  const [imageError, setImageError] = useState(false);

  return (
    <section id="quem-somos" className="py-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Texto */}
          <div className="space-y-6 order-2 lg:order-1">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary leading-tight">
              A equipa que coloca o seu<br />
              <span className="text-fuchsia-brand">negócio no mapa.</span>
            </h2>
            
            <div className="space-y-4 text-lg text-text-secondary leading-relaxed">
              <p>
                A AI BORA nasceu com uma missão simples: descomplicar o marketing digital 
                para negócios locais em Portugal.
              </p>
              <p>
                Gerir uma padaria, uma oficina ou um cabeleireiro já dá muito trabalho. 
                Não precisa de se preocupar com o Google ou as redes sociais.
              </p>
              <p>
                Nós tratamos de tudo — desde o site até aparecer no Google Maps quando 
                alguém procura perto de si. <strong>Sem jargões. Sem complicações. Resultados reais.</strong>
              </p>
            </div>
          </div>

          {/* Imagen - Con fallback si falla */}
          <div className="relative order-1 lg:order-2">
            {!imageError ? (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
                  alt="Equipa AI BORA trabalhando"
                  className="w-full h-auto object-cover aspect-[4/3]"
                  onError={() => setImageError(true)}
                  loading="eager"
                />
                {/* Overlay sutil */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            ) : (
              /* Fallback: Gradiente profesional si la imagen falla */
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-600 to-blue-600 flex items-center justify-center shadow-2xl">
                <div className="text-center text-white p-8">
                  <div className="text-6xl mb-4">🚀</div>
                  <div className="text-3xl font-bold mb-2">AI BORA</div>
                  <div className="text-lg opacity-90">Equipa criativa & técnica</div>
                  <div className="mt-6 flex justify-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">💡</div>
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">⚡</div>
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">🎯</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Badge flotante - Compromiso real */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-black/5 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-fuchsia-100 flex items-center justify-center text-fuchsia-600 text-xl">❤️</div>
                <div>
                  <div className="font-bold text-text-primary">Compromisso total</div>
                  <div className="text-sm text-text-secondary">com o seu sucesso</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
