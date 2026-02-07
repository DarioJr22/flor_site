import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, MenuItem, Customer, Testimonial, PromoBanner } from './types';

interface AppState {
  // Cart
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity: number, observations?: string) => void;
  updateCartItem: (id: string, quantity: number, observations?: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Admin Auth (simple)
  isAdminAuthenticated: boolean;
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
  
  // Menu Items
  menuItems: MenuItem[];
  setMenuItems: (items: MenuItem[]) => void;
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  
  // Customers
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  
  // Testimonials
  testimonials: Testimonial[];
  addTestimonial: (testimonial: Testimonial) => void;
  updateTestimonial: (id: string, updates: Partial<Testimonial>) => void;
  deleteTestimonial: (id: string) => void;
  
  // Promo Banners
  promoBanners: PromoBanner[];
  addPromoBanner: (banner: PromoBanner) => void;
  updatePromoBanner: (id: string, updates: Partial<PromoBanner>) => void;
  deletePromoBanner: (id: string) => void;
}

// Simple password check (in production, this would be on the backend)
const ADMIN_PASSWORD = 'flor2024';

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Cart State
      cart: [],
      
      addToCart: (item, quantity, observations) => {
        const existingItem = get().cart.find((i) => i.id === item.id);
        
        if (existingItem) {
          set((state) => ({
            cart: state.cart.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + quantity, observations }
                : i
            ),
          }));
        } else {
          set((state) => ({
            cart: [...state.cart, { ...item, quantity, observations }],
          }));
        }
      },
      
      updateCartItem: (id, quantity, observations) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
          return;
        }
        
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id ? { ...item, quantity, observations } : item
          ),
        }));
      },
      
      removeFromCart: (id) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        }));
      },
      
      clearCart: () => set({ cart: [] }),
      
      // Theme State
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      // Admin State
      isAdminAuthenticated: false,
      adminLogin: (password) => {
        if (password === ADMIN_PASSWORD) {
          set({ isAdminAuthenticated: true });
          return true;
        }
        return false;
      },
      adminLogout: () => set({ isAdminAuthenticated: false }),
      
      // Menu Items State (will be initialized with mock data)
      menuItems: [],
      setMenuItems: (items) => set({ menuItems: items }),
      addMenuItem: (item) =>
        set((state) => ({ menuItems: [...state.menuItems, item] })),
      updateMenuItem: (id, updates) =>
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),
      deleteMenuItem: (id) =>
        set((state) => ({
          menuItems: state.menuItems.filter((item) => item.id !== id),
        })),
      
      // Customers State
      customers: [],
      addCustomer: (customer) =>
        set((state) => ({ customers: [...state.customers, customer] })),
      
      // Testimonials State
      testimonials: [],
      addTestimonial: (testimonial) =>
        set((state) => ({ testimonials: [...state.testimonials, testimonial] })),
      updateTestimonial: (id, updates) =>
        set((state) => ({
          testimonials: state.testimonials.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      deleteTestimonial: (id) =>
        set((state) => ({
          testimonials: state.testimonials.filter((t) => t.id !== id),
        })),
      
      // Promo Banners State
      promoBanners: [],
      addPromoBanner: (banner) =>
        set((state) => ({ promoBanners: [...state.promoBanners, banner] })),
      updatePromoBanner: (id, updates) =>
        set((state) => ({
          promoBanners: state.promoBanners.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        })),
      deletePromoBanner: (id) =>
        set((state) => ({
          promoBanners: state.promoBanners.filter((b) => b.id !== id),
        })),
    }),
    {
      name: 'flor-maracuja-storage',
    }
  )
);
