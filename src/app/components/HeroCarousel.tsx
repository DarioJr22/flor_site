import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MessageCircle, UtensilsCrossed, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { getPublicUrl, BUCKETS } from '../../lib/storage';

const IFOOD_URL = 'https://www.ifood.com.br/delivery/recife-pe/flor-do-maracuja-imbiribeira/e1a8cc86-aee4-4e93-8d4a-3f253b9df32c?utm_medium=share&utm_source=ig&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGn7kwG0ZsoqkBsMtYVQRzbH3TaPCfZ1WpnZclazgwt2CqygfYHM5IVEo9soBQ_aem_R-i7y_Swrc9Om3_6g_55pA';

const LOGO_URL = getPublicUrl(BUCKETS.LANDING_PAGE, 'logo/logo.png');

// Para trocar as imagens:
// 1. Acesse o dashboard do Supabase → Storage → bucket "landing-page"
// 2. Faça upload das imagens na pasta "hero/"
// 3. Atualize os paths abaixo com o nome exato dos arquivos enviados
const heroImages = [
  {
    url: getPublicUrl(BUCKETS.LANDING_PAGE, 'hero/fachada.png'),
    title: 'Bem-vindo ao Flor do Maracujá',
  },
  {
    url: getPublicUrl(BUCKETS.LANDING_PAGE, 'hero/mesa_posta.png'),
    title: 'Receitas Caseiras',
  },
  {
    url: getPublicUrl(BUCKETS.LANDING_PAGE, 'hero/mesa_posta_2.png'),
    title: 'Referência de qualidade há mais de 15 anos',
  },
  {
    url: getPublicUrl(BUCKETS.LANDING_PAGE, 'hero/mesa_posta_3.png'),
    title: 'Planos especiais para empresas',
  },
  {
    url: getPublicUrl(BUCKETS.LANDING_PAGE, 'hero/vem_comer_banner.png'),
    title: 'No local, para viagem e delivery',
  },
];

interface HeroCarouselProps {
  onExploreClick: () => void;
  onWhatsAppClick: () => void;
}

export function HeroCarousel({ onExploreClick, onWhatsAppClick }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Images with Crossfade + Ken Burns */}
      {heroImages.map((image, index) => (
        <motion.div
          key={index}
          initial={false}
          animate={{
            opacity: index === currentSlide ? 1 : 0,
            scale: index === currentSlide ? 1.05 : 1,
          }}
          transition={{
            opacity: { duration: 0.9, ease: 'easeInOut' },
            scale: { duration: 6, ease: 'linear' },
          }}
          className="absolute inset-0"
          style={{ zIndex: index === currentSlide ? 1 : 0 }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${image.url})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        </motion.div>
      ))}

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
        {/* Logo + Name */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <img
            src={LOGO_URL}
            alt="Flor do Maracujá"
            className="mx-auto mb-4 h-24 w-24 rounded-full object-cover shadow-xl"
          />
          <h1 className="font-display text-4xl tracking-wide md:text-6xl">
            Flor do Maracujá
          </h1>
        </motion.div>

        {/* Slide Title */}
        <AnimatePresence mode="wait">
          <motion.p
            key={currentSlide}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="mb-10 text-lg font-light tracking-wide text-white/80 md:text-xl"
          >
            {heroImages[currentSlide].title}
          </motion.p>
        </AnimatePresence>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Button
            size="lg"
            className="bg-[#FFC107] text-black hover:bg-[#D4A017]"
            onClick={onExploreClick}
          >
            <UtensilsCrossed className="mr-2 h-5 w-5" />
            Explorar Cardápio
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
            onClick={onWhatsAppClick}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Pedir no WhatsApp
          </Button>
          <Button
            size="lg"
            className="bg-[#EA1D2C] text-white hover:bg-[#c9101d]"
            asChild
          >
            <a href={IFOOD_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-5 w-5" />
              Pedir no iFood
            </a>
          </Button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="cursor-pointer"
            onClick={onExploreClick}
          >
            <ChevronDown className="h-8 w-8 text-white/60" />
          </motion.div>
        </motion.div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === currentSlide
                ? 'w-6 bg-[#FFC107]'
                : 'w-1.5 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
