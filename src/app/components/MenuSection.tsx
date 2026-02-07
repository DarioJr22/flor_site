import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import {
  Plus,
  Minus,
  ShoppingCart,
  Flame,
  Star,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { useStore } from '../../lib/store';
import { formatCurrency, getCategoryIcon, trackEvent } from '../../lib/utils';
import type { MenuItem } from '../../lib/types';

interface MenuSectionProps {
  menuItems: MenuItem[];
}
const IFOOD_URL = 'https://www.ifood.com.br/delivery/recife-pe/flor-do-maracuja-imbiribeira/e1a8cc86-aee4-4e93-8d4a-3f253b9df32c?utm_medium=share&utm_source=ig&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGn7kwG0ZsoqkBsMtYVQRzbH3TaPCfZ1WpnZclazgwt2CqygfYHM5IVEo9soBQ_aem_R-i7y_Swrc9Om3_6g_55pA';

export function MenuSection({ menuItems }: MenuSectionProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [observations, setObservations] = useState<Record<string, string>>({});
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const { addToCart } = useStore();

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['Todos', ...new Set(menuItems.map((item) => item.category))];
    return cats;
  }, [menuItems]);

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (activeCategory === 'Todos') return menuItems;
    return menuItems.filter((item) => item.category === activeCategory);
  }, [activeCategory, menuItems]);

  const handleQuantityChange = (itemId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[itemId] || 1;
      const newValue = Math.max(1, Math.min(10, current + delta));
      return { ...prev, [itemId]: newValue };
    });
  };

  const handleAddToCart = (item: MenuItem) => {
    const quantity = quantities[item.id] || 1;
    const obs = observations[item.id];

    addToCart(item, quantity, obs);
    
    // Track event
    trackEvent('add_to_cart', {
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity,
    });

    // Reset
    setQuantities((prev) => ({ ...prev, [item.id]: 1 }));
    setObservations((prev) => ({ ...prev, [item.id]: '' }));
    setExpandedItem(null);

    // Show success feedback (could use toast here)
    console.log('Added to cart:', item.name);
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'bestseller':
        return <Star className="h-3 w-3" />;
      case 'new':
        return <Sparkles className="h-3 w-3" />;
      case 'spicy':
        return <Flame className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getBadgeLabel = (badge: string) => {
    switch (badge) {
      case 'bestseller':
        return 'Mais Pedido';
      case 'new':
        return 'Novidade';
      case 'spicy':
        return 'Picante';
      default:
        return badge;
    }
  };

  return (
    <section
      ref={ref}
      id="cardapio"
      className="bg-gray-50 py-20 dark:bg-gray-950"
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
            Nosso Cardápio
          </div>
          <h2 className="mb-4 text-4xl text-gray-900 dark:text-white md:text-5xl">
            Sabores que Conquistam
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Cada prato é preparado com ingredientes frescos e muito amor
          </p>
          <div className="mt-6">
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
          </div>
        </motion.div>

        {/* Category Filter - Sticky on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="sticky top-0 z-30 -mx-4 mb-8 bg-gray-50/95 px-4 py-4 backdrop-blur-sm dark:bg-gray-950/95 md:static md:bg-transparent md:backdrop-blur-none"
        >
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2 md:justify-center md:overflow-visible">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setActiveCategory(category);
                  trackEvent('menu_category_view', { category });
                }}
                className={
                  activeCategory === category
                    ? 'shrink-0 bg-[#FFC107] text-black hover:bg-[#D4A017]'
                    : 'shrink-0'
                }
              >
                <span className="mr-1">{getCategoryIcon(category)}</span>
                {category}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Menu Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.05, duration: 0.5 }}
            >
              <Card className="group overflow-hidden transition-shadow hover:shadow-xl">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Badges */}
                  {item.badges && item.badges.length > 0 && (
                    <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                      {item.badges.map((badge) => (
                        <Badge
                          key={badge}
                          variant="secondary"
                          className="flex items-center gap-1 bg-black/70 text-white backdrop-blur-sm"
                        >
                          {getBadgeIcon(badge)}
                          {getBadgeLabel(badge)}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Price Tag */}
                  <div className="absolute bottom-2 right-2 rounded-full bg-[#FFC107] px-3 py-1 shadow-lg">
                    <span className="text-lg text-black">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="mb-2 text-xl text-gray-900 dark:text-white">
                    {item.name}
                  </h3>
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>

                  {/* Expanded Options */}
                  {expandedItem === item.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 space-y-3"
                    >
                      {/* Quantity Selector */}
                      <div className="flex items-center justify-between rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Quantidade:
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleQuantityChange(item.id, -1)}
                            disabled={(quantities[item.id] || 1) <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">
                            {quantities[item.id] || 1}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleQuantityChange(item.id, 1)}
                            disabled={(quantities[item.id] || 1) >= 10}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Observations */}
                      <Textarea
                        placeholder="Observações (ex: sem cebola, ponto da carne...)"
                        value={observations[item.id] || ''}
                        onChange={(e) =>
                          setObservations((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                        className="text-sm"
                        rows={2}
                      />
                    </motion.div>
                  )}

                  {/* Action Button */}
                  {expandedItem === item.id ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedItem(null)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-[#FFC107] text-black hover:bg-[#D4A017]"
                        onClick={() => handleAddToCart(item)}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Adicionar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-[#FFC107] text-black hover:bg-[#D4A017]"
                      onClick={() => setExpandedItem(item.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Escolher Opções
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}