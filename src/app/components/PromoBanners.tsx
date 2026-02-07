import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import type { PromoBanner } from '../lib/types';

interface PromoBannersProps {
  banners: PromoBanner[];
}

export function PromoBanners({ banners }: PromoBannersProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeBanners = banners.filter((b) => b.active);

  useEffect(() => {
    if (activeBanners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const nextBanner = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const prevBanner = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? activeBanners.length - 1 : prev - 1
    );
  };

  return (
    <section className="relative overflow-hidden bg-gray-900 py-12">
      {/* Background Images with Crossfade (same as Hero) */}
      {activeBanners.map((banner, index) => (
        <motion.div
          key={banner.id}
          initial={false}
          animate={{
            opacity: index === currentIndex ? 1 : 0,
            scale: index === currentIndex ? 1.03 : 1,
          }}
          transition={{
            opacity: { duration: 0.9, ease: 'easeInOut' },
            scale: { duration: 5, ease: 'linear' },
          }}
          className="absolute inset-0"
          style={{ zIndex: index === currentIndex ? 1 : 0 }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${banner.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
        </motion.div>
      ))}

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4">
        <div className="flex min-h-[200px] items-center justify-between gap-8">
          <div className="max-w-2xl text-white">
            <motion.h3
              key={`title-${currentIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-3 text-3xl md:text-4xl"
            >
              {activeBanners[currentIndex].title}
            </motion.h3>
            <motion.p
              key={`desc-${currentIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-4 text-lg opacity-90"
            >
              {activeBanners[currentIndex].description}
            </motion.p>
            {activeBanners[currentIndex].validUntil && (
              <motion.p
                key={`valid-${currentIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-sm text-[#FFC107]"
              >
                Válido até{' '}
                {new Date(
                  activeBanners[currentIndex].validUntil!
                ).toLocaleDateString('pt-BR')}
              </motion.p>
            )}
          </div>

          {/* Navigation */}
          {activeBanners.length > 1 && (
            <div className="hidden gap-2 md:flex">
              <Button
                variant="outline"
                size="icon"
                onClick={prevBanner}
                className="border-white bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextBanner}
                className="border-white bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Indicators */}
      {activeBanners.length > 1 && (
        <div className="container relative z-10 mx-auto mt-4 px-4">
          <div className="flex justify-center gap-2 md:justify-start">
            {activeBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-[#FFC107]'
                    : 'w-1 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
