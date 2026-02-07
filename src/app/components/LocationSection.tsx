import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import {
  MapPin,
  Phone,
  Clock,
  Instagram,
  ExternalLink,
  Navigation,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { isRestaurantOpen } from '../../lib/utils';
import type { RestaurantInfo } from '../../lib/types';

interface LocationSectionProps {
  info: RestaurantInfo;
}

export function LocationSection({ info }: LocationSectionProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const isOpen = isRestaurantOpen();

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${info.coordinates.lat},${info.coordinates.lng}`;
    window.open(url, '_blank');
  };

  const handleCall = () => {
    window.location.href = `tel:${info.phone.replace(/\D/g, '')}`;
  };

  const handleInstagram = () => {
    window.open('https://www.instagram.com/flordomaracuja21/', '_blank');
  };

  return (
    <section
      ref={ref}
      id="localizacao"
      className="bg-white py-20 dark:bg-gray-900"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-block rounded-full bg-[#FFC107]/20 px-4 py-2 text-sm text-[#D4A017] dark:text-[#FFC107]">
            Localização
          </div>
          <h2 className="mb-4 text-4xl text-gray-900 dark:text-white md:text-5xl">
            Venha Nos Visitar
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Estamos te esperando de braços abertos!
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative h-[400px] overflow-hidden rounded-2xl shadow-lg"
          >
            {/* Placeholder for Google Maps - In production, use @react-google-maps/api */}
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800">
              <iframe
                src={`https://www.google.com/maps?q=${info.coordinates.lat},${info.coordinates.lng}&hl=pt-BR&z=15&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização do restaurante"
              />
            </div>

            {/* Floating Card on Map */}
            <div className="absolute bottom-4 left-4 right-4">
              <Card className="border-[#FFC107]/20 bg-white/95 p-4 backdrop-blur-sm dark:bg-gray-900/95">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg text-gray-900 dark:text-white">
                    {info.name}
                  </h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      isOpen
                        ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                        : 'bg-red-500/20 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {isOpen ? '● Aberto' : '● Fechado'}
                  </span>
                </div>
                <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                  {info.address}
                </p>
                <Button
                  size="sm"
                  className="w-full bg-[#FFC107] text-black hover:bg-[#D4A017]"
                  onClick={handleDirections}
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  Como Chegar
                </Button>
              </Card>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-6"
          >
            {/* Address */}
            <Card className="border-[#FFC107]/20 p-6">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFC107]/20">
                  <MapPin className="h-5 w-5 text-[#D4A017] dark:text-[#FFC107]" />
                </div>
                <h3 className="text-lg text-gray-900 dark:text-white">
                  Endereço
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{info.address}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleDirections}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir no Maps
              </Button>
            </Card>

            {/* Phone */}
            <Card className="border-[#FFC107]/20 p-6">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFC107]/20">
                  <Phone className="h-5 w-5 text-[#D4A017] dark:text-[#FFC107]" />
                </div>
                <h3 className="text-lg text-gray-900 dark:text-white">
                  Telefone
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{info.phone}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleCall}
              >
                <Phone className="mr-2 h-4 w-4" />
                Ligar Agora
              </Button>
            </Card>

            {/* Hours */}
            <Card className="border-[#FFC107]/20 p-6">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFC107]/20">
                  <Clock className="h-5 w-5 text-[#D4A017] dark:text-[#FFC107]" />
                </div>
                <h3 className="text-lg text-gray-900 dark:text-white">
                  Horário de Funcionamento
                </h3>
              </div>
              <div className="space-y-2">
                {info.hours.map((hour, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span>{hour.day}</span>
                    <span>
                      {hour.open} - {hour.close}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Instagram */}
            <Card className="border-[#FFC107]/20 p-6">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFC107]/20">
                  <Instagram className="h-5 w-5 text-[#D4A017] dark:text-[#FFC107]" />
                </div>
                <h3 className="text-lg text-gray-900 dark:text-white">
                  Redes Sociais
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{info.instagram}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleInstagram}
              >
                <Instagram className="mr-2 h-4 w-4" />
                Seguir no Instagram
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}