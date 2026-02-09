// ============================================================
// Cardápio PDF Generator — Flor do Maracujá
// Generates a beautifully styled A4 PDF of the daily menu
// using pdfmake with the restaurant's brand identity.
// ============================================================

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { TDocumentDefinitions, Content, StyleDictionary } from 'pdfmake/interfaces';
import type { MenuItemRow } from './database.types';
import { getPublicUrl, BUCKETS } from './storage';

// Register default fonts (Roboto)
(pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs ?? pdfFonts;

// ─── Brand Colors ────────────────────────────────────────────
const COLORS = {
  rosaPrincipal: '#E91E8C',
  rosaEscuro: '#D91B7E',
  amareloDDurado: '#FFD700',
  amareloClaro: '#FFF4CC',
  verdeFolha: '#8BC34A',
  verdeEscuro: '#689F38',
  roxoAcento: '#8B1874',
  textoPrincipal: '#2C2C2C',
  textoSecundario: '#666666',
  fundoClaro: '#FFFCF7',
  branco: '#FFFFFF',
} as const;

// ─── Category config with icons & order ──────────────────────
const CATEGORY_CONFIG: Record<string, { icon: string; order: number }> = {
  'Pratos Principais': { icon: '🍽️', order: 1 },
  'Entradas':          { icon: '🥗', order: 2 },
  'Porções':           { icon: '🍟', order: 3 },
  'Sobremesas':        { icon: '🍰', order: 4 },
  'Bebidas':           { icon: '🍹', order: 5 },
};

// ─── Restaurant Info ─────────────────────────────────────────
const RESTAURANT = {
  name: 'Flor do Maracujá',
  tagline: 'Cozinha Regional com Sabor de Casa',
  slogan: 'Alimentação saudável com sabor!',
  address: 'Av. Mal. Mascarenhas de Morais, 4715 - Imbiribeira, Recife - PE',
  phone: '(81) 3456-7890',
  whatsapp: '(81) 98765-4321',
  instagram: '@flordomaracuja21',
  site: 'www.flordomaracuja.com.br',
  hours: 'Seg-Sex 11h–15h / 18h–22h • Sáb 11h–23h • Dom 11h–16h',
} as const;

// ─── Date Formatting Helpers ─────────────────────────────────

const DIAS_SEMANA = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado',
];

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function formatarDataCompleta(date: Date): string {
  const dia = date.getDate();
  const mes = MESES[date.getMonth()];
  const ano = date.getFullYear();
  return `${dia} de ${mes} de ${ano}`;
}

function obterDiaSemana(date: Date): string {
  return DIAS_SEMANA[date.getDay()];
}

