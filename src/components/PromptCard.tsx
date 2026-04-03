import { useState, useEffect } from 'react';
import { Lock, Copy, Check, X, Square, RectangleHorizontal, RectangleVertical, Image as ImageIcon } from 'lucide-react';
import type { Prompt, AspectRatio } from '../data/prompts';
import { aspectRatios } from '../data/prompts';

interface PromptCardProps {
  prompt: Prompt;
}

export function PromptCard({ prompt }: PromptCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<AspectRatio>("1:1");

  // Bloquear scroll del body cuando modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCopy = async () => {
    const fullPrompt = `${prompt.prompt} in ${selectedFormat} format`;
    await navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatIcons = {
    "1:1": <Square className="w-4 h-4" />,
    "4:5": <RectangleVertical className="w-4 h-4" />,
    "16:9": <RectangleHorizontal className="w-4 h-4" />,
    "9:16": <ImageIcon className="w-4 h-4" />
  };

  return (
    <>
      {/* CARD */}
      <div
        onClick={() => setIsOpen(true)}
        className="group relative overflow-hidden rounded-xl cursor-pointer bg-card border border-border hover:border-[#F25C05]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#F25C05]/10 aspect-square"
      >
        <img
          src={prompt.image}
          alt={prompt.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        
        <div className="absolute top-2 left-2 md:top-3 md:left-3">
          <span 
            className="px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider"
            style={{ 
              backgroundColor: 'rgba(255, 111, 46, 0.2)', 
              border: '1px solid rgba(255, 111, 46, 0.3)',
              color: '#F25C05',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            {prompt.category}
          </span>
        </div>

        {prompt.isPremium && (
          <div className="absolute top-2 right-2 md:top-3 md:right-3">
            <Lock className="w-3 h-3 md:w-4 md:h-4" style={{ color: '#F22283' }} />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3">
          <h3 
            className="font-bold text-xs md:text-sm mb-0.5 md:mb-1 line-clamp-1"
            style={{ 
              fontFamily: 'Montserrat, sans-serif', 
              color: '#ffffff',
              textShadow: '0 2px 8px rgba(0,0,0,0.9)',
              fontWeight: 700
            }}
          >
            {prompt.title}
          </h3>
          
          {prompt.isPremium ? (
            <p 
              className="text-[9px] md:text-[10px] text-gray-400 blur-sm select-none"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Premium
            </p>
          ) : (
            <p 
              className="text-[9px] md:text-[10px] text-gray-300"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Ver prompt
            </p>
          )}
        </div>
      </div>

      {/* MODAL - MÓVIL: scrollable, DESKTOP: normal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto"
          onClick={() => setIsOpen(false)}
        >
          {/* Contenedor centrado con padding para scroll */}
          <div className="min-h-screen flex items-start md:items-center justify-center p-3 md:p-4 py-8 md:py-4">
            <div 
              className="relative w-full max-w-sm md:max-w-4xl flex flex-col md:flex-row rounded-2xl overflow-hidden"
              style={{ 
                backgroundColor: '#0a0a0a', 
                border: '1px solid #333',
                maxHeight: 'none',
                height: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* BOTÓN CERRAR */}
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 md:top-3 md:right-3 z-50 p-2.5 bg-black/80 hover:bg-black rounded-full transition-colors border border-white/30 shadow-lg"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* COLUMNA IZQUIERDA - Imagen (sticky en móvil para que no se pierda) */}
              <div 
                className="w-full md:w-1/2 p-3 md:p-5 flex flex-col bg-[#111] border-b md:border-b-0 md:border-r border-[#333]"
              >
                {/* Título en MÓVIL */}
                <div className="md:hidden mb-3 pr-12">
                  <h2 
                    className="text-base font-bold leading-tight"
                    style={{ 
                      fontFamily: 'Montserrat, sans-serif',
                      color: '#ffffff'
                    }}
                  >
                    {prompt.title}
                  </h2>
                  {prompt.isPremium && (
                    <span 
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 inline-block"
                      style={{ 
                        backgroundColor: 'rgba(203, 26, 116, 0.2)', 
                        color: '#F22283',
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                    >
                      PREMIUM
                    </span>
                  )}
                </div>

                {/* Imagen */}
                <div className="flex-shrink-0 flex items-center justify-center w-full py-2">
                  <div 
                    className="relative flex items-center justify-center bg-[#0a0a0a] rounded-lg overflow-hidden"
                    style={{
                      width: '100%',
                      maxWidth: selectedFormat === '9:16' ? '160px' : selectedFormat === '1:1' ? '220px' : '100%',
                      height: selectedFormat === '9:16' ? '260px' : 
                              selectedFormat === '4:5' ? '220px' :
                              selectedFormat === '16:9' ? '140px' : '220px',
                      maxHeight: '280px',
                      aspectRatio: selectedFormat.replace(':', '/'),
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <img
                      src={prompt.image}
                      alt={prompt.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Selector de Formatos */}
                <div className="mt-3 pt-3 border-t border-[#333] flex-shrink-0">
                  <p 
                    className="text-[11px] mb-2 text-center"
                    style={{ 
                      fontFamily: 'Montserrat, sans-serif',
                      color: '#ffffff',
                      fontWeight: 600
                    }}
                  >
                    Formato
                  </p>
                  <div className="flex justify-center gap-1.5">
                    {aspectRatios.map((ratio) => (
                      <button
                        key={ratio.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFormat(ratio.value);
                        }}
                        className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all border"
                        style={{
                          minWidth: '44px',
                          backgroundColor: selectedFormat === ratio.value ? 'rgba(255, 111, 46, 0.2)' : '#1a1a1a',
                          borderColor: selectedFormat === ratio.value ? '#F25C05' : '#444',
                          fontFamily: 'Montserrat, sans-serif'
                        }}
                      >
                        <span style={{ color: selectedFormat === ratio.value ? '#F25C05' : '#ffffff' }}>
                          {formatIcons[ratio.value]}
                        </span>
                        <span 
                          className="text-[8px] uppercase font-medium"
                          style={{ 
                            color: selectedFormat === ratio.value ? '#F25C05' : '#ffffff'
                          }}
                        >
                          {ratio.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* COLUMNA DERECHA - Prompt (SCROLLABLE en móvil) */}
              <div 
                className="w-full md:w-1/2 p-3 md:p-5 flex flex-col"
                style={{ minHeight: 'auto' }}
              >
                {/* Título en DESKTOP */}
                <div className="hidden md:block mb-4 pr-10">
                  <h2 
                    className="text-xl font-bold"
                    style={{ 
                      fontFamily: 'Montserrat, sans-serif',
                      color: '#ffffff'
                    }}
                  >
                    {prompt.title}
                  </h2>
                  {prompt.isPremium && (
                    <span 
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 inline-block"
                      style={{ 
                        backgroundColor: 'rgba(203, 26, 116, 0.2)', 
                        color: '#F22283',
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                    >
                      PREMIUM
                    </span>
                  )}
                </div>

                {prompt.isPremium ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-4 md:py-6">
                    <div 
                      className="w-full rounded-lg md:rounded-xl p-3 md:p-4 border mb-3 md:mb-4"
                      style={{ backgroundColor: '#1a1a1a', borderColor: '#333' }}
                    >
                      <p 
                        className="text-xs md:text-sm text-gray-600 blur-sm select-none leading-relaxed"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {prompt.prompt}
                      </p>
                    </div>
                    <Lock className="w-8 h-8 md:w-10 md:h-10 mb-2 md:mb-3" style={{ color: '#F22283' }} />
                    <p 
                      className="text-sm mb-1 text-center"
                      style={{ 
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#ffffff',
                        fontWeight: 600
                      }}
                    >
                      Conteúdo Premium
                    </p>
                    <p 
                      className="text-gray-400 text-xs mb-3 md:mb-4 text-center"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Subscreve para desbloquear
                    </p>
                    <button 
                      className="px-5 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold text-white transition-colors"
                      style={{ 
                        background: 'linear-gradient(135deg, #F25C05 0%, #F22283 100%)',
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                    >
                      Ver Planos
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Prompt - Scrollable si es largo */}
                    <div className="flex-1 min-h-0">
                      <p 
                        className="text-[11px] md:text-xs mb-2"
                        style={{ 
                          fontFamily: 'Montserrat, sans-serif',
                          color: '#ffffff',
                          fontWeight: 600
                        }}
                      >
                        Prompt:
                      </p>
                      <div 
                        className="rounded-lg md:rounded-xl p-3 md:p-4 border overflow-y-auto"
                        style={{ 
                          backgroundColor: '#1a1a1a', 
                          borderColor: '#333',
                          maxHeight: '200px',
                          minHeight: '100px'
                        }}
                      >
                        <p 
                          className="text-xs md:text-sm leading-relaxed"
                          style={{ 
                            fontFamily: 'monospace', 
                            fontSize: '11px', 
                            lineHeight: '1.6',
                            color: '#e0e0e0'
                          }}
                        >
                          {prompt.prompt}
                          <span style={{ color: '#F25C05' }}> in {selectedFormat} format</span>
                        </p>
                      </div>
                    </div>

                    {/* Botón Copiar - Sticky abajo en móvil */}
                    <div className="mt-3 md:mt-4 flex-shrink-0">
                      <button
                        onClick={handleCopy}
                        className="w-full py-3 rounded-full text-xs md:text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
                        style={{ 
                          background: copied 
                            ? '#10b981' 
                            : 'linear-gradient(135deg, #F25C05 0%, #F22283 100%)',
                          fontFamily: 'Montserrat, sans-serif'
                        }}
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copiar Prompt
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#333] flex-shrink-0">
                  {prompt.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-[9px] border"
                      style={{ 
                        backgroundColor: '#1a1a1a', 
                        borderColor: '#333',
                        color: '#aaa',
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
