// ============================================================
// Cardapio PDF Generator — Flor do Maracuja
// Generates a beautifully styled A4 PDF of the daily menu
// using pdfmake with the restaurant's brand identity.
//
// - Food photos rendered next to each item
// - Default placeholder when item has no image
// - No emojis (Roboto doesn't support them) — uses styled text
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
  amareloDurado: '#FFD700',
  amareloClaro: '#FFF4CC',
  verdeFolha: '#8BC34A',
  verdeEscuro: '#689F38',
  roxoAcento: '#8B1874',
  textoPrincipal: '#2C2C2C',
  textoSecundario: '#666666',
  fundoClaro: '#FFFCF7',
  branco: '#FFFFFF',
  cinzaClaro: '#F3F3F3',
} as const;

// ─── Category config (NO emojis — text only) ────────────────
const CATEGORY_CONFIG: Record<string, { label: string; order: number }> = {
  'Pratos Principais': { label: 'PRATOS PRINCIPAIS', order: 1 },
  'Entradas':          { label: 'ENTRADAS',          order: 2 },
  'Porcoes':           { label: 'PORCOES',           order: 3 },
  'Sobremesas':        { label: 'SOBREMESAS',        order: 4 },
  'Bebidas':           { label: 'BEBIDAS',           order: 5 },
};

// ─── Restaurant Info ─────────────────────────────────────────
const RESTAURANT = {
  name: 'Flor do Maracuja',
  tagline: 'Cozinha Regional com Sabor de Casa',
  slogan: 'Alimentacao saudavel com sabor!',
  address: 'Av. Mal. Mascarenhas de Morais, 4715 - Imbiribeira, Recife - PE',
  phone: '55 81 9967-8850',
  whatsapp: '55 81 8616-1540',
  instagram: '@flordomaracuja21',
  site: 'www.flordomaracuja.com.br',
  hours: 'Seg-Sex 11h-15h / 18h-22h | Sab 11h-23h | Dom 11h-16h',
} as const;

// ─── Item photo size in the PDF ──────────────────────────────
const PHOTO_SIZE = 52; // px (width & height)

// ─── Date Formatting Helpers ─────────────────────────────────

const DIAS_SEMANA = [
  'Domingo', 'Segunda-feira', 'Terca-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sabado',
];

const MESES = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
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
  label: string;
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
      const config = CATEGORY_CONFIG[nome] ?? { label: nome.toUpperCase(), order: 99 };
      return { nome, label: config.label, order: config.order, itens };
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

// ─── Generate a default placeholder image via Canvas ─────────

