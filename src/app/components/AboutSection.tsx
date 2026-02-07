import { useRef } from 'react';
import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { Award, Heart, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const aboutImages = [
  {
    url: 'https://images.unsplash.com/photo-1512149519538-136d1b8c574a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    caption: 'Nossa cozinha autêntica',
  },
  {
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    caption: 'Ambiente acolhedor',
  },
  {
    url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    caption: 'Detalhes que fazem a diferença',
  },
  {
    url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    caption: 'Pratos com apresentação especial',
  },
  {
    url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    caption: 'Tradição e sabor em cada detalhe',
  },
];

function ArrowButton({
  direction,
  onClick,
}: {
  direction: 'left' | 'right';
  onClick?: () => void;
}) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      className={`absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-colors hover:bg-[#FFC107] hover:text-black ${
        direction === 'left' ? 'left-3' : 'right-3'
      }`}
      aria-label={direction === 'left' ? 'Anterior' : 'Próximo'}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

export function AboutSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const sliderRef = useRef<Slider>(null);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    fade: true,
    cssEase: 'ease-in-out',
    arrows: false,
    appendDots: (dots: React.ReactNode) => (
      <div style={{ bottom: '12px' }}>
        <ul className="flex items-center justify-center gap-2">{dots}</ul>
      </div>
    ),
    customPaging: () => (
      <div className="h-2 w-2 rounded-full bg-white/50 transition-all duration-300 [.slick-active_&]:w-6 [.slick-active_&]:bg-[#FFC107]" />
    ),
  };

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
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <Slider ref={sliderRef} {...sliderSettings}>
                {aboutImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.url}
                      alt={image.caption}
                      className="h-[350px] w-full object-cover sm:h-[420px] md:h-[500px]"
                    />
                    {/* Caption overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-10 pt-16">
                      <p className="text-center text-sm font-medium text-white">
                        {image.caption}
                      </p>
                    </div>
                  </div>
                ))}
              </Slider>

              {/* Custom Navigation Arrows */}
              <ArrowButton
                direction="left"
                onClick={() => sliderRef.current?.slickPrev()}
              />
              <ArrowButton
                direction="right"
                onClick={() => sliderRef.current?.slickNext()}
              />

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