function formatarDataArquivo(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${y}-${m}-${d}`;
}

// ─── Group items by category ─────────────────────────────────

interface CategoriaAgrupada {
  nome: string;
  icon: string;
  order: number;
  itens: MenuItemRow[];
}

function agruparPorCategoria(items: MenuItemRow[]): CategoriaAgrupada[] {
  const map = new Map<string, MenuItemRow[]>();

  for (const item of items) {
    if (!item.available) continue;
    const cat = item.category || 'Outros';
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(item);
  }

  return Array.from(map.entries())
    .map(([nome, itens]) => {
      const config = CATEGORY_CONFIG[nome] ?? { icon: '📋', order: 99 };
      return { nome, icon: config.icon, order: config.order, itens };
    })
    .sort((a, b) => a.order - b.order);
}

// ─── Convert remote image to base64 ─────────────────────────

async function imageToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ─── Build pdfmake docDefinition ─────────────────────────────

export interface CardapioPDFOptions {
  incluirPrecos?: boolean;
  incluirDescricoes?: boolean;
}

function buildDocDefinition(
  categorias: CategoriaAgrupada[],
  logoBase64: string | null,
  options: CardapioPDFOptions,
): TDocumentDefinitions {
  const hoje = new Date();
  const dataCompleta = formatarDataCompleta(hoje);
  const diaSemana = obterDiaSemana(hoje);
  const incluirPrecos = options.incluirPrecos ?? true;
  const incluirDescricoes = options.incluirDescricoes ?? true;

  // ─ Page dimensions (A4 in points: 595.28 × 841.89)
  const pageWidth = 595.28;
  const marginH = 40;
  const contentWidth = pageWidth - marginH * 2;

  // ─── Header ───
  const headerColumns: Content[] = [];

  if (logoBase64) {
    headerColumns.push({
      image: logoBase64,
      width: 80,
      height: 80,
      margin: [0, 0, 15, 0],
    } as any);
  }

  headerColumns.push({
    stack: [
      {
        text: RESTAURANT.name.toUpperCase(),
        style: 'restaurantName',
      },
      {
        text: RESTAURANT.tagline,
        style: 'tagline',
        margin: [0, 2, 0, 0],
      },
      {
        text: `Cardápio do Dia`,
        style: 'subtitle',
        margin: [0, 6, 0, 0],
      },
      {
        text: `${diaSemana}, ${dataCompleta}`,
        style: 'date',
        margin: [0, 4, 0, 0],
      },
    ],
    alignment: 'left',
  } as any);

  const header: Content = {
    columns: headerColumns,
    margin: [0, 0, 0, 15],
  };

  // ─── Decorative line after header ───
  const headerLine: Content = {
    canvas: [
      {
        type: 'line',
        x1: 0,
        y1: 0,
        x2: contentWidth,
        y2: 0,
        lineWidth: 2.5,
        lineColor: COLORS.rosaPrincipal,
      },
    ],
    margin: [0, 0, 0, 8],
  };

  // ─── Category sections ───
  const bodyContent: Content[] = [];

  for (const categoria of categorias) {
    // Category title
    bodyContent.push({
      text: `${categoria.icon}  ${categoria.nome.toUpperCase()}`,
      style: 'categoryTitle',
      margin: [0, 14, 0, 6],
    });

    // Separator line under category title
    bodyContent.push({
      canvas: [
        {
          type: 'line',
          x1: 0,
          y1: 0,
          x2: 180,
          y2: 0,
          lineWidth: 1.2,
          lineColor: COLORS.amareloDDurado,
        },
      ],
      margin: [0, 0, 0, 8],
    });

    // Items
    for (const item of categoria.itens) {
      const itemContent: Content[] = [];

      // Item name + price on same line
      if (incluirPrecos) {
        itemContent.push({
          columns: [
            {
              text: `•  ${item.name}`,
              style: 'itemName',
              width: '*' as any,
            },
            {
              text: `R$ ${Number(item.price).toFixed(2)}`,
              style: 'itemPrice',
              width: 'auto' as any,
              alignment: 'right' as const,
            },
          ],
          columnGap: 8,
        });
      } else {
        itemContent.push({
          text: `•  ${item.name}`,
          style: 'itemName',
        });
      }

      // Description
      if (incluirDescricoes && item.description) {
        itemContent.push({
          text: `     ${item.description}`,
          style: 'itemDescription',
          margin: [12, 1, 0, 0],
        });
      }

      bodyContent.push({
        stack: itemContent,
        margin: [8, 0, 0, 6],
      });
    }
  }

  // ─── Footer separator ───
  const footerLine: Content = {
    canvas: [
      {
        type: 'line',
        x1: 0,
        y1: 0,
        x2: contentWidth,
        y2: 0,
        lineWidth: 2,
        lineColor: COLORS.verdeFolha,
      },
    ],
    margin: [0, 20, 0, 12],
  };

  // ─── Footer content ───
  const footerContent: Content = {
    columns: [
      {
        stack: [
          {
            text: [
              { text: '📍  ', fontSize: 9 },
              { text: RESTAURANT.address, style: 'footer' },
            ],
          },
          {
            text: [
              { text: '📞  ', fontSize: 9 },
              { text: RESTAURANT.phone, style: 'footer' },
            ],
            margin: [0, 3, 0, 0],
          },
          {
            text: [
              { text: '💬  ', fontSize: 9 },
              { text: `WhatsApp: ${RESTAURANT.whatsapp}`, style: 'footer' },
            ],
            margin: [0, 3, 0, 0],
          },
        ],
        width: '*' as any,
      },
      {
        stack: [
          {
            text: [
              { text: '📸  ', fontSize: 9 },
              { text: RESTAURANT.instagram, style: 'footer' },
            ],
          },
          {
            text: [
              { text: '🕐  ', fontSize: 9 },
              { text: RESTAURANT.hours, style: 'footer' },
            ],
            margin: [0, 3, 0, 0],
          },
          {
            text: `"${RESTAURANT.slogan}"`,
            style: 'slogan',
            margin: [0, 8, 0, 0],
          },
        ],
        width: '*' as any,
        alignment: 'right' as const,
      },
    ],
  };

  // ─── Styles ───
  const styles: StyleDictionary = {
    restaurantName: {
      fontSize: 24,
      bold: true,
      color: COLORS.rosaPrincipal,
    },
    tagline: {
      fontSize: 10,
      color: COLORS.textoSecundario,
      italics: true,
    },
    subtitle: {
      fontSize: 16,
      bold: true,
      color: COLORS.roxoAcento,
    },
    date: {
      fontSize: 12,
      bold: true,
      color: COLORS.amareloDDurado,
    },
    categoryTitle: {
      fontSize: 15,
      bold: true,
      color: COLORS.rosaPrincipal,
    },
    itemName: {
      fontSize: 11,
      color: COLORS.textoPrincipal,
      bold: true,
    },
    itemPrice: {
      fontSize: 11,
      color: COLORS.rosaEscuro,
      bold: true,
    },
    itemDescription: {
      fontSize: 9,
      color: COLORS.textoSecundario,
      italics: true,
    },
    footer: {
      fontSize: 8,
      color: COLORS.textoSecundario,
      lineHeight: 1.3,
    },
    slogan: {
      fontSize: 9,
      italics: true,
      color: COLORS.rosaPrincipal,
      bold: true,
    },
  };

  return {
    pageSize: 'A4',
    pageMargins: [marginH, 50, marginH, 50],

    info: {
      title: `Cardápio Flor do Maracujá — ${dataCompleta}`,
      author: RESTAURANT.name,
      subject: 'Cardápio do Dia',
      keywords: 'cardapio, restaurante, flor do maracuja',
    },

    // Background: decorative border + subtle warm fill
    background: (currentPage: number, pageSize: { width: number; height: number }) => [
      // Warm background fill
      {
        canvas: [
          {
            type: 'rect',
            x: 0,
            y: 0,
            w: pageSize.width,
            h: pageSize.height,
            color: COLORS.fundoClaro,
          },
        ],
      },
      // Decorative border
      {
        canvas: [
          {
            type: 'rect',
            x: 12,
            y: 12,
            w: pageSize.width - 24,
            h: pageSize.height - 24,
            r: 8,
            lineWidth: 2.5,
            lineColor: COLORS.rosaPrincipal,
          },
        ],
      },
      // Inner accent border
      {
        canvas: [
          {
            type: 'rect',
            x: 16,
            y: 16,
            w: pageSize.width - 32,
            h: pageSize.height - 32,
            r: 6,
            lineWidth: 0.8,
            lineColor: COLORS.amareloDDurado,
          },
        ],
      },
    ],

    content: [
      header,
      headerLine,
      ...bodyContent,
      footerLine,
      footerContent,
    ],

    styles,

    defaultStyle: {
      font: 'Roboto',
      fontSize: 10,
      color: COLORS.textoPrincipal,
    },
  } as TDocumentDefinitions;
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Generate and download the daily menu PDF.
 */
export async function gerarPDFCardapio(
  items: MenuItemRow[],
  options: CardapioPDFOptions = {},
): Promise<void> {
  // 1. Group items by category
  const categorias = agruparPorCategoria(items);

  if (categorias.length === 0) {
    throw new Error('Nenhum item disponível no cardápio para gerar o PDF.');
  }

  // 2. Load logo
  const logoUrl = getPublicUrl(BUCKETS.LANDING_PAGE, 'logo/logo.png');
  const logoBase64 = await imageToBase64(logoUrl);

  // 3. Build document
  const docDefinition = buildDocDefinition(categorias, logoBase64, options);

  // 4. Generate & download
  const hoje = formatarDataArquivo(new Date());
  const filename = `cardapio-flor-do-maracuja-${hoje}.pdf`;

  return new Promise<void>((resolve, reject) => {
    try {
      pdfMake.createPdf(docDefinition).download(filename);
      // pdfmake download is async but doesn't reliably callback in all browsers
      setTimeout(resolve, 1000);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generate and open the daily menu PDF in a new tab.
 */
export async function abrirPDFCardapio(
  items: MenuItemRow[],
  options: CardapioPDFOptions = {},
): Promise<void> {
  const categorias = agruparPorCategoria(items);

  if (categorias.length === 0) {
    throw new Error('Nenhum item disponível no cardápio para gerar o PDF.');
  }

  const logoUrl = getPublicUrl(BUCKETS.LANDING_PAGE, 'logo/logo.png');
  const logoBase64 = await imageToBase64(logoUrl);

  const docDefinition = buildDocDefinition(categorias, logoBase64, options);

  pdfMake.createPdf(docDefinition).open();
}

/**
 * Generate and trigger the print dialog for the daily menu PDF.
 */
export async function imprimirPDFCardapio(
  items: MenuItemRow[],
  options: CardapioPDFOptions = {},
): Promise<void> {
  const categorias = agruparPorCategoria(items);

  if (categorias.length === 0) {
    throw new Error('Nenhum item disponível no cardápio para gerar o PDF.');
  }

  const logoUrl = getPublicUrl(BUCKETS.LANDING_PAGE, 'logo/logo.png');
  const logoBase64 = await imageToBase64(logoUrl);

  const docDefinition = buildDocDefinition(categorias, logoBase64, options);

  pdfMake.createPdf(docDefinition).print();
}
