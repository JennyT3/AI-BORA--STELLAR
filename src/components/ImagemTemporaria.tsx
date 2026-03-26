export function ImagemTemporaria() {
  return (
    <div className="relative w-full h-full min-h-[400px]">
      <img 
        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" 
        alt="Equipa AI BORA"
        className="w-full h-full object-cover rounded-2xl shadow-xl"
        onError={(e) => {
          // Si falla la imagen, mostrar gradiente
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement!.innerHTML = `
            <div class="w-full h-full min-h-[400px] rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
              <div class="text-center text-white p-8">
                <div class="text-6xl mb-4">🚀</div>
                <div class="text-3xl font-bold">AI BORA</div>
                <div class="text-lg opacity-90 mt-2">Equipa dedicada</div>
              </div>
            </div>
          `;
        }}
      />
    </div>
  );
}
