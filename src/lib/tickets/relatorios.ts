// ============================================================
// Relatórios — Geração de PDF e exportação CSV
// Relatórios de consumo por empresa para tickets empresariais
// ============================================================

import type { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces';
import type { TicketAlimentacaoRow, EmpresaClienteRow } from '../database.types';

// ----- Interfaces -----

export interface DadosRelatorio {
  empresa: EmpresaClienteRow;
  periodo: { inicio: string; fim: string };
  tickets: TicketAlimentacaoRow[];
  totalTickets: number;
  valorTotal: number;
  ticketMedio: number;
  porCarne: Record<string, number>;
  porDia: Record<string, number>;
  topFuncionarios: Array<{ nome: string; quantidade: number }>;
}

// ----- Formatação -----

function formatarData(dataISO: string): string {
  if (!dataISO) return '';
  const partes = dataISO.split('-');
  if (partes.length !== 3) return dataISO;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

// ----- Cálculos -----

/**
 * Calcula dados agregados para o relatório a partir de uma lista de tickets.
 */
export function calcularDadosRelatorio(
  empresa: EmpresaClienteRow,
  tickets: TicketAlimentacaoRow[],
  inicio: string,
  fim: string
): DadosRelatorio {
  const ticketsFiltrados = tickets.filter(
    t => t.data_refeicao >= inicio && t.data_refeicao <= fim
  );

  const valorTotal = ticketsFiltrados.reduce((sum, t) => sum + (t.valor ?? 0), 0);
  const ticketMedio = ticketsFiltrados.length > 0 ? valorTotal / ticketsFiltrados.length : 0;

  // Agrupar por tipo de carne
  const porCarne: Record<string, number> = {};
  for (const t of ticketsFiltrados) {
    const key = t.carne.toLowerCase();
    porCarne[key] = (porCarne[key] ?? 0) + 1;
  }

  // Agrupar por dia
  const porDia: Record<string, number> = {};
  for (const t of ticketsFiltrados) {
    porDia[t.data_refeicao] = (porDia[t.data_refeicao] ?? 0) + 1;
  }

  // Top funcionários
  const funcContagem: Record<string, number> = {};
  for (const t of ticketsFiltrados) {
    const key = t.nome_funcionario.toLowerCase();
    funcContagem[key] = (funcContagem[key] ?? 0) + 1;
  }
  const topFuncionarios = Object.entries(funcContagem)
    .map(([nome, quantidade]) => ({ nome, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);

  return {
    empresa,
    periodo: { inicio, fim },
    tickets: ticketsFiltrados,
    totalTickets: ticketsFiltrados.length,
    valorTotal,
    ticketMedio,
    porCarne,
    porDia,
    topFuncionarios,
  };
}

// ----- PDF -----

/**
 * Gera definição de documento pdfmake para relatório de consumo
 * de uma empresa em um período.
 */
export function gerarRelatorioPDF(dados: DadosRelatorio): TDocumentDefinitions {
  const conteudo: Content[] = [];

  // --- Cabeçalho ---
  conteudo.push({
    columns: [
      {
        width: '*',
        stack: [
          { text: 'FLOR DO MARACUJÁ', style: 'headerTitle' },
          { text: 'Relatório de Consumo - Tickets Empresariais', style: 'headerSubtitle' },
        ],
      },
    ],
    margin: [0, 0, 0, 10],
  });

  conteudo.push({
    canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: '#E91E8C' }],
    margin: [0, 0, 0, 15],
  });

  // --- Info da Empresa ---
  conteudo.push({
    columns: [
      {
        width: '50%',
        stack: [
          { text: 'EMPRESA', style: 'sectionLabel' },
          { text: dados.empresa.nome, style: 'empresaNome' },
          ...(dados.empresa.cnpj ? [{ text: `CNPJ: ${dados.empresa.cnpj}`, style: 'info' }] : []),
        ],
      },
      {
        width: '50%',
        stack: [
          { text: 'PERÍODO', style: 'sectionLabel' },
          {
            text: `${formatarData(dados.periodo.inicio)} a ${formatarData(dados.periodo.fim)}`,
            style: 'info',
          },
          { text: `Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, style: 'info' },
        ],
      },
    ],
    margin: [0, 0, 0, 15],
  });

  // --- Cards de Resumo ---
  const resumoTable: TableCell[][] = [
    [
      { text: 'Total de Tickets', style: 'cardLabel' },
      { text: 'Valor Total', style: 'cardLabel' },
      { text: 'Ticket Médio', style: 'cardLabel' },
      { text: 'Funcionários', style: 'cardLabel' },
    ],
    [
      { text: String(dados.totalTickets), style: 'cardValor' },
      { text: formatarMoeda(dados.valorTotal), style: 'cardValor' },
      { text: formatarMoeda(dados.ticketMedio), style: 'cardValor' },
      { text: String(dados.topFuncionarios.length), style: 'cardValor' },
    ],
  ];

  conteudo.push({
    table: {
      widths: ['*', '*', '*', '*'],
      body: resumoTable,
    },
    layout: {
      fillColor: (rowIndex: number) => (rowIndex === 0 ? '#FFF5F9' : null),
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#E0E0E0',
      vLineColor: () => '#E0E0E0',
      paddingTop: () => 6,
      paddingBottom: () => 6,
    },
    margin: [0, 0, 0, 20],
  });

  // --- Consumo por tipo de carne ---
  if (Object.keys(dados.porCarne).length > 0) {
    conteudo.push({ text: 'Consumo por Tipo de Carne/Proteína', style: 'sectionTitle', margin: [0, 0, 0, 8] });

    const carneRows: TableCell[][] = [
      [
        { text: 'Tipo', style: 'tableHeader' },
        { text: 'Quantidade', style: 'tableHeader' },
        { text: '%', style: 'tableHeader' },
      ],
    ];

    const carneEntries = Object.entries(dados.porCarne).sort((a, b) => b[1] - a[1]);
    for (const [tipo, qtd] of carneEntries) {
      const pct = dados.totalTickets > 0 ? ((qtd / dados.totalTickets) * 100).toFixed(1) : '0';
      carneRows.push([
        { text: tipo.charAt(0).toUpperCase() + tipo.slice(1), style: 'tableCell' },
        { text: String(qtd), style: 'tableCell', alignment: 'center' },
        { text: `${pct}%`, style: 'tableCell', alignment: 'center' },
      ]);
    }

    conteudo.push({
      table: { widths: ['*', 80, 60], body: carneRows },
      layout: {
        fillColor: (rowIndex: number) => (rowIndex === 0 ? '#FFF5F9' : rowIndex % 2 === 0 ? '#FAFAFA' : null),
        hLineWidth: () => 0.5,
        vLineWidth: () => 0,
        hLineColor: () => '#E0E0E0',
      },
      margin: [0, 0, 0, 20],
    });
  }

  // --- Top Funcionários ---
  if (dados.topFuncionarios.length > 0) {
    conteudo.push({ text: 'Top 10 Funcionários por Consumo', style: 'sectionTitle', margin: [0, 0, 0, 8] });

    const funcRows: TableCell[][] = [
      [
        { text: '#', style: 'tableHeader' },
        { text: 'Funcionário', style: 'tableHeader' },
        { text: 'Tickets', style: 'tableHeader' },
      ],
    ];

    dados.topFuncionarios.forEach((f, i) => {
      funcRows.push([
        { text: String(i + 1), style: 'tableCell', alignment: 'center' },
        { text: f.nome.charAt(0).toUpperCase() + f.nome.slice(1), style: 'tableCell' },
        { text: String(f.quantidade), style: 'tableCell', alignment: 'center' },
      ]);
    });

    conteudo.push({
      table: { widths: [30, '*', 60], body: funcRows },
      layout: {
        fillColor: (rowIndex: number) => (rowIndex === 0 ? '#FFF5F9' : rowIndex % 2 === 0 ? '#FAFAFA' : null),
        hLineWidth: () => 0.5,
        vLineWidth: () => 0,
        hLineColor: () => '#E0E0E0',
      },
      margin: [0, 0, 0, 20],
    });
  }

  // --- Rodapé ---
  conteudo.push({
    canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#E91E8C' }],
    margin: [0, 10, 0, 8],
  });

  conteudo.push({
    text: `Flor do Maracujá — Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}`,
    style: 'footer',
    alignment: 'center',
  });

  return {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
    content: conteudo,
    styles: {
      headerTitle: { fontSize: 18, bold: true, color: '#E91E8C' },
      headerSubtitle: { fontSize: 10, color: '#666', margin: [0, 2, 0, 0] },
      sectionLabel: { fontSize: 8, bold: true, color: '#999', margin: [0, 0, 0, 2] },
      sectionTitle: { fontSize: 13, bold: true, color: '#333' },
      empresaNome: { fontSize: 16, bold: true, color: '#333' },
      info: { fontSize: 9, color: '#666', margin: [0, 1, 0, 0] },
      cardLabel: { fontSize: 8, bold: true, color: '#E91E8C', alignment: 'center' },
      cardValor: { fontSize: 14, bold: true, color: '#333', alignment: 'center' },
      tableHeader: { fontSize: 9, bold: true, color: '#E91E8C' },
      tableCell: { fontSize: 9, color: '#333' },
      footer: { fontSize: 7, color: '#999' },
    },
    defaultStyle: { font: 'Helvetica' },
  };
}

// ----- CSV -----

/**
 * Exporta lista de tickets como arquivo CSV e dispara download automático.
 *
 * @param tickets - Lista de tickets para exportar
 * @param empresasMap - Mapa de empresa_id → nome_empresa
 * @param nomeArquivo - Nome do arquivo (sem extensão)
 */
export function exportarHistoricoCSV(
  tickets: TicketAlimentacaoRow[],
  empresasMap: Record<string, string>,
  nomeArquivo: string = 'tickets_exportacao'
): void {
  const header = [
    'Data',
    'Número Ticket',
    'Empresa',
    'Funcionário',
    'Carne',
    'Acompanhamentos',
    'Valor',
    'Status',
    'Hora Registro',
  ];

  const linhas = tickets.map(t => [
    formatarData(t.data_refeicao),
    t.numero_ticket ?? '',
    empresasMap[t.empresa_id] ?? '',
    t.nome_funcionario,
    t.carne,
    `"${t.acompanhamentos}"`,
    t.valor != null ? t.valor.toFixed(2).replace('.', ',') : '',
    t.status,
    t.hora_registro ? t.hora_registro.slice(0, 5) : '',
  ]);

  const csv = [header.join(';'), ...linhas.map(l => l.join(';'))].join('\n');

  // BOM para UTF-8 correto no Excel
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${nomeArquivo}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
