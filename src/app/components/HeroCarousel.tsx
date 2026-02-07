import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MessageCircle, UtensilsCrossed, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

const IFOOD_URL = 'https://www.ifood.com.br/delivery/porto-velho-ro/flor-do-maracuja';

const heroImages = [
  {
    url: 'https://images.unsplash.com/photo-1675106643937-791e74751488?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
    title: 'Sabores Autênticos',
    subtitle: 'Da Cozinha Regional Brasileira',
  },
  {
    url: 'https://images.unsplash.com/photo-1762305194194-6896afafecb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
    title: 'Moqueca Capixaba',
    subtitle: 'Receita Tradicional da Família',
  },
  {
    url: 'https://images.unsplash.com/photo-1663213990116-a43ddb308859?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
    title: 'Picanha Premium',
    subtitle: 'Grelhada no Ponto Perfeito',
  },
  {
    url: 'https://images.unsplash.com/photo-1759893497816-129ce94f1b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
    title: 'Ambiente Acolhedor',
    subtitle: 'Onde Cada Refeição é uma Celebração',
  },
];

interface HeroCarouselProps {
  onExploreClick: () => void;
  onWhatsAppClick: () => void;
}

export function HeroCarousel({ onExploreClick, onWhatsAppClick }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [typedText, setTypedText] = useState('');
  const fullText = 'Flor do Maracujá';

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Typing effect
  useEffect(() => {
    setTypedText('');
    let currentIndex = 0;
    const typingTimer = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingTimer);
      }
    }, 100);

    return () => clearInterval(typingTimer);
  }, [currentSlide]);

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
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </motion.div>
      ))}

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
        {/* Animated Logo/Title */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-4"
        >
          <div className="mb-4 flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <span className="text-6xl">🌺</span>
            </motion.div>
          </div>
          <h1 className="font-display mb-2 text-5xl md:text-7xl">
            {typedText}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="ml-1 inline-block"
            >
              |
            </motion.span>
          </h1>
          <p className="text-xl text-[#FFC107] md:text-2xl">
            Cozinha Regional com Sabor de Casa
          </p>
        </motion.div>

        {/* Slide Title Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mb-8 max-w-2xl"
          >
            <h2 className="mb-2 text-3xl md:text-5xl">
              {heroImages[currentSlide].title}
            </h2>
            <p className="text-lg text-gray-300 md:text-xl">
              {heroImages[currentSlide].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex flex-col gap-4 sm:flex-row"
        >
          <Button
            size="lg"
            className="group bg-[#FFC107] text-black hover:bg-[#D4A017]"
            onClick={onExploreClick}
          >
            <UtensilsCrossed className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
            Explorar Cardápio
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
            onClick={onWhatsAppClick}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Pedir no WhatsApp
          </Button>
          <Button
            size="lg"
            className="group bg-[#EA1D2C] text-white hover:bg-[#c9101d]"
            asChild
          >
            <a
              href={IFOOD_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              Ver cardápio no iFood
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
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="cursor-pointer"
            onClick={onExploreClick}
          >
            <ChevronDown className="h-10 w-10 text-[#FFC107]" />
          </motion.div>
        </motion.div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-24 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide
                ? 'w-8 bg-[#FFC107]'
                : 'w-2 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
