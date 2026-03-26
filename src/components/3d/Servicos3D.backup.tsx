'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo3D } from './Logo3D';
import { servicos } from '../../data/servicos';
import { Share2, Target, Globe, Camera, Bot, BarChart3, X } from 'lucide-react';

const iconMap: { [key: string]: React.ElementType } = {
  Share2,
  Target,
  Globe,
  Camera,
  Bot,
  BarChart3,
};

export function Servicos3D() {
  const [servicoSelecionado, setServicoSelecionado] = useState<string | null>(null);

  const servicoAtual = servicos.find(s => s.id === servicoSelecionado);

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center p-4">
      {/* Título de la sección */}
      <motion.div
        className="absolute top-8 left-0 right-0 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 
          className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2"
          style={{ 
            fontFamily: 'Montserrat, sans-serif',
            color: '#000000',
            letterSpacing: '-0.02em'
          }}
        >
          Os nossos serviços
        </h1>
        <p 
          className="text-base sm:text-lg"
          style={{ 
            fontFamily: 'Montserrat, sans-serif',
            color: 'rgba(0,0,0,0.6)',
            fontWeight: 400
          }}
        >
          Clique para explorar
        </p>
      </motion.div>

      {/* Contenedor principal con logo centrado */}
      <div className="relative w-full max-w-6xl h-[600px] sm:h-[700px] lg:h-[800px] flex items-center justify-center">
        
        {/* Logo 3D en el centro */}
        <div className="absolute z-10">
          <Logo3D />
        </div>

        {/* Tarjetas de servicios orbitando */}
        {servicos.map((servico, index) => {
          const Icon = iconMap[servico.icon];
          const angle = (index * 60) - 90; // 6 servicios = cada 60 grados, empezando arriba
          const radius = 280; // Distancia del centro
          
          // Convertir ángulo a posición x,y
          const radian = (angle * Math.PI) / 180;
          const x = Math.cos(radian) * radius;
          const y = Math.sin(radian) * radius;

          return (
            <motion.button
              key={servico.id}
              className="absolute w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer"
              style={{
                left: `calc(50% + ${x}px - 80px)`,
                top: `calc(50% + ${y}px - 80px)`,
                backgroundColor: 'rgba(255,255,255,0.9)',
                border: `2px solid ${servico.cor}`,
                boxShadow: `0 10px 40px ${servico.cor}20`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ 
                scale: 1.1, 
                boxShadow: `0 20px 60px ${servico.cor}40`,
                y: -10
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setServicoSelecionado(servico.id)}
            >
              <Icon 
                size={32} 
                color={servico.cor}
                strokeWidth={1.5}
              />
              <span 
                className="text-xs sm:text-sm font-bold text-center px-2 leading-tight"
                style={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  color: '#000000'
                }}
              >
                {servico.titulo}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {servicoSelecionado && servicoAtual && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setServicoSelecionado(null)}
          >
            <motion.div
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl"
              style={{
                borderTop: `4px solid ${servicoAtual.cor}`,
              }}
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botón cerrar */}
              <button
                className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                onClick={() => setServicoSelecionado(null)}
              >
                <X size={20} color="#000000" />
              </button>

              {/* Icono y título */}
              <div className="flex items-center gap-4 mb-6">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${servicoAtual.cor}15` }}
                >
                  {(() => {
                    const Icon = iconMap[servicoAtual.icon];
                    return <Icon size={28} color={servicoAtual.cor} strokeWidth={1.5} />;
                  })()}
                </div>
                <h2 
                  className="text-2xl sm:text-3xl font-black"
                  style={{ 
                    fontFamily: 'Montserrat, sans-serif',
                    color: '#000000'
                  }}
                >
                  {servicoAtual.titulo}
                </h2>
              </div>

              {/* Lista de puntos */}
              <ul className="space-y-3">
                {servicoAtual.pontos.map((ponto, idx) => (
                  <motion.li
                    key={idx}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: servicoAtual.cor }}
                    />
                    <span 
                      className="text-base sm:text-lg"
                      style={{ 
                        fontFamily: 'Montserrat, sans-serif',
                        color: 'rgba(0,0,0,0.8)',
                        fontWeight: 400,
                        lineHeight: 1.5
                      }}
                    >
                      {ponto}
                    </span>
                  </motion.li>
                ))}
              </ul>

              {/* Botón CTA */}
              <motion.button
                className="w-full mt-8 py-4 rounded-full font-bold text-white text-lg"
                style={{ 
                  backgroundColor: servicoAtual.cor,
                  fontFamily: 'Montserrat, sans-serif',
                  boxShadow: `0 10px 30px ${servicoAtual.cor}40`
                }}
                whileHover={{ scale: 1.02, boxShadow: `0 15px 40px ${servicoAtual.cor}60` }}
                whileTap={{ scale: 0.98 }}
              >
                Quero este serviço
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
