import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Testimonial } from '../../lib/types';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  // Filter approved testimonials
  const approvedTestimonials = testimonials.filter((t) => t.approved);

  if (approvedTestimonials.length === 0) {
    return null;
  }

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % approvedTestimonials.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + approvedTestimonials.length) % approvedTestimonials.length
    );
  };

  const currentTestimonial = approvedTestimonials[currentIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.5,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.5,
      rotateY: direction < 0 ? 45 : -45,
    }),
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section
      id="depoimentos"
      ref={ref}
      className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="max-w-6xl mx-auto"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-3 bg-[#FFC107]/10 dark:bg-[#FFC107]/20 rounded-full mb-4">
              <Quote className="w-8 h-8 text-[#FFC107]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              O que dizem nossos clientes
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Experiências reais de quem já provou nossa cozinha regional
            </p>
          </motion.div>

          {/* 3D Carousel */}
          <motion.div
            variants={itemVariants}
            className="relative"
            style={{ perspective: '1000px' }}
          >
            <div className="relative h-[500px] md:h-[400px] flex items-center justify-center">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: 'spring', stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                    scale: { duration: 0.3 },
                    rotateY: { duration: 0.3 },
                  }}
                  className="absolute w-full max-w-3xl"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 mx-4">
                    {/* Quote Icon */}
                    <div className="flex justify-center mb-6">
                      <div className="p-4 bg-[#FFC107]/10 dark:bg-[#FFC107]/20 rounded-full">
                        <Quote className="w-12 h-12 text-[#FFC107]" />
                      </div>
                    </div>

                    {/* Comment */}
                    <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 text-center mb-8 leading-relaxed italic">
                      "{currentTestimonial.comment}"
                    </p>

                    {/* Rating */}
                    <div className="flex justify-center gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 ${
                            i < currentTestimonial.rating
                              ? 'text-[#FFC107] fill-[#FFC107]'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Author */}
                    <div className="flex items-center justify-center gap-4">
                      {currentTestimonial.avatar && (
                        <img
                          src={currentTestimonial.avatar}
                          alt={currentTestimonial.name}
                          className="w-16 h-16 rounded-full border-4 border-[#FFC107]/30"
                        />
                      )}
                      <div className="text-center">
                        <p className="font-bold text-lg text-gray-900 dark:text-white">
                          {currentTestimonial.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(currentTestimonial.date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            {approvedTestimonials.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-[#FFC107] hover:text-white dark:hover:bg-[#FFC107] transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#FFC107] focus:ring-offset-2"
                  aria-label="Depoimento anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-[#FFC107] hover:text-white dark:hover:bg-[#FFC107] transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#FFC107] focus:ring-offset-2"
                  aria-label="Próximo depoimento"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Dots Indicator */}
            {approvedTestimonials.length > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {approvedTestimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setDirection(index > currentIndex ? 1 : -1);
                      setCurrentIndex(index);
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'bg-[#FFC107] w-8'
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-[#FFC107]/50'
                    }`}
                    aria-label={`Ir para depoimento ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
          >
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
              <div className="text-4xl font-bold text-[#FFC107] mb-2">
                {approvedTestimonials.length}+
              </div>
              <div className="text-gray-600 dark:text-gray-300">Avaliações</div>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
              <div className="text-4xl font-bold text-[#FFC107] mb-2 flex items-center justify-center gap-2">
                {(
                  approvedTestimonials.reduce((acc, t) => acc + t.rating, 0) /
                  approvedTestimonials.length
                ).toFixed(1)}
                <Star className="w-8 h-8 fill-[#FFC107] text-[#FFC107]" />
              </div>
              <div className="text-gray-600 dark:text-gray-300">Nota Média</div>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
              <div className="text-4xl font-bold text-[#FFC107] mb-2">
                {Math.round(
                  (approvedTestimonials.filter((t) => t.rating === 5).length /
                    approvedTestimonials.length) *
                    100
                )}
                %
              </div>
              <div className="text-gray-600 dark:text-gray-300">5 Estrelas</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
