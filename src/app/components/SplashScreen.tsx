import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getTransformedUrl, BUCKETS } from '../../lib/storage';

const LOGO_URL = getTransformedUrl(BUCKETS.LANDING_PAGE, 'logo/logo.png', {
  width: 352,
  height: 352,
  quality: 80,
});
const SPLASH_KEY = 'flor_splash_shown';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Após 5s, inicia o fade-out
    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-950"
        >
          {/* Logo */}
          <motion.img
            src={LOGO_URL}
            alt="Flor do Maracujá"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-6 h-36 w-36 rounded-full object-cover shadow-2xl sm:h-44 sm:w-44"
          />

          {/* Nome */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="font-display text-3xl tracking-wide text-white sm:text-4xl"
          >
            Flor do Maracujá
          </motion.h1>

          {/* Linha sutil de loading */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 4.2, ease: 'easeInOut' }}
            className="mt-8 h-0.5 w-32 origin-left rounded-full bg-[#FFC107]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Retorna true se é a primeira visita da sessão */
export function shouldShowSplash(): boolean {
  if (typeof window === 'undefined') return false;
  return !sessionStorage.getItem(SPLASH_KEY);
}

/** Marca a splash como já exibida nessa sessão */
export function markSplashShown(): void {
  sessionStorage.setItem(SPLASH_KEY, '1');
}