function generatePlaceholderBase64(size: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Background gradient (pink → gold)
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#FCE4EC');
  grad.addColorStop(1, '#FFF8E1');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Rounded corners clip
  const r = size * 0.12;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  // Fork/knife icon (simple shapes)
  ctx.strokeStyle = COLORS.rosaPrincipal;
  ctx.lineWidth = size * 0.04;
  ctx.lineCap = 'round';

  const cx = size / 2;
  const cy = size / 2;
  const s = size * 0.18;

  // Fork (left)
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.6, cy - s);
  ctx.lineTo(cx - s * 0.6, cy + s * 1.2);
  ctx.stroke();
  // Fork prongs
  ctx.beginPath();
  ctx.moveTo(cx - s * 1.0, cy - s);
  ctx.lineTo(cx - s * 1.0, cy - s * 0.3);
  ctx.quadraticCurveTo(cx - s * 1.0, cy + s * 0.1, cx - s * 0.6, cy + s * 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.2, cy - s);
  ctx.lineTo(cx - s * 0.2, cy - s * 0.3);
  ctx.quadraticCurveTo(cx - s * 0.2, cy + s * 0.1, cx - s * 0.6, cy + s * 0.1);
  ctx.stroke();

  // Knife (right)
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.6, cy - s);
  ctx.lineTo(cx + s * 0.6, cy + s * 1.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.6, cy - s);
  ctx.quadraticCurveTo(cx + s * 1.2, cy - s * 0.2, cx + s * 0.6, cy + s * 0.3);
  ctx.stroke();

  // Small label
  ctx.fillStyle = COLORS.textoSecundario;
  ctx.font = `${Math.round(size * 0.09)}px Roboto, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('Sem foto', cx, cy + s * 1.7);

  return canvas.toDataURL('image/png');
}

// ─── Pre-load all item images in parallel ────────────────────

async function preloadItemImages(
  items: MenuItemRow[],
): Promise<Map<string, string>> {
  const imgMap = new Map<string, string>();
  const placeholder = generatePlaceholderBase64(PHOTO_SIZE * 3); // 3x for quality

  const promises = items
    .filter((i) => i.available)
    .map(async (item) => {
      if (item.image_path) {
        const url = getPublicUrl(BUCKETS.MENU_ITEMS, item.image_path);
        const b64 = await imageToBase64(url);
        imgMap.set(item.id, b64 ?? placeholder);
      } else {
        imgMap.set(item.id, placeholder);
      }
    });

  await Promise.all(promises);
  return imgMap;
}

// ─── Build pdfmake docDefinition ─────────────────────────────

export interface CardapioPDFOptions {
  incluirPrecos?: boolean;
  incluirDescricoes?: boolean;
}

function buildDocDefinition(
  categorias: CategoriaAgrupada[],
  logoBase64: string | null,
  itemImages: Map<string, string>,
  options: CardapioPDFOptions,
): TDocumentDefinitions {
  const hoje = new Date();
  const dataCompleta = formatarDataCompleta(hoje);
  const diaSemana = obterDiaSemana(hoje);
  const incluirPrecos = options.incluirPrecos ?? true;
  const incluirDescricoes = options.incluirDescricoes ?? true;

  // ─ Page dimensions (A4 in points: 595.28 x 841.89)
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
        text: 'Cardapio do Dia',
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
    // Category title — styled text, no emoji
    bodyContent.push({
      text: [
        { text: '// ', color: COLORS.amareloDurado, bold: true },
        { text: categoria.label, style: 'categoryTitle' },
      ],
      margin: [0, 14, 0, 6],
    });

    // Separator line under category title
    bodyContent.push({
      canvas: [
        {
          type: 'line',
          x1: 0,
          y1: 0,
          x2: 200,
          y2: 0,
          lineWidth: 1.5,
          lineColor: COLORS.amareloDurado,
        },
      ],
      margin: [0, 0, 0, 10],
    });

    // Items — each with photo on the left
    for (const item of categoria.itens) {
      const imgBase64 = itemImages.get(item.id);

      // Right-side: name + price + description
      const textStack: Content[] = [];

      if (incluirPrecos) {
        textStack.push({
          columns: [
            {
              text: item.name,
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
          columnGap: 6,
        });
      } else {
        textStack.push({
          text: item.name,
          style: 'itemName',
        });
      }

      if (incluirDescricoes && item.description) {
        textStack.push({
          text: item.description,
          style: 'itemDescription',
          margin: [0, 2, 0, 0],
        });
      }

      // Badges
      const badges = item.badges ?? [];
      if (badges.length > 0) {
        const badgeLabels: Record<string, string> = {
          bestseller: 'Mais Pedido',
          new: 'Novidade',
          spicy: 'Picante',
        };
        textStack.push({
          text: badges.map((b) => badgeLabels[b] ?? b).join('  |  '),
          style: 'badge',
          margin: [0, 3, 0, 0],
        });
      }

      // Compose columns: [photo] [gap] [text]
      const itemRow: Content = {
        columns: [
          imgBase64
            ? ({
                image: imgBase64,
                width: PHOTO_SIZE,
                height: PHOTO_SIZE,
              } as any)
            : ({
                // Fallback colored box if base64 failed entirely
                canvas: [
                  {
                    type: 'rect',
                    x: 0,
                    y: 0,
                    w: PHOTO_SIZE,
                    h: PHOTO_SIZE,
                    r: 4,
                    color: COLORS.cinzaClaro,
                  },
                ],
                width: PHOTO_SIZE,
              } as any),
          {
            stack: textStack,
            width: '*' as any,
            margin: [0, 2, 0, 0],
          },
        ],
        columnGap: 14,
        margin: [4, 0, 0, 10],
      };

      bodyContent.push(itemRow);
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

  // ─── Footer content (no emojis — text prefixes) ───
  const footerContent: Content = {
    columns: [
      {
        stack: [
          { text: RESTAURANT.address, style: 'footer' },
          { text: `Tel: ${RESTAURANT.phone}`, style: 'footer', margin: [0, 3, 0, 0] },
          { text: `WhatsApp: ${RESTAURANT.whatsapp}`, style: 'footer', margin: [0, 3, 0, 0] },
        ],
        width: '*' as any,
      },
      {
        stack: [
          { text: `Instagram: ${RESTAURANT.instagram}`, style: 'footer' },
          { text: RESTAURANT.hours, style: 'footer', margin: [0, 3, 0, 0] },
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
      color: COLORS.amareloDurado,
    },
    categoryTitle: {
      fontSize: 14,
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
      lineHeight: 1.2,
    },
    badge: {
      fontSize: 8,
      color: COLORS.amareloDurado,
      bold: true,
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
      title: `Cardapio Flor do Maracuja - ${dataCompleta}`,
      author: RESTAURANT.name,
      subject: 'Cardapio do Dia',
      keywords: 'cardapio, restaurante, flor do maracuja',
    },

    // Background: decorative border + subtle warm fill
    background: (_currentPage: number, pageSize: { width: number; height: number }) => [
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
            lineColor: COLORS.amareloDurado,
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

// ─── Shared: prepare data + images, then build ───────────────

async function prepareDocument(
  items: MenuItemRow[],
  options: CardapioPDFOptions,
): Promise<TDocumentDefinitions> {
  const categorias = agruparPorCategoria(items);

  if (categorias.length === 0) {
    throw new Error('Nenhum item disponivel no cardapio para gerar o PDF.');
  }

  // Load logo + all item images in parallel
  const logoUrl = getPublicUrl(BUCKETS.LANDING_PAGE, 'logo/logo.png');
  const [logoBase64, itemImages] = await Promise.all([
    imageToBase64(logoUrl),
    preloadItemImages(items),
  ]);

  return buildDocDefinition(categorias, logoBase64, itemImages, options);
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Generate and download the daily menu PDF.
 */
export async function gerarPDFCardapio(
  items: MenuItemRow[],
  options: CardapioPDFOptions = {},
): Promise<void> {
  const docDefinition = await prepareDocument(items, options);

  const hoje = formatarDataArquivo(new Date());
  const filename = `cardapio-flor-do-maracuja-${hoje}.pdf`;

  return new Promise<void>((resolve, reject) => {
    try {
      pdfMake.createPdf(docDefinition).download(filename);
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
  const docDefinition = await prepareDocument(items, options);
  pdfMake.createPdf(docDefinition).open();
}

/**
 * Generate and trigger the print dialog for the daily menu PDF.
 */
export async function imprimirPDFCardapio(
  items: MenuItemRow[],
  options: CardapioPDFOptions = {},
): Promise<void> {
  const docDefinition = await prepareDocument(items, options);
  pdfMake.createPdf(docDefinition).print();
}
