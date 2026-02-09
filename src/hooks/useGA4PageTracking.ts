// ============================================================
// useGA4PageTracking — Hooks de tracking de comportamento GA4
// Scroll depth, section views, engagement time, CTA clicks
// ============================================================

import { useEffect, useRef, useCallback } from 'react';
import {
  captureAttribution,
  trackScrollDepth,
  trackSectionView,
  trackUserEngagement,
  trackContactClick,
} from '../lib/analytics';

// --------------- usePageAttribution ---------------
// Captura UTMs e atribuição ao montar a página

export function usePageAttribution(): void {
  useEffect(() => {
    captureAttribution();
  }, []);
}

// --------------- useScrollDepthTracking ---------------
// Rastreia scroll em 25%, 50%, 75%, 90%

export function useScrollDepthTracking(): void {
  const trackedRef = useRef(new Set<number>());

  useEffect(() => {
    const thresholds = [25, 50, 75, 90];

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const percent = Math.round((scrollTop / docHeight) * 100);

      for (const t of thresholds) {
        if (percent >= t && !trackedRef.current.has(t)) {
          trackedRef.current.add(t);
          trackScrollDepth(t);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}

// --------------- useSectionViewTracking ---------------
// Rastreia quando seções entram no viewport usando IntersectionObserver

const SECTION_IDS = [
  { id: 'hero', name: 'hero' },
  { id: 'about', name: 'about' },
  { id: 'promo-banners', name: 'promotions' },
  { id: 'cardapio', name: 'menu' },
  { id: 'cliente-especial', name: 'lead_form' },
  { id: 'depoimentos', name: 'testimonials' },
  { id: 'localizacao', name: 'location' },
];

export function useSectionViewTracking(): void {
  const pageLoadTime = useRef(Date.now());
  const tracked = useRef(new Set<string>());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !tracked.current.has(entry.target.id)) {
            tracked.current.add(entry.target.id);
            const section = SECTION_IDS.find((s) => s.id === entry.target.id);
            if (section) {
              const timeToView = (Date.now() - pageLoadTime.current) / 1000;
              trackSectionView(section.name, timeToView);
            }
          }
        }
      },
      { threshold: 0.3 },
    );

    // Observar cada seção encontrada
    for (const { id } of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);
}

// --------------- useEngagementTracking ---------------
// Emite evento a cada 30s, 60s, 120s, 300s de tempo ativo na página

export function useEngagementTracking(): void {
  const milestones = useRef([30_000, 60_000, 120_000, 300_000]);
  const trackedMs = useRef(new Set<number>());
  const startTime = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime.current;

      for (const ms of milestones.current) {
        if (elapsed >= ms && !trackedMs.current.has(ms)) {
          trackedMs.current.add(ms);
          trackUserEngagement(ms);
        }
      }

      // Parar de checar depois do último milestone
      if (elapsed > 300_000) {
        clearInterval(interval);
      }
    }, 5_000); // checar a cada 5s

    return () => clearInterval(interval);
  }, []);
}

// --------------- useContactTracking ---------------
// Retorna funções de tracking para cliques em WhatsApp / telefone / email

export function useContactTracking() {
  const trackWhatsApp = useCallback((location: string) => {
    trackContactClick('whatsapp', location);
  }, []);

  const trackPhone = useCallback((location: string) => {
    trackContactClick('phone', location);
  }, []);

  const trackEmail = useCallback((location: string) => {
    trackContactClick('email', location);
  }, []);

  return { trackWhatsApp, trackPhone, trackEmail };
}

// --------------- Composite hook ---------------
// Use esse hook no componente principal (App.tsx) para ativar todo o tracking

export function useGA4PageTracking(): void {
  usePageAttribution();
  useScrollDepthTracking();
  useSectionViewTracking();
  useEngagementTracking();
}
