// Core Types for Flor do Maracujá Restaurant

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  badges?: ('bestseller' | 'new' | 'spicy')[];
  available: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
  observations?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthday?: string;
  preferences?: string;
  promoCode?: string;
  registeredAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  approved: boolean;
  avatar?: string;
}

export interface PromoBanner {
  id: string;
  title: string;
  description: string;
  image: string;
  active: boolean;
  validUntil?: string;
}

export interface OrderData {
  items: CartItem[];
  total: number;
  customerAddress?: string;
  promoCode?: string;
  timestamp: string;
}

export interface RestaurantInfo {
  name: string;
  tagline: string;
  about: string;
  address: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  hours: {
    day: string;
    open: string;
    close: string;
  }[];
}
