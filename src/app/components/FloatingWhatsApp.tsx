import { motion } from 'motion/react';
import { MessageCircle, ShoppingBag } from 'lucide-react';
import { Button } from './ui/button';
import { useStore } from '../../lib/store';

interface FloatingWhatsAppProps {
  onCartClick: () => void;
  onWhatsAppClick: () => void;
}

export function FloatingWhatsApp({
  onCartClick,
  onWhatsAppClick,
}: FloatingWhatsAppProps) {
  const { cart } = useStore();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      {/* Cart Button */}
      {itemCount > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            size="lg"
            onClick={onCartClick}
            className="relative h-14 w-14 rounded-full bg-[#FFC107] p-0 text-black shadow-lg hover:bg-[#D4A017]"
          >
            <ShoppingBag className="h-6 w-6" />
            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white"
            >
              {itemCount}
            </motion.div>
          </Button>
        </motion.div>
      )}

      {/* WhatsApp Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          size="lg"
          onClick={onWhatsAppClick}
          className="h-14 w-14 rounded-full bg-green-500 p-0 shadow-lg hover:bg-green-600"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </motion.div>

      {/* Pulse Animation */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'loop',
        }}
        className="pointer-events-none absolute bottom-0 right-0 h-14 w-14 rounded-full bg-green-500"
      />
    </div>
  );
}