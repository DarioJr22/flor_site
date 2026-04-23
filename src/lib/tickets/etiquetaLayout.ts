// ============================================================
// Layout de Etiqueta — Fallback PDF para navegadores sem Web Serial
// Gera etiqueta no formato 80mm usando pdfmake
// ============================================================

import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import type { TicketAlimentacaoRow } from '../database.types';

/**
 * Formata data ISO (YYYY-MM-DD) para DD/MM/YYYY
 */
function formatarData(dataISO: string): string {
  if (!dataISO) return '';
  const partes = dataISO.split('-');
  if (partes.length !== 3) return dataISO;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

/**
 * Gera a definição PDF (pdfmake) para uma etiqueta de ticket 80mm.
 * Usada como fallback quando Web Serial API não está disponível.
 *
 * @param ticket - Dados do ticket
 * @param empresaNome - Nome da empresa (opcional)
 * @returns Definição de documento pdfmake
 */
export function gerarEtiquetaPDF(
  ticket: TicketAlimentacaoRow,
  empresaNome?: string
): TDocumentDefinitions {
  const acomp = ticket.acompanhamentos
    .split(',')
    .map(a => a.trim())
    .filter(Boolean);

  const dataFormatada = formatarData(ticket.data_refeicao);
  const hora = ticket.hora_registro ? ticket.hora_registro.slice(0, 5) : '';

  const conteudo: Content[] = [
    // Título do restaurante
    {
      text: 'FLOR DO MARACUJÁ',
      style: 'titulo',
      margin: [0, 0, 0, 4],
    },
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1, lineColor: '#333' }], margin: [0, 2, 0, 6] },

    // Cliente
    { text: 'CLIENTE:', style: 'label' },
    { text: ticket.nome_funcionario.toUpperCase(), style: 'nomeCliente', margin: [0, 0, 0, 6] },
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 0.5, lineColor: '#999' }], margin: [0, 0, 0, 6] },

    // Carne
    { text: 'CARNE:', style: 'label' },
    { text: `  ${ticket.carne}`, style: 'valor', margin: [0, 0, 0, 4] },

    // Acompanhamentos
    { text: 'ACOMPANHAMENTOS:', style: 'label', margin: [0, 4, 0, 2] },
    ...acomp.map(item => ({
      text: `  • ${item}`,
      style: 'valor' as const,
      margin: [0, 1, 0, 1] as [number, number, number, number],
    })),

    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 0.5, lineColor: '#999' }], margin: [0, 6, 0, 4] },

    // Rodapé
    ...(empresaNome ? [{ text: `EMPRESA: ${empresaNome}`, style: 'rodape' as const }] : []),
    { text: `DATA: ${dataFormatada}  ${hora}`, style: 'rodape' },
    ...(ticket.numero_ticket ? [{ text: `TICKET: #${ticket.numero_ticket}`, style: 'rodape' as const }] : []),
    ...(ticket.observacoes ? [{ text: `OBS: ${ticket.observacoes}`, style: 'rodape' as const, margin: [0, 2, 0, 0] as [number, number, number, number] }] : []),
  ];

  return {
    // Largura 80mm ≈ 226.77 pontos
    pageSize: { width: 226.77, height: 'auto' as unknown as number },
    pageMargins: [10, 10, 10, 10],
    content: conteudo,
    styles: {
      titulo: {
        fontSize: 14,
        bold: true,
        alignment: 'center',
        color: '#E91E8C',
      },
      label: {
        fontSize: 8,
        bold: true,
        color: '#333',
      },
      nomeCliente: {
        fontSize: 12,
        bold: true,
        color: '#000',
      },
      valor: {
        fontSize: 9,
        color: '#333',
      },
      rodape: {
        fontSize: 7,
        color: '#666',
        margin: [0, 1, 0, 1],
      },
    },
    defaultStyle: {
      font: 'Helvetica',
    },
  };
}

/**
 * Gera PDF de múltiplas etiquetas para impressão em lote via navegador.
 * Cada ticket fica em uma "página" separada.
 */
export function gerarLoteEtiquetasPDF(
  tickets: TicketAlimentacaoRow[],
  empresasMap: Record<string, string>
): TDocumentDefinitions {
  const conteudo: Content[] = [];

  tickets.forEach((ticket, index) => {
    const empresaNome = empresasMap[ticket.empresa_id] ?? '';
    const etiqueta = gerarEtiquetaPDF(ticket, empresaNome);

    if (index > 0) {
      conteudo.push({ text: '', pageBreak: 'before' });
    }

    if (Array.isArray(etiqueta.content)) {
      conteudo.push(...(etiqueta.content as Content[]));
    }
  });

  return {
    pageSize: { width: 226.77, height: 'auto' as unknown as number },
    pageMargins: [10, 10, 10, 10],
    content: conteudo,
    styles: {
      titulo: { fontSize: 14, bold: true, alignment: 'center', color: '#E91E8C' },
      label: { fontSize: 8, bold: true, color: '#333' },
      nomeCliente: { fontSize: 12, bold: true, color: '#000' },
      valor: { fontSize: 9, color: '#333' },
      rodape: { fontSize: 7, color: '#666', margin: [0, 1, 0, 1] },
    },
    defaultStyle: { font: 'Helvetica' },
  };
}
