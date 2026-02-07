import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { Award, Heart, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTransformedUrl, BUCKETS } from '../../lib/storage';

// Imagens otimizadas: redimensionadas no servidor para 800×600 com qualidade 75
const aboutImages = [
  {
    url: getTransformedUrl(BUCKETS.LANDING_PAGE, 'about/ambiente.png', { width: 800, height: 600, quality: 75 }),
    caption: 'Nossa cozinha autêntica',
  },
  {
    url: getTransformedUrl(BUCKETS.LANDING_PAGE, 'about/ambiente.png', { width: 800, height: 600, quality: 75 }),
    caption: 'Ambiente acolhedor',
  },
  {
    url: getTransformedUrl(BUCKETS.LANDING_PAGE, 'about/ambiente.png', { width: 800, height: 600, quality: 75 }),
    caption: 'Detalhes que fazem a diferença',
  },
  {
    url: getTransformedUrl(BUCKETS.LANDING_PAGE, 'about/ambiente.png', { width: 800, height: 600, quality: 75 }),
    caption: 'Pratos com apresentação especial',
  },
  {
    url: getTransformedUrl(BUCKETS.LANDING_PAGE, 'about/ambiente.png', { width: 800, height: 600, quality: 75 }),
    caption: 'Tradição e sabor em cada detalhe',
  },
];

export function AboutSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const nextSlide = useCallback(
    () => setCurrentSlide((prev) => (prev + 1) % aboutImages.length),
    [],
  );
  const prevSlide = useCallback(
    () => setCurrentSlide((prev) => (prev - 1 + aboutImages.length) % aboutImages.length),
    [],
  );

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const features = [
    {
      icon: Heart,
      title: 'Receitas Tradicionais',
      description: 'Passadas de geração em geração',
    },
    {
      icon: Users,
      title: 'Atendimento Familiar',
      description: 'Você é tratado como parte da família',
    },
    {
      icon: Award,
      title: '15 Anos de Tradição',
      description: 'Excelência reconhecida pela comunidade',
    },
  ];

  return (
    <section ref={ref} className="relative overflow-hidden bg-white py-20 dark:bg-gray-900">
      {/* Decorative Elements */}
      <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-[#FFC107]/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[#D4A017]/10 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Image Carousel Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative h-[350px] overflow-hidden rounded-2xl shadow-2xl sm:h-[420px] md:h-[500px]">
              {/* Crossfade images — all mounted, only active is visible */}
              {aboutImages.map((image, index) => (
                <motion.div
                  key={index}
                  initial={false}
                  animate={{ opacity: index === currentSlide ? 1 : 0 }}
                  transition={{ duration: 0.7, ease: 'easeInOut' }}
                  className="absolute inset-0"
                  style={{ zIndex: index === currentSlide ? 1 : 0 }}
                >
                  <img
                    src={image.url}
                    alt={image.caption}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  {/* Caption overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-10 pt-16">
                    <p className="text-center text-sm font-medium text-white">
                      {image.caption}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-colors hover:bg-[#FFC107] hover:text-black"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-colors hover:bg-[#FFC107] hover:text-black"
                aria-label="Próximo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Dot indicators */}
              <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                {aboutImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? 'w-6 bg-[#FFC107]'
                        : 'w-2 bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Ir para slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Selo */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={inView ? { scale: 1, rotate: 0 } : {}}
                transition={{ delay: 0.5, duration: 0.6, type: 'spring' }}
                className="absolute right-4 top-4 z-10 rounded-full bg-[#FFC107] p-4 shadow-lg"
              >
                <div className="text-center">
                  <div className="text-2xl">🏆</div>
                  <div className="text-xs font-bold text-black">Cozinha</div>
                  <div className="text-xs font-bold text-black">Autêntica</div>
                </div>
              </motion.div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -left-4 top-1/2 text-6xl"
            >
              🌶️
            </motion.div>
            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              className="absolute -right-4 bottom-1/4 text-6xl"
            >
              🥘
            </motion.div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="mb-4 inline-block rounded-full bg-[#FFC107]/20 px-4 py-2 text-sm text-[#D4A017] dark:text-[#FFC107]">
              Sobre Nós
            </div>

            <h2 className="mb-6 text-4xl text-gray-900 dark:text-white md:text-5xl">
              Nossa História de{' '}
              <span className="text-[#D4A017] dark:text-[#FFC107]">
                Sabor e Tradição
              </span>
            </h2>

            <p className="mb-6 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              Há mais de 15 anos servindo o melhor da culinária regional brasileira
              com receitas passadas de geração em geração. Aqui, cada prato conta uma
              história de amor, tradição e sabores autênticos que aquecem o coração.
            </p>

            <blockquote className="mb-8 border-l-4 border-[#FFC107] bg-gray-50 p-4 italic dark:bg-gray-800">
              <p className="mb-2 text-gray-700 dark:text-gray-300">
                "Cozinhar é um ato de amor. Cada prato que sai da nossa cozinha leva um
                pedaço da nossa história e muito carinho."
              </p>
              <footer className="text-sm text-[#D4A017] dark:text-[#FFC107]">
                — Dona Maria, Fundadora
              </footer>
            </blockquote>

            {/* Features Grid */}
            <div className="grid gap-6 sm:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#FFC107]/20">
                    <feature.icon className="h-6 w-6 text-[#D4A017] dark:text-[#FFC107]" />
                  </div>
                  <h3 className="mb-1 text-sm text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
