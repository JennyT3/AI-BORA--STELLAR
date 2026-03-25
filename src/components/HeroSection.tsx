import { motion } from 'motion/react';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { WHATSAPP_LINK } from '../lib/constants';
import { Link } from 'wouter';

export function HeroSection() {
  return (
    <section style={{ backgroundColor: '#000000', minHeight: '100vh' }} className="w-full flex items-center pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">

          <div className="flex-1 w-full flex flex-col items-start">

            <motion.p
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22,1,0.36,1] }}
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 900,
                fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
                lineHeight: 1.08,
                color: '#FFFFFF',
                marginBottom: '0.75rem',
                letterSpacing: '-0.01em'
              }}
            >
              Bora meter o seu<br />
              negócio no mapa?
            </motion.p>

            {/* Linha laranja separador */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 72 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22,1,0.36,1] }}
              style={{ height: '3px', backgroundColor: '#F25C05', borderRadius: '2px', marginBottom: '1.5rem' }}
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22,1,0.36,1] }}
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 400,
                fontSize: '1rem',
                lineHeight: 1.75,
                color: 'rgba(255,255,255,0.68)',
                maxWidth: '380px',
                marginBottom: '2.5rem'
              }}
            >
              Ajudamos negócios locais a serem<br />
              encontrados por quem vive perto.<br />
              Sem jargões. Resultados reais.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.22,1,0.36,1] }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  backgroundColor: '#25D366',
                  color: '#FFFFFF',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  height: '48px',
                  borderRadius: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '0 1.6rem',
                  boxShadow: '0 6px 24px rgba(37,211,102,0.30)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.01em'
                }}
              >
                <MessageCircle size={16} />
                Fale connosco
              </motion.a>

              <Link href="/servicos">
                <motion.button
                  whileHover={{ scale: 1.03, borderColor: '#F25C05' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1.5px solid rgba(242,92,5,0.45)',
                    color: '#FFFFFF',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    height: '48px',
                    borderRadius: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '0 1.6rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.01em',
                    transition: 'border-color 0.2s'
                  }}
                >
                  Ver serviços
                  <ArrowRight size={15} />
                </motion.button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22,1,0.36,1] }}
            style={{ flex: 1, width: '100%' }}
          >
            <video
              src="/hero-video.mp4"
              autoPlay
              muted
              loop
              playsInline
              style={{
                width: '100%',
                borderRadius: '1.5rem',
                display: 'block',
                objectFit: 'cover',
                boxShadow: '0 24px 64px rgba(242,34,131,0.18)'
              }}
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
