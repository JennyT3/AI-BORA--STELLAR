import { motion } from 'motion/react';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { WHATSAPP_LINK } from '../lib/constants';
import { Link } from 'wouter';

export function HeroSection() {
  return (
    <section 
      style={{ 
        backgroundColor: '#000000',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center'
      }} 
      className="w-full py-20 sm:py-24 lg:py-32 pt-28 sm:pt-32 lg:pt-36"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Contenido de texto */}
          <div className="flex-1 w-full flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22,1,0.36,1] }}
              style={{
                color: '#FFFFFF',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 900,
                fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                marginTop: '1rem'
              }}
            >
              Bora meter o seu<br />
              negócio no mapa?
            </motion.h1>

            {/* Linha laranja separador */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22,1,0.36,1] }}
              style={{ 
                height: '4px', 
                backgroundColor: '#F25C05', 
                borderRadius: '2px'
              }}
              className="mx-auto lg:mx-0"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22,1,0.36,1] }}
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                lineHeight: 1.6,
                maxWidth: '420px'
              }}
            >
              Ajudamos negócios locais a serem encontrados por quem vive perto.<br className="hidden sm:block" />
              Sem jargões. Resultados reais.
            </motion.p>

            {/* Botones */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.22,1,0.36,1] }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2"
            >
              {/* Botón WhatsApp con icono */}
              <motion.a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor: '#25D366',
                  color: '#FFFFFF',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  height: '52px',
                  borderRadius: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '0 2rem',
                  boxShadow: '0 8px 28px rgba(37,211,102,0.35)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.02em'
                }}
                className="w-full sm:w-auto"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Fale connosco
              </motion.a>

              <Link href="/servicos" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05, borderColor: '#F25C05' }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    backgroundColor: 'transparent',
                    border: '2px solid rgba(242,92,5,0.6)',
                    color: '#FFFFFF',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    height: '52px',
                    borderRadius: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '0 2rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.02em',
                    transition: 'all 0.2s ease',
                    width: '100%'
                  }}
                >
                  Ver serviços
                  <ArrowRight size={18} />
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Video */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22,1,0.36,1] }}
            className="flex-1 w-full mt-8 lg:mt-0"
          >
            <div style={{ 
              borderRadius: '24px', 
              overflow: 'hidden',
              boxShadow: '0 25px 80px rgba(242,34,131,0.25)'
            }}>
              <video
                src="/hero-video.mp4"
                autoPlay
                muted
                loop
                playsInline
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
