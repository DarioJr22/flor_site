import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { Gift, Sparkles, X, Check } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';

export function ClienteEspecialForm() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthday: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { addCustomer } = useStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format phone as user types
    if (name === 'phone') {
      const formatted = value.replace(/\D/g, '');
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'WhatsApp é obrigatório';
    } else if (formData.phone.length < 10) {
      newErrors.phone = 'Número inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    // Create customer
    const customer = {
      id: generateId(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      birthday: formData.birthday || undefined,
      promoCode: 'FLOR10',
      registeredAt: new Date().toISOString(),
    };

    addCustomer(customer);

    // Track event
    trackEvent('sign_up', { method: 'lead_form' });
    trackEvent('generate_lead', { form_name: 'Cliente Especial' });

    // Show success
    setShowSuccess(true);

    // Reset form after delay
    setTimeout(() => {
      setShowSuccess(false);
      setIsOpen(false);
      setFormData({ name: '', email: '', phone: '', birthday: '' });
    }, 3000);
  };

  return (
    <>
      <section
        ref={ref}
        className="relative overflow-hidden bg-gradient-to-br from-[#FFC107] to-[#D4A017] py-20"
      >
        {/* Animated Background Elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -left-20 top-0 h-40 w-40 rounded-full bg-white/10"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -right-20 bottom-0 h-60 w-60 rounded-full bg-white/10"
        />

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center text-white"
          >
            {/* Icon */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="mb-6 inline-block"
            >
              <div className="rounded-full bg-white/20 p-6 backdrop-blur-sm">
                <Gift className="h-16 w-16" />
              </div>
            </motion.div>

            <h2 className="mb-4 text-4xl md:text-5xl">
              Seja um Cliente Especial
            </h2>

            <p className="mb-8 text-xl opacity-90">
              Cadastre-se e ganhe <strong>10% de desconto</strong> no seu primeiro
              pedido, mais promoções exclusivas e um brinde especial no mês do seu
              aniversário! 🎉
            </p>

            {/* Benefits */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: '🎁', text: '10% OFF no 1º Pedido' },
                { icon: '🎂', text: 'Brinde de Aniversário' },
                { icon: '⭐', text: 'Promoções Exclusivas' },
              ].map((benefit, index) => (
                <motion.div
                  key={benefit.text}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                  className="rounded-lg bg-white/10 p-4 backdrop-blur-sm"
                >
                  <div className="mb-2 text-3xl">{benefit.icon}</div>
                  <p className="text-sm">{benefit.text}</p>
                </motion.div>
              ))}
            </div>

            <Button
              size="lg"
              onClick={() => setIsOpen(true)}
              className="bg-white text-[#D4A017] hover:bg-gray-100"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Quero Me Cadastrar
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Modal Form */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <AnimatePresence mode="wait">
            {!showSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="mb-6 text-center">
                  <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#FFC107]/20">
                    <Gift className="h-8 w-8 text-[#D4A017]" />
                  </div>
                  <h3 className="mb-2 text-2xl text-gray-900 dark:text-white">
                    Seja um Cliente Especial
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Preencha seus dados e ganhe 10% OFF
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Seu nome"
                      value={formData.name}
                      onChange={handleChange}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone">WhatsApp *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="(11) 98765-4321"
                      value={formatPhone(formData.phone)}
                      onChange={handleChange}
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                    )}
                  </div>

                  {/* Birthday */}
                  <div>
                    <Label htmlFor="birthday">
                      Data de Nascimento (Opcional)
                    </Label>
                    <Input
                      id="birthday"
                      name="birthday"
                      type="date"
                      value={formData.birthday}
                      onChange={handleChange}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Para receber um brinde especial no seu aniversário
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#FFC107] text-black hover:bg-[#D4A017]"
                  >
                    <Gift className="mr-2 h-4 w-4" />
                    Cadastrar e Ganhar Desconto
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="py-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500"
                >
                  <Check className="h-10 w-10 text-white" />
                </motion.div>

                <h3 className="mb-2 text-2xl text-gray-900 dark:text-white">
                  Cadastro Realizado!
                </h3>

                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  Seu código de desconto é:
                </p>

                <div className="mx-auto mb-6 inline-block rounded-lg bg-[#FFC107] px-6 py-3">
                  <code className="text-2xl text-black">FLOR10</code>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use este código no seu primeiro pedido!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Utility Functions
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function formatPhone(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XX) XXXXX-XXXX
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
}

function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  // Send event to analytics service if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, properties);
  }
}