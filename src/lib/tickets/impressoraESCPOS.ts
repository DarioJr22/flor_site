// ============================================================
// Impressora POS-80 — Impressão térmica via driver Windows
// Usa window.print() com layout HTML formatado para papel 80mm
// Compatível com impressoras POS-80 / POS80 Printer instaladas
// como impressora Windows padrão (USB).
// ============================================================

import type { TicketAlimentacaoRow } from '../database.types';

/** Status da impressora */
export interface StatusImpressora {
  modelo: string;
  ultimoErro?: string;
}

/**
 * Verifica se window.print() está disponível (sempre true em navegadores).
 * Mantida por retrocompatibilidade — substitui isWebSerialSupported().
 */
export function isWebSerialSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.print === 'function';
}

/**
 * Formata data ISO (YYYY-MM-DD) para DD/MM/YYYY
 */
function formatarDataTicket(dataISO: string): string {
  if (!dataISO) return '';
  const partes = dataISO.split('-');
  if (partes.length !== 3) return dataISO;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// ============================================================
// CSS para impressão térmica 80mm
// ============================================================

const THERMAL_CSS = `
  @page {
    size: 80mm 100mm;
    margin: 0;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    width: 80mm;
    font-family: 'Courier New', 'Lucida Console', monospace;
    font-size: 12px;
    line-height: 1.3;
    color: #000;
    background: #fff;
  }

  .etiqueta {
    width: 80mm;
    height: 100mm;
    padding: 2mm 3mm;
    overflow: hidden;
    page-break-after: always;
    break-after: page;
  }

  .etiqueta:last-child {
    page-break-after: always;
    break-after: page;
  }

  .separador {
    border: none;
    border-top: 1px dashed #000;
    margin: 2mm 0;
  }

  .separador-duplo {
    border: none;
    border-top: 2px solid #000;
    margin: 2mm 0;
  }

  .header {
    text-align: center;
    font-weight: bold;
    font-size: 18px;
    letter-spacing: 1px;
    padding: 2mm 0;
  }

  .label {
    font-weight: bold;
    font-size: 11px;
    text-transform: uppercase;
    margin-top: 1mm;
  }

  .nome-cliente {
    font-weight: bold;
    font-size: 16px;
    text-transform: uppercase;
    padding: 1mm 0;
  }

  .valor {
    font-size: 12px;
    padding: 0.5mm 0;
  }

  .acomp-item {
    font-size: 11px;
    padding-left: 3mm;
  }

  .acomp-item::before {
    content: '• ';
  }

  .rodape {
    font-size: 10px;
    padding: 0.5mm 0;
  }

  .obs {
    font-size: 10px;
    font-style: italic;
    padding: 0.5mm 0;
  }

  @media screen {
    body {
      max-width: 80mm;
      margin: 10px auto;
      border: 1px dashed #ccc;
      padding: 5px;
    }
  }
`;

// ============================================================
// Classe ImpressoraPOS80
// ============================================================

/**
 * Classe que gera e imprime etiquetas formatadas para impressora
 * térmica POS-80 (80mm) usando window.print() via driver Windows.
 *
 * Não requer conexão serial — a POS-80 é instalada como impressora
 * Windows padrão. Basta selecionar "POS-80" ou "POS80 Printer"
 * no diálogo de impressão do navegador.
 */
export class ImpressoraPOS80 {
  private _status: StatusImpressora = {
    modelo: 'POS-80',
  };

  get status(): StatusImpressora {
    return { ...this._status };
  }

  /**
   * Gera o HTML de uma única etiqueta de ticket.
   */
  private gerarHTMLEtiqueta(ticket: TicketAlimentacaoRow, empresaNome?: string): string {
    const acomp = ticket.acompanhamentos
      .split(',')
      .map(a => a.trim())
      .filter(Boolean);

    const dataFormatada = formatarDataTicket(ticket.data_refeicao);
    const hora = ticket.hora_registro ? ticket.hora_registro.slice(0, 5) : '';

    return `
      <div class="etiqueta">
        <hr class="separador-duplo" />
        <div class="header">FLOR DO MARACUJÁ</div>
        <hr class="separador-duplo" />

        <div class="label">Cliente:</div>
        <div class="nome-cliente">${escapeHtml(ticket.nome_funcionario)}</div>
        <hr class="separador" />

        <div class="label">Carne:</div>
        <div class="valor">${escapeHtml(ticket.carne)}</div>

        <div class="label" style="margin-top:2mm">Acompanhamentos:</div>
        ${acomp.map(a => `<div class="acomp-item">${escapeHtml(a)}</div>`).join('\n')}
        <hr class="separador" />

        ${empresaNome ? `<div class="rodape"><b>Empresa:</b> ${escapeHtml(empresaNome)}</div>` : ''}
        <div class="rodape"><b>Data:</b> ${dataFormatada}${hora ? `  ${hora}` : ''}</div>
        ${ticket.numero_ticket ? `<div class="rodape"><b>Ticket:</b> #${escapeHtml(ticket.numero_ticket)}</div>` : ''}
        ${ticket.observacoes ? `<div class="obs"><b>Obs:</b> ${escapeHtml(ticket.observacoes)}</div>` : ''}
        <hr class="separador-duplo" />
      </div>
    `;
  }

  /**
   * Gera documento HTML completo com CSS para impressão térmica.
   */
  private gerarDocumentoHTML(etiquetasHTML: string): string {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Etiquetas — Flor do Maracujá</title>
  <style>${THERMAL_CSS}</style>
</head>
<body>
  ${etiquetasHTML}
</body>
</html>`;
  }

  /**
   * Abre janela popup com as etiquetas e aciona window.print().
   * O usuário seleciona "POS-80" ou "POS80 Printer" no diálogo.
   */
  private async imprimir(html: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const popup = window.open('', '_blank', 'width=350,height=600,scrollbars=yes');
        if (!popup) {
          this._status.ultimoErro = 'Popup bloqueado pelo navegador. Permita popups para este site.';
          reject(new Error(this._status.ultimoErro));
          return;
        }

        popup.document.open();
        popup.document.write(html);
        popup.document.close();

        // Aguardar renderização antes de imprimir
        popup.onload = () => {
          setTimeout(() => {
            popup.focus();
            popup.print();
            // Fechar após impressão (com delay para diálogo fechar)
            setTimeout(() => {
              popup.close();
              this._status.ultimoErro = undefined;
              resolve();
            }, 1000);
          }, 300);
        };

        // Fallback caso onload não dispare (conteúdo pequeno)
        setTimeout(() => {
          if (!popup.closed) {
            popup.focus();
            popup.print();
            setTimeout(() => {
              popup.close();
              resolve();
            }, 1000);
          }
        }, 1500);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro ao imprimir';
        this._status.ultimoErro = msg;
        reject(err);
      }
    });
  }

  /**
   * Imprime uma única etiqueta de ticket.
   * Abre diálogo de impressão — selecione "POS-80" ou "POS80 Printer".
   */
  async imprimirEtiqueta(ticket: TicketAlimentacaoRow, empresaNome?: string): Promise<void> {
    const etiquetaHTML = this.gerarHTMLEtiqueta(ticket, empresaNome);
    const docHTML = this.gerarDocumentoHTML(etiquetaHTML);
    await this.imprimir(docHTML);
  }

  /**
   * Imprime múltiplas etiquetas em um único documento com quebras de página.
   * Apenas UM diálogo de impressão para todo o lote.
   */
  async imprimirLote(
    tickets: TicketAlimentacaoRow[],
    empresasMap: Record<string, string>
  ): Promise<{ sucesso: number; erros: number }> {
    if (tickets.length === 0) return { sucesso: 0, erros: 0 };

    try {
      const etiquetasHTML = tickets
        .map(t => this.gerarHTMLEtiqueta(t, empresasMap[t.empresa_id] ?? ''))
        .join('\n');

      const docHTML = this.gerarDocumentoHTML(etiquetasHTML);
      await this.imprimir(docHTML);

      return { sucesso: tickets.length, erros: 0 };
    } catch {
      return { sucesso: 0, erros: tickets.length };
    }
  }

  /**
   * Imprime etiqueta de teste para verificar layout e impressora.
   */
  async testarImpressao(): Promise<void> {
    const ticketTeste: TicketAlimentacaoRow = {
      id: 'test',
      empresa_id: 'test',
      nome_funcionario: 'TESTE DE IMPRESSÃO',
      carne: 'Galinha Guisada',
      acompanhamentos: 'Feijão Preto, Arroz Branco, Macarrão',
      data_refeicao: new Date().toISOString().split('T')[0],
      hora_registro: new Date().toTimeString().slice(0, 8),
      status: 'pendente',
      valor: 25.0,
      numero_ticket: 'TESTE-0001',
      observacoes: null,
      impresso_em: null,
      impresso_por: null,
      lote_importacao: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await this.imprimirEtiqueta(ticketTeste, 'Empresa Teste');
  }
}

/**
 * Escapa caracteres HTML.
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, c => map[c] ?? c);
}

// ----- Singleton -----

let instancia: ImpressoraPOS80 | null = null;

export function getImpressora(): ImpressoraPOS80 {
  if (!instancia) instancia = new ImpressoraPOS80();
  return instancia;
}
