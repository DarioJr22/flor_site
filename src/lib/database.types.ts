// ============================================================
// Database Types — Flor do Maracujá
// Generated from the migration schema
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
export type BadgeType = 'bestseller' | 'new' | 'spicy';

// ----- Row types (what you get back from SELECT) -----

export interface MenuItemRow {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_path: string | null;
  badges: BadgeType[] | null;
  available: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromoBannerRow {
  id: string;
  title: string;
  description: string | null;
  image_path: string | null;
  active: boolean;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderRow {
  id: string;
  items: Json;
  total: number;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  promo_code: string | null;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface ReviewRow {
  id: string;
  name: string;
  rating: number;
  comment: string | null;
  date: string | null;
  approved: boolean;
  avatar_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthday: string | null;
  preferences: string | null;
  promo_code: string | null;
  created_at: string;
}

// ----- Insert types (what you pass to INSERT) -----

export interface MenuItemInsert {
  id?: string;
  name: string;
  description?: string | null;
  price: number;
  category: string;
  image_path?: string | null;
  badges?: BadgeType[] | null;
  available?: boolean;
}

export interface PromoBannerInsert {
  id?: string;
  title: string;
  description?: string | null;
  image_path?: string | null;
  active?: boolean;
  valid_until?: string | null;
}

export interface OrderInsert {
  id?: string;
  items: Json;
  total: number;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_address?: string | null;
  promo_code?: string | null;
  status?: OrderStatus;
}

export interface ReviewInsert {
  id?: string;
  name: string;
  rating: number;
  comment?: string | null;
  date?: string | null;
  approved?: boolean;
  avatar_path?: string | null;
}

export interface LeadInsert {
  id?: string;
  name: string;
  email: string;
  phone: string;
  birthday?: string | null;
  preferences?: string | null;
  promo_code?: string | null;
}

// ----- Update types (what you pass to UPDATE) -----

export type MenuItemUpdate = Partial<MenuItemInsert>;
export type PromoBannerUpdate = Partial<PromoBannerInsert>;
export type OrderUpdate = Partial<OrderInsert>;
export type ReviewUpdate = Partial<ReviewInsert>;
export type LeadUpdate = Partial<LeadInsert>;

// ----- Supabase Database interface -----

export interface Database {
  public: {
    Tables: {
      menu_items: {
        Row: MenuItemRow;
        Insert: MenuItemInsert;
        Update: MenuItemUpdate;
      };
      promo_banners: {
        Row: PromoBannerRow;
        Insert: PromoBannerInsert;
        Update: PromoBannerUpdate;
      };
      orders: {
        Row: OrderRow;
        Insert: OrderInsert;
        Update: OrderUpdate;
      };
      reviews: {
        Row: ReviewRow;
        Insert: ReviewInsert;
        Update: ReviewUpdate;
      };
      leads: {
        Row: LeadRow;
        Insert: LeadInsert;
        Update: LeadUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      order_status: OrderStatus;
      badge_type: BadgeType;
    };
  };
}
