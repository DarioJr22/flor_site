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

// ----- Tickets Empresariais -----

export type EmpresaStatus = 'ativo' | 'inativo' | 'suspenso';
export type TicketStatus = 'pendente' | 'impresso' | 'entregue' | 'cancelado';
export type DiaSemana = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom';

export interface EmpresaClienteRow {
  id: string;
  nome: string;
  cnpj: string | null;
  contato_nome: string | null;
  contato_telefone: string | null;
  contato_email: string | null;
  endereco_entrega: string | null;
  dias_fornecimento: DiaSemana[];
  horario_entrega: string;
  valor_ticket: number;
  status: EmpresaStatus;
  data_inicio_contrato: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketAlimentacaoRow {
  id: string;
  empresa_id: string;
  nome_funcionario: string;
  carne: string;
  acompanhamentos: string;
  data_refeicao: string;
  hora_registro: string;
  status: TicketStatus;
  valor: number | null;
  numero_ticket: string | null;
  observacoes: string | null;
  impresso_em: string | null;
  impresso_por: string | null;
  lote_importacao: string | null;
  created_at: string;
  updated_at: string;
}

export interface RelatorioConsumoRow {
  empresa_id: string;
  empresa_nome: string;
  cnpj: string | null;
  total_tickets: number;
  valor_total: number;
  ticket_medio: number;
  dias_atendidos: number;
  funcionarios_unicos: number;
  mes_referencia: string | null;
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

// ----- Insert tipos Tickets -----

export interface EmpresaClienteInsert {
  id?: string;
  nome: string;
  cnpj?: string | null;
  contato_nome?: string | null;
  contato_telefone?: string | null;
  contato_email?: string | null;
  endereco_entrega?: string | null;
  dias_fornecimento?: DiaSemana[];
  horario_entrega?: string;
  valor_ticket?: number;
  status?: EmpresaStatus;
  data_inicio_contrato?: string | null;
  observacoes?: string | null;
}

export interface TicketAlimentacaoInsert {
  id?: string;
  empresa_id: string;
  nome_funcionario: string;
  carne: string;
  acompanhamentos: string;
  data_refeicao?: string;
  hora_registro?: string;
  status?: TicketStatus;
  valor?: number | null;
  numero_ticket?: string | null;
  observacoes?: string | null;
  impresso_em?: string | null;
  impresso_por?: string | null;
  lote_importacao?: string | null;
}

// ----- Update types (what you pass to UPDATE) -----

export type MenuItemUpdate = Partial<MenuItemInsert>;
export type PromoBannerUpdate = Partial<PromoBannerInsert>;
export type OrderUpdate = Partial<OrderInsert>;
export type ReviewUpdate = Partial<ReviewInsert>;
export type LeadUpdate = Partial<LeadInsert>;
export type EmpresaClienteUpdate = Partial<EmpresaClienteInsert>;
export type TicketAlimentacaoUpdate = Partial<TicketAlimentacaoInsert>;

// ----- Supabase Database interface -----

export interface Database {
  public: {
    Tables: {
      menu_items: {
        Row: MenuItemRow;
        Insert: MenuItemInsert;
        Update: MenuItemUpdate;
        Relationships: [];
      };
      promo_banners: {
        Row: PromoBannerRow;
        Insert: PromoBannerInsert;
        Update: PromoBannerUpdate;
        Relationships: [];
      };
      orders: {
        Row: OrderRow;
        Insert: OrderInsert;
        Update: OrderUpdate;
        Relationships: [];
      };
      reviews: {
        Row: ReviewRow;
        Insert: ReviewInsert;
        Update: ReviewUpdate;
        Relationships: [];
      };
      leads: {
        Row: LeadRow;
        Insert: LeadInsert;
        Update: LeadUpdate;
        Relationships: [];
      };
      empresas_clientes: {
        Row: EmpresaClienteRow;
        Insert: EmpresaClienteInsert;
        Update: EmpresaClienteUpdate;
        Relationships: [];
      };
      tickets_alimentacao: {
        Row: TicketAlimentacaoRow;
        Insert: TicketAlimentacaoInsert;
        Update: TicketAlimentacaoUpdate;
        Relationships: [
          {
            foreignKeyName: 'tickets_alimentacao_empresa_id_fkey';
            columns: ['empresa_id'];
            isOneToOne: false;
            referencedRelation: 'empresas_clientes';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      vw_relatorio_consumo_empresas: {
        Row: RelatorioConsumoRow;
      };
    };
    Functions: Record<string, never>;
    Enums: {
      order_status: OrderStatus;
      badge_type: BadgeType;
      empresa_status: EmpresaStatus;
      ticket_status: TicketStatus;
    };
  };
}
