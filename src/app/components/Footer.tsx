import { Heart, Instagram, MapPin, Phone, Facebook } from 'lucide-react';
import type { RestaurantInfo } from '../lib/types';
import { getPublicUrl, BUCKETS } from '../../lib/storage';

const INSTAGRAM_URL = 'https://www.instagram.com/flordomaracuja21/';
const LOGO_URL = getPublicUrl(BUCKETS.LANDING_PAGE, 'logo/logo.png');

interface FooterProps {
  info: RestaurantInfo;
}

export function Footer({ info }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* About */}
          <div>
            <div className="mb-4 flex items-center gap-2 text-2xl">
              <img src={LOGO_URL} alt="Flor do Maracujá" className="h-10 w-10 rounded-full object-cover" />
              <span>Flor do Maracujá</span>
            </div>
            <p className="mb-4 text-gray-400">
              {info.tagline}
            </p>
            <p className="mb-4 text-sm text-gray-500">
              Servindo com amor desde 2009
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Flor do Maracujá"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-gray-400 transition-all hover:scale-110 hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg">Contato</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{info.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a
                  href={`tel:${info.phone.replace(/\D/g, '')}`}
                  className="hover:text-[#FFC107]"
                >
                  {info.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="h-4 w-4 shrink-0" />
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Flor do Maracujá"
                  className="hover:text-[#FFC107]"
                >
                  {info.instagram}
                </a>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h3 className="mb-4 text-lg">Horário</h3>
            <div className="space-y-2 text-sm text-gray-400">
              {info.hours.map((hour, index) => (
                <div key={index} className="flex justify-between">
                  <span>{hour.day}</span>
                  <span>
                    {hour.open} - {hour.close}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          <p className="flex items-center justify-center gap-1">
            Feito com <Heart className="h-4 w-4 fill-red-500 text-red-500" /> para
            você
          </p>
          <p className="mt-2">
            © {currentYear} Flor do Maracujá. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
