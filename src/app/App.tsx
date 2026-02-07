import { useEffect, useState } from 'react';
import { Toaster } from './components/ui/sonner';
import { Navigation } from './components/Navigation';
import { HeroCarousel } from './components/HeroCarousel';
import { AboutSection } from './components/AboutSection';
import { MenuSection } from './components/MenuSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { LocationSection } from './components/LocationSection';
import { ClienteEspecialForm } from './components/ClienteEspecialForm';
import { PromoBanners } from './components/PromoBanners';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { useStore } from '../lib/store';
import { usePublicMenu } from '../hooks/usePublicMenu';
import { usePublicPromoBanners } from '../hooks/usePublicPromoBanners';
import {
  mockMenuItems,
  mockTestimonials,
  mockPromoBanners,
  restaurantInfo,
} from '../lib/mockData';
import { openWhatsApp, trackEvent } from '../lib/utils';

export default function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { menuItems, setMenuItems, testimonials } = useStore();

  // Fetch from Supabase
  const { items: supabaseMenu, loading: menuLoading } = usePublicMenu();
  const { banners: supabaseBanners, loading: bannersLoading } = usePublicPromoBanners();

  // Sync Supabase menu data into the Zustand store (used by the cart)
  useEffect(() => {
    if (supabaseMenu.length > 0) {
      setMenuItems(supabaseMenu);
    }
  }, [supabaseMenu, setMenuItems]);

  // Display data: Supabase first, fallback to mock if DB is empty
  const displayMenuItems =
    supabaseMenu.length > 0 ? supabaseMenu : (menuItems.length > 0 ? menuItems : mockMenuItems);
  const displayBanners =
    supabaseBanners.length > 0 ? supabaseBanners : mockPromoBanners;
  const displayTestimonials =
    testimonials.length > 0 ? testimonials : mockTestimonials;

  const handleNavigate = (section: string) => {
    const element = document.getElementById(section);
    if (element) {
      const offset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    } else if (section === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleWhatsAppClick = () => {
    trackEvent('whatsapp_direct_click', {
      source: 'floating_button',
    });
    
    const message = encodeURIComponent(
      'Olá Flor do Maracujá! 🌺\n\nGostaria de fazer um pedido ou tirar uma dúvida.'
    );
    
    openWhatsApp(restaurantInfo.whatsapp, message);
  };

  const handleExploreMenu = () => {
    handleNavigate('cardapio');
    trackEvent('explore_menu_click', {
      source: 'hero_banner',
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <Navigation onNavigate={handleNavigate} />

      {/* Hero Section */}
      <div id="hero">
        <HeroCarousel
          onExploreClick={handleExploreMenu}
          onWhatsAppClick={handleWhatsAppClick}
        />
      </div>

      {/* Promo Banners */}
      <PromoBanners banners={displayBanners} />

      {/* About Section */}
      <AboutSection />

      {/* Menu Section */}
      <MenuSection menuItems={displayMenuItems} />

      {/* Cliente Especial Form */}
      <ClienteEspecialForm />

      {/* Testimonials */}
      <TestimonialsSection testimonials={displayTestimonials} />

      {/* Location */}
      <LocationSection info={restaurantInfo} />

      {/* Footer */}
      <Footer info={restaurantInfo} />

      {/* Floating WhatsApp & Cart */}
      <FloatingWhatsApp
        onCartClick={() => setIsCartOpen(true)}
        onWhatsAppClick={handleWhatsAppClick}
      />

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Toast Notifications */}
      <Toaster position="top-center" />
    </div>
  );
}