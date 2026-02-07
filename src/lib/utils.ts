import type { CartItem } from './types';

/**
 * Format currency to Brazilian Real
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Generate WhatsApp message from cart
 */
export const generateWhatsAppMessage = (
  cart: CartItem[],
  address?: string,
  promoCode?: string
): string => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  let message = '*Olá Flor do Maracujá!* 🌺\n\n';
  message += 'Gostaria de fazer o seguinte pedido:\n\n';
  
  cart.forEach((item) => {
    message += `• *${item.quantity}x ${item.name}*\n`;
    message += `  ${formatCurrency(item.price)} cada\n`;
    if (item.observations) {
      message += `  📝 Obs: ${item.observations}\n`;
    }
    message += '\n';
  });
  
  message += `*Total:* ${formatCurrency(total)}\n\n`;
  
  if (address) {
    message += `📍 *Endereço:* ${address}\n\n`;
  }
  
  if (promoCode) {
    message += `🎁 *Código promocional:* ${promoCode}\n\n`;
  }
  
  message += 'Aguardo confirmação! 😊';
  
  return encodeURIComponent(message);
};

/**
 * Open WhatsApp with pre-filled message
 */
export const openWhatsApp = (phone: string, message: string): void => {
  const url = `https://wa.me/${phone}?text=${message}`;
  window.open(url, '_blank');
};

/**
 * Track Google Analytics event
 * //TODO: Trackear no google analitycs
 */
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, any>
): void => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, parameters);
  } else {
    // Fallback for development
    console.log('GA Event:', eventName, parameters);
  }
};

/**
 * Get user's current location
 * //TODO: Trackear no google analitycs
 */
export const getUserLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

/**
 * Check if restaurant is currently open
 */
export const isRestaurantOpen = (): boolean => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  // Example logic - adjust based on real hours
  if (currentDay >= 1 && currentDay <= 5) {
    // Monday to Friday
    return (
      (currentTime >= 11 * 60 && currentTime < 15 * 60) || // 11:00 - 15:00
      (currentTime >= 18 * 60 && currentTime < 22 * 60)    // 18:00 - 22:00
    );
  } else if (currentDay === 6) {
    // Saturday
    return (
      (currentTime >= 11 * 60 && currentTime < 16 * 60) || // 11:00 - 16:00
      (currentTime >= 18 * 60 && currentTime < 23 * 60)    // 18:00 - 23:00
    );
  } else if (currentDay === 0) {
    // Sunday
    return currentTime >= 11 * 60 && currentTime < 16 * 60; // 11:00 - 16:00
  }
  
  return false;
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Format phone number
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};

/**
 * Get category icon
 */
export const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'Pratos Principais': '🍲',
    'Entradas': '🥟',
    'Bebidas': '🥤',
    'Sobremesas': '🍰',
  };
  
  return icons[category] || '🍽️';
};
