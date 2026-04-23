// ============================================================
// useImpressoraPOS80 — Hook React para impressão na POS-80
// A POS-80 é uma impressora térmica USB instalada como
// impressora Windows — usa window.print() (sem Serial API).
// ============================================================

import { useState, useCallback, useRef } from 'react';
import {
  ImpressoraPOS80,
  getImpressora,
  type StatusImpressora,
} from '../lib/tickets/impressoraESCPOS';
import type { TicketAlimentacaoRow } from '../lib/database.types';

export interface ProgressoImpressao {
  total: number;
  atual: number;
  nomeAtual: string;
  concluido: boolean;
  erro?: string;
}

/**
 * Hook para imprimir etiquetas na impressora POS-80 (80mm).
 * Não precisa de conexão prévia — usa window.print() e o driver Windows.
 *
 * Exportado também como `useImpressoraGT710` para retrocompatibilidade.
 */
export function useImpressoraPOS80() {
  const impressoraRef = useRef<ImpressoraPOS80>(getImpressora());
  const [status, setStatus] = useState<StatusImpressora>(impressoraRef.current.status);
  const [progresso, setProgresso] = useState<ProgressoImpressao | null>(null);

  /**
   * Imprime uma única etiqueta.
   * Abre diálogo de impressão — selecione "POS-80" ou "POS80 Printer".
   */
  const imprimirEtiqueta = useCallback(
    async (ticket: TicketAlimentacaoRow, empresaNome?: string): Promise<boolean> => {
      try {
        await impressoraRef.current.imprimirEtiqueta(ticket, empresaNome);
        setStatus(impressoraRef.current.status);
        return true;
      } catch {
        setStatus(impressoraRef.current.status);
        return false;
      }
    },
    []
  );

  /**
   * Imprime múltiplas etiquetas em UM único diálogo de impressão.
   * Todas as etiquetas vão no mesmo documento com quebras de página.
   */
  const imprimirLote = useCallback(
    async (
      tickets: TicketAlimentacaoRow[],
      empresasMap: Record<string, string>,
      _delayMs?: number // mantido por compatibilidade, ignorado
    ): Promise<{ sucesso: number; erros: number }> => {
      setProgresso({
        total: tickets.length,
        atual: 0,
        nomeAtual: 'Preparando impressão...',
        concluido: false,
      });

      try {
        const resultado = await impressoraRef.current.imprimirLote(tickets, empresasMap);

        setProgresso({
          total: tickets.length,
          atual: tickets.length,
          nomeAtual: '',
          concluido: true,
        });

        // Limpar progresso após 3 segundos
        setTimeout(() => setProgresso(null), 3000);

        setStatus(impressoraRef.current.status);
        return resultado;
      } catch {
        setProgresso({
          total: tickets.length,
          atual: 0,
          nomeAtual: '',
          concluido: true,
          erro: 'Erro ao imprimir lote',
        });
        setTimeout(() => setProgresso(null), 3000);
        return { sucesso: 0, erros: tickets.length };
      }
    },
    []
  );

  /**
   * Imprime etiqueta de teste.
   */
  const testarImpressao = useCallback(async (): Promise<boolean> => {
    try {
      await impressoraRef.current.testarImpressao();
      return true;
    } catch {
      setStatus(impressoraRef.current.status);
      return false;
    }
  }, []);

  return {
    status,
    progresso,
    imprimirEtiqueta,
    imprimirLote,
    testarImpressao,
  };
}

// Alias para retrocompatibilidade
export const useImpressoraGT710 = useImpressoraPOS80;
