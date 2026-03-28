export function EquipeSection() {
  return (
    <section id="quem-somos" className="py-16 lg:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12 items-center">
          
          <div className="space-y-4 w-full lg:w-1/2">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary leading-tight">
              A equipa que coloca o seu<br />
              <span className="text-fuchsia-brand">negócio no mapa.</span>
            </h2>
            
            <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
              <p>
                A AI BORA nasceu com uma missão simples: descomplicar o marketing digital 
                para negócios locais em Portugal.
              </p>
              <p>
                Gerir uma padaria, uma oficina ou um cabeleireiro já dá muito trabalho. 
                Nós tratamos de tudo — desde o site até aparecer no Google Maps.
              </p>
            </div>
          </div>

          <div className="relative w-full lg:w-1/2">
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-600 to-blue-600 flex items-center justify-center shadow-xl">
              <div className="text-center text-white p-6">
                <div className="text-4xl mb-3">🚀</div>
                <div className="text-xl font-bold mb-1">AI BORA</div>
                <div className="text-sm opacity-90">Equipa criativa & técnica</div>
                <div className="mt-4 flex justify-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">💡</div>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">⚡</div>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">🎯</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-3 -left-3 bg-white rounded-xl shadow-lg p-3 border border-black/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-sm">✓</div>
                <div>
                  <div className="font-bold text-text-primary text-sm">+50 negócios</div>
                  <div className="text-xs text-text-secondary">ajudados</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
