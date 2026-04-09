import { motion } from 'motion/react';
import { WHATSAPP_LINK } from '../lib/constants';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

export function FloatingWhatsApp() {
  return (
    <motion.a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-4 md:bottom-8 md:right-8 z-[9999] w-14 h-14 md:w-16 md:h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(37,211,102,0.45)] whatsapp-pulse"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Chat on WhatsApp"
    >
      <WhatsAppIcon size={28} />
    </motion.a>
  );
}
