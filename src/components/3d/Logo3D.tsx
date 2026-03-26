'use client';

import { motion } from 'framer-motion';

export function Logo3D() {
  return (
    <motion.div
      className="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80"
      animate={{
        y: [0, -20, 0],
        rotateY: [0, 5, 0, -5, 0],
        rotateX: [0, 3, 0, -3, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      {/* Sombra suave */}
      <div 
        className="absolute inset-0 rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, rgba(242,34,131,0.3) 0%, rgba(242,92,5,0.3) 50%, rgba(37,211,102,0.3) 100%)',
          filter: 'blur(40px)',
          transform: 'translateZ(-50px) scale(1.2)',
          opacity: 0.6,
        }}
      />

      {/* Logo SVG con efecto cristal */}
      <motion.svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        style={{
          filter: 'drop-shadow(0 25px 50px rgba(242,34,131,0.25))',
        }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <defs>
          {/* Gradiente principal */}
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F22283" />
            <stop offset="50%" stopColor="#F25C05" />
            <stop offset="100%" stopColor="#25D366" />
          </linearGradient>
          
          {/* Efecto cristal/brillo */}
          <linearGradient id="glassShine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          {/* Filtro de brillo */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Forma del logo AI BORA - Cruz/Flecha estilizada */}
        <g filter="url(#glow)">
          {/* Cuadrado superior izquierdo */}
          <path
            d="M 20 20 L 90 20 L 90 90 L 20 90 Z"
            fill="url(#logoGradient)"
            opacity="0.95"
          />
          <path
            d="M 20 20 L 90 20 L 90 90 L 20 90 Z"
            fill="url(#glassShine)"
          />

          {/* Rectángulo inferior izquierdo (grande) */}
          <path
            d="M 20 110 L 110 110 L 110 180 L 20 180 Z"
            fill="url(#logoGradient)"
            opacity="0.9"
          />
          <path
            d="M 20 110 L 110 110 L 110 180 L 20 180 Z"
            fill="url(#glassShine)"
          />

          {/* Cuadrado inferior derecho */}
          <path
            d="M 120 110 L 180 110 L 180 180 L 120 180 Z"
            fill="url(#logoGradient)"
            opacity="0.95"
          />
          <path
            d="M 120 110 L 180 110 L 180 180 L 120 180 Z"
            fill="url(#glassShine)"
          />

          {/* Forma diagonal superior derecha */}
          <path
            d="M 100 20 L 180 20 L 180 100 L 100 100 Z"
            fill="url(#logoGradient)"
            opacity="0.85"
            transform="skewX(-15)"
          />
          <path
            d="M 100 20 L 180 20 L 180 100 L 100 100 Z"
            fill="url(#glassShine)"
            transform="skewX(-15)"
          />
        </g>

        {/* Borde brillante */}
        <rect
          x="15"
          y="15"
          width="170"
          height="170"
          rx="20"
          fill="none"
          stroke="url(#logoGradient)"
          strokeWidth="2"
          opacity="0.5"
        />
      </motion.svg>

      {/* Reflejo en el "suelo" */}
      <div
        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-32 h-8 rounded-full"
        style={{
          background: 'radial-gradient(ellipse, rgba(242,34,131,0.2) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />
    </motion.div>
  );
}
