// ============================================================
// Google Analytics 4 — Flor do Maracujá
// Módulo centralizado de tracking
// ============================================================

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// --------------- Configuração ---------------

const GA4_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || '';

/** Retorna true se o GA4 está disponível */
export function isGA4Available(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/** Dispara um evento GA4 (com fallback de console em dev) */
export function ga4Event(eventName: string, params?: Record<string, any>): void {
  if (isGA4Available()) {
    window.gtag('event', eventName, params);
  }
  if (import.meta.env.DEV) {
    console.log(`[GA4] ${eventName}`, params);
  }
}

// --------------- UTM & Atribuição ---------------

export interface Attribution {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  referrer: string;
  landing_page: string;
  device_type: 'mobile' | 'desktop';
  timestamp: string;
}

function getUrlParam(name: string): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || '';
}

/** Captura dados de atribuição ao carregar a página */
export function captureAttribution(): Attribution {
  const attribution: Attribution = {
    utm_source: getUrlParam('utm_source') || 'direct',
    utm_medium: getUrlParam('utm_medium') || 'none',
    utm_campaign: getUrlParam('utm_campaign') || 'none',
    utm_term: getUrlParam('utm_term') || '',
    utm_content: getUrlParam('utm_content') || '',
    referrer: document.referrer || 'direct',
    landing_page: window.location.pathname,
    device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    timestamp: new Date().toISOString(),
  };

  // Persistir para associar ao lead depois
  try {
    sessionStorage.setItem('flor_attribution', JSON.stringify(attribution));
  } catch {
    // quota exceeded — ignore
  }

  ga4Event('attribution_captured', attribution);
  return attribution;
}

/** Recupera atribuição salva na sessão */
export function getAttribution(): Attribution | null {
  try {
    const raw = sessionStorage.getItem('flor_attribution');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// --------------- Eventos de Formulário ---------------

export function trackFormView(): void {
  ga4Event('form_view', {
    form_name: 'lead_capture',
    form_location: 'landing_page',
  });
}

export function trackFormStart(firstField: string): void {
  ga4Event('form_start', {
    form_name: 'lead_capture',
    first_field: firstField,
  });
}

export function trackFormProgress(percentage: number, lastField: string): void {
  ga4Event('form_progress', {
    form_name: 'lead_capture',
    progress_percentage: percentage,
    last_field_completed: lastField,
  });
}

export function trackPreferencesSelected(prefs: string[]): void {
  ga4Event('preferences_selected', {
    preferences_count: prefs.length,
    preferences: prefs.join(','),
  });
}

export function trackFormSubmit(fieldsCount: number): void {
  ga4Event('form_submit', {
    form_name: 'lead_capture',
    form_fields_filled: fieldsCount,
  });
}

export function trackGenerateLead(): void {
  const attribution = getAttribution();
  ga4Event('generate_lead', {
    currency: 'BRL',
    value: 0,
    lead_source: attribution?.utm_source || 'direct',
  });
}

export function trackFormError(errorType: string, errorMessage: string): void {
  ga4Event('form_error', {
    form_name: 'lead_capture',
    error_type: errorType,
    error_message: errorMessage,
  });
}

// --------------- Eventos de Comportamento ---------------

export function trackScrollDepth(percent: number): void {
  ga4Event('scroll', { percent_scrolled: percent });
}

export function trackSectionView(sectionName: string, timeToView: number): void {
  ga4Event('section_view', {
    section_name: sectionName,
    time_to_view: Math.round(timeToView),
  });
}

export function trackUserEngagement(engagementTimeMs: number): void {
  ga4Event('user_engagement', {
    engagement_time_msec: engagementTimeMs,
  });
}

export function trackCtaClick(text: string, location: string, type: 'button' | 'link' = 'button'): void {
  ga4Event('cta_click', {
    cta_text: text,
    cta_location: location,
    cta_type: type,
  });
}

export function trackContactClick(method: 'whatsapp' | 'phone' | 'email', location: string): void {
  ga4Event('contact_click', {
    contact_method: method,
    contact_location: location,
  });
}

// --------------- Lead Quality Score ---------------

interface LeadScoreInput {
  timeOnPage: number;       // segundos
  scrollDepth: number;      // porcentagem
  ctaClicks: number;
  sectionViews: number;
  completedOptionalFields: number;
}

export function calculateLeadScore(input: LeadScoreInput): 'low' | 'medium' | 'high' {
  let score = 0;
  if (input.timeOnPage > 120) score += 2;
  else if (input.timeOnPage > 60) score += 1;

  if (input.scrollDepth >= 75) score += 2;
  else if (input.scrollDepth >= 50) score += 1;

  if (input.ctaClicks >= 2) score += 1;
  if (input.sectionViews >= 4) score += 1;
  if (input.completedOptionalFields >= 2) score += 1;

  if (score >= 6) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

export function trackHighIntentLead(input: LeadScoreInput): void {
  const quality = calculateLeadScore(input);
  ga4Event('high_intent_lead', {
    quality_score: quality,
    time_on_page: input.timeOnPage,
    scroll_depth: input.scrollDepth,
    interactions: input.ctaClicks + input.sectionViews,
  });
}
