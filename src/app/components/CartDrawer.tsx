import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  MapPin,
  Tag,
  MessageCircle,
  ShoppingBag,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { useStore } from '../../lib/store';
import {
  formatCurrency,
  generateWhatsAppMessage,
  openWhatsApp,
  trackEvent,
} from '../../lib/utils';
import { restaurantInfo } from '../../lib/mockData';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, updateCartItem, removeFromCart, clearCart } = useStore();
  const [address, setAddress] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = promoCode === 'FLOR10' ? total * 0.1 : 0;
  const finalTotal = total - discount;

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      const item = cart.find((i) => i.id === itemId);
      if (item) {
        updateCartItem(itemId, newQuantity, item.observations);
      }
    }
  };

  const handleSendOrder = () => {
    if (cart.length === 0) return;

    const message = generateWhatsAppMessage(cart, address, promoCode);
    
    trackEvent('begin_checkout', {
      method: 'whatsapp',
      items: cart.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: finalTotal,
    });

    openWhatsApp(restaurantInfo.whatsapp, message);
    clearCart();
    onClose();
  };

  const previewMessage = () => {
    if (cart.length === 0) return '';
    
    let preview = '🌺 Olá Flor do Maracujá!\n\n';
    preview += 'Gostaria de fazer o seguinte pedido:\n\n';
    
    cart.forEach((item) => {
      preview += `• ${item.quantity}x ${item.name}\n`;
      preview += `  ${formatCurrency(item.price)} cada\n`;
      if (item.observations) {
        preview += `  📝 ${item.observations}\n`;
      }
      preview += '\n';
    });
    
    preview += `💰 Total: ${formatCurrency(finalTotal)}\n\n`;
    
    if (address) {
      preview += `📍 Endereço: ${address}\n\n`;
    }
    
    if (promoCode) {
      preview += `🎁 Código: ${promoCode}\n\n`;
    }
    
    preview += 'Aguardo confirmação! 😊';
    
    return preview;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl dark:bg-gray-900 sm:w-[450px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-[#FFC107]" />
                <h2 className="text-xl text-gray-900 dark:text-white">
                  Seu Pedido
                </h2>
                {cart.length > 0 && (
                  <span className="rounded-full bg-[#FFC107] px-2 py-1 text-xs text-black">
                    {cart.length}
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Cart Items */}
            <ScrollArea className="flex-1 p-4">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 text-6xl">🛒</div>
                  <p className="mb-2 text-lg text-gray-900 dark:text-white">
                    Carrinho Vazio
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Adicione itens do cardápio para começar seu pedido
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="rounded-lg border bg-white p-3 dark:border-gray-800 dark:bg-gray-950"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="mb-1 text-gray-900 dark:text-white">
                            {item.name}
                          </h3>
                          {item.observations && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              📝 {item.observations}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatCurrency(item.price)} cada
                          </div>
                          <div className="text-[#D4A017] dark:text-[#FFC107]">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Footer - Order Details */}
            {cart.length > 0 && (
              <div className="border-t p-4 dark:border-gray-800">
                {!showPreview ? (
                  <div className="space-y-3">
                    {/* Address Input */}
                    <div>
                      <label className="mb-1 flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                        <MapPin className="h-4 w-4" />
                        Endereço de Entrega (opcional)
                      </label>
                      <Input
                        placeholder="Rua, número, bairro..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>

                    {/* Promo Code */}
                    <div>
                      <label className="mb-1 flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                        <Tag className="h-4 w-4" />
                        Código Promocional
                      </label>
                      <Input
                        placeholder="Ex: FLOR10"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      />
                      {promoCode === 'FLOR10' && (
                        <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                          ✓ Desconto de 10% aplicado!
                        </p>
                      )}
                    </div>

                    <Separator />

                    {/* Totals */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Subtotal</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                          <span>Desconto</span>
                          <span>-{formatCurrency(discount)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg text-gray-900 dark:text-white">
                        <span>Total</span>
                        <span className="text-[#D4A017] dark:text-[#FFC107]">
                          {formatCurrency(finalTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button
                        className="w-full bg-[#FFC107] text-black hover:bg-[#D4A017]"
                        size="lg"
                        onClick={() => setShowPreview(true)}
                      >
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Visualizar Pedido
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={clearCart}
                      >
                        Limpar Carrinho
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Preview */}
                    <div className="max-h-60 overflow-y-auto rounded-lg bg-gray-50 p-3 dark:bg-gray-950">
                      <pre className="whitespace-pre-wrap text-xs text-gray-700 dark:text-gray-300">
                        {previewMessage()}
                      </pre>
                    </div>

                    {/* Confirm Buttons */}
                    <div className="space-y-2">
                      <Button
                        className="w-full bg-green-600 text-white hover:bg-green-700"
                        size="lg"
                        onClick={handleSendOrder}
                      >
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Enviar no WhatsApp
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowPreview(false)}
                      >
                        Editar Pedido
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}