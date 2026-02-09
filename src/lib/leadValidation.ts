// ============================================================
// Validações & Formatação — Formulário de Lead Capture
// ============================================================

// --------------- Constantes ---------------

/** Regex para telefone brasileiro: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX */
export const PHONE_REGEX = /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/;

/** Domínios descartáveis mais comuns */
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
  'dispostable.com', 'trashmail.com', 'fakeinbox.com', 'maildrop.cc',
  'temp-mail.org', '10minutemail.com', 'minutemail.com', 'tempail.com',
  'emailondeck.com', 'getnada.com', 'mohmal.com', 'burnermail.io',
]);

/** Opções de preferências */
export const PREFERENCES_OPTIONS = [
  'Pratos Executivos',
  'Marmitas',
  'Sobremesas',
  'Bebidas',
  'Delivery',
  'Eventos & Encomendas',
] as const;

export type PreferenceOption = typeof PREFERENCES_OPTIONS[number];

// --------------- Interfaces ---------------

export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  birthday: string;        // DD/MM/YYYY visualmente, armazenado como string
  preferences: string[];
  terms: boolean;
  /** Honeypot — deve ficar vazio */
  website: string;
}

export interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  birthday?: string;
  terms?: string;
}

// --------------- Validadores ---------------

/** Nome: mín 3 chars, apenas letras (inclusive acentos) e espaços */
export function validateName(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Nome é obrigatório';
  if (trimmed.length < 3) return 'Nome deve ter pelo menos 3 caracteres';
  if (!/^[A-Za-zÀ-ÿ\s]+$/.test(trimmed)) return 'Nome deve conter apenas letras e espaços';
  return undefined;
}

/** Email: formato válido + bloqueio de domínios descartáveis */
export function validateEmail(value: string): string | undefined {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return 'Email é obrigatório';
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) return 'Formato de email inválido';
  const domain = trimmed.split('@')[1];
  if (DISPOSABLE_DOMAINS.has(domain)) return 'Por favor, use um email permanente';
  return undefined;
}

/** Telefone: formato brasileiro */
export function validatePhone(value: string): string | undefined {
  const digits = value.replace(/\D/g, '');
  if (!digits) return 'Telefone é obrigatório';
  if (digits.length < 10 || digits.length > 11) return 'Número de telefone inválido';
  return undefined;
}

/** Data de nascimento: DD/MM/YYYY, idade mínima 18 */
export function validateBirthday(value: string): string | undefined {
  if (!value) return undefined; // campo opcional
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return 'Formato inválido (DD/MM/AAAA)';

  const [, dd, mm, yyyy] = match;
  const day = parseInt(dd, 10);
  const month = parseInt(mm, 10);
  const year = parseInt(yyyy, 10);

  if (month < 1 || month > 12) return 'Mês inválido';
  if (day < 1 || day > 31) return 'Dia inválido';
  if (year < 1900 || year > new Date().getFullYear()) return 'Ano inválido';

  const date = new Date(year, month - 1, day);
  if (date.getDate() !== day || date.getMonth() !== month - 1) {
    return 'Data inválida';
  }

  // Idade mínima: 18 anos
  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() - (month - 1);
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age--;
  }
  if (age < 18) return 'Idade mínima: 18 anos';

  return undefined;
}

/** Executa todas as validações e retorna erros */
export function validateLeadForm(data: LeadFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  errors.name = validateName(data.name);
  errors.email = validateEmail(data.email);
  errors.phone = validatePhone(data.phone);
  errors.birthday = validateBirthday(data.birthday);

  if (!data.terms) {
    errors.terms = 'Você precisa aceitar os termos para continuar';
  }

  // Remove campos sem erro
  for (const key of Object.keys(errors) as (keyof ValidationErrors)[]) {
    if (!errors[key]) delete errors[key];
  }

  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

// --------------- Formatadores ---------------

/** Formata telefone enquanto o usuário digita: (XX) XXXXX-XXXX */
export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/** Formata data enquanto o usuário digita: DD/MM/AAAA */
export function formatBirthdayInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

/** Converte DD/MM/YYYY → YYYY-MM-DD (ISO) para envio ao backend */
export function birthdayToISO(value: string): string | null {
  if (!value) return null;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

/** Sanitiza input genérico removendo caracteres perigosos */
export function sanitize(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')     // remove tags HTML
    .replace(/[<>"'`;]/g, '')    // remove chars perigosos
    .trim();
}

/** Calcula quantos campos obrigatórios + opcionais estão preenchidos */
export function countFilledFields(data: LeadFormData): number {
  let count = 0;
  if (data.name.trim()) count++;
  if (data.email.trim()) count++;
  if (data.phone.replace(/\D/g, '').length >= 10) count++;
  if (data.birthday) count++;
  if (data.preferences.length > 0) count++;
  return count;
}

/** Calcula porcentagem de progresso (baseado nos 3 obrigatórios + 2 opcionais) */
export function progressPercentage(data: LeadFormData): number {
  const filled = countFilledFields(data);
  const total = 5; // name, email, phone, birthday, preferences
  return Math.round((filled / total) * 100);
}
