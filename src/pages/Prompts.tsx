import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { FloatingWhatsApp } from '../components/FloatingWhatsApp';
import { prompts as allPrompts, categories } from '../data/prompts';
import { PromptCard } from '../components/PromptCard';
import { Search } from 'lucide-react';

export function Prompts() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(9); // Mostrar 9 inicialmente (3x3)
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Filtrar prompts
  const filteredPrompts = useMemo(() => {
    let result = allPrompts;
    
    if (activeFilter !== "Todos") {
      result = result.filter(p => p.category === activeFilter);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query)) ||
        p.category.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [activeFilter, searchQuery]);

  // Prompts a mostrar (limitado por displayCount)
  const visiblePrompts = filteredPrompts.slice(0, displayCount);
  const hasMore = displayCount < filteredPrompts.length;

  // Scroll infinito
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    // Simular delay para efecto de carga
    setTimeout(() => {
      setDisplayCount(prev => prev + 6); // Cargar 6 más (2 filas de 3)
      setIsLoading(false);
    }, 500);
  }, [isLoading, hasMore]);

  // Intersection Observer para scroll infinito
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [loadMore, hasMore]);

  // Reset display count cuando cambia filtro
  useEffect(() => {
    setDisplayCount(9);
  }, [activeFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      
      <main className="pt-20">
        {/* HEADER - FONDO NEGRO, SIN BOTÓN PREMIUM */}
        <section 
          className="py-10 px-4 sm:px-6 lg:px-8 border-b border-[#333]"
          style={{ backgroundColor: '#0a0a0a' }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h1 
                className="text-3xl md:text-4xl font-bold mb-3"
                style={{ 
                  fontFamily: 'Montserrat, sans-serif', 
                  color: '#ffffff',
                  fontWeight: 800
                }}
              >
                Prompts AI
              </h1>
              <p 
                className="text-sm max-w-md mx-auto"
                style={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  color: '#aaaaaa'
                }}
              >
                Biblioteca de prompts otimizados para criadores e empresas.
              </p>
            </div>

            {/* Buscador */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Pesquisar prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full text-sm focus:outline-none transition-colors text-gray-900 placeholder-gray-500"
                style={{ 
                  backgroundColor: '#f5f2f0', 
                  border: 'none',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500
                }}
              />
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className="px-4 py-2 rounded-full text-xs font-medium transition-all border"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: activeFilter === cat ? 700 : 500,
                    backgroundColor: activeFilter === cat ? '#ff6f2e' : 'transparent',
                    color: activeFilter === cat ? 'white' : '#cccccc',
                    borderColor: activeFilter === cat ? '#ff6f2e' : '#444'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Grid - 3 columnas más grandes */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-bg">
          <div className="max-w-5xl mx-auto">
            {visiblePrompts.length === 0 ? (
              <div className="text-center py-12">
                <p 
                  className="text-gray-500"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Nenhum prompt encontrado.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  {visiblePrompts.map((prompt) => (
                    <PromptCard key={prompt.id} prompt={prompt} />
                  ))}
                </div>
                
                {/* Scroll infinito trigger */}
                {hasMore && (
                  <div 
                    ref={loadMoreRef}
                    className="flex justify-center items-center py-8 mt-4"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#ff6f2e] animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-[#ff6f2e] animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 rounded-full bg-[#ff6f2e] animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    ) : (
                      <button
                        onClick={loadMore}
                        className="px-6 py-2 rounded-full text-sm font-medium border transition-colors hover:bg-[#ff6f2e]/10"
                        style={{ 
                          fontFamily: 'Montserrat, sans-serif',
                          color: '#ff6f2e',
                          borderColor: '#ff6f2e'
                        }}
                      >
                        Carregar mais
                      </button>
                    )}
                  </div>
                )}
                
                {!hasMore && visiblePrompts.length > 0 && (
                  <p 
                    className="text-center text-gray-500 text-xs py-8"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Fim da biblioteca
                  </p>
                )}
              </>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-card border-t border-border">
          <div className="max-w-2xl mx-auto text-center">
            <h2 
              className="text-xl md:text-2xl font-bold mb-3"
              style={{ 
                fontFamily: 'Montserrat, sans-serif', 
                color: '#ff6f2e',
                fontWeight: 800
              }}
            >
              Queres mais prompts exclusivos?
            </h2>
            <p 
              className="text-text-secondary text-sm mb-6"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Subscreve e recebe acesso ilimitado à nossa biblioteca completa.
            </p>
            <button
              className="px-8 py-3 rounded-full text-sm font-bold text-white transition-transform hover:scale-105"
              style={{ 
                background: 'linear-gradient(135deg, #ff6f2e 0%, #cb1a74 100%)',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              Subscrever Agora
            </button>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
