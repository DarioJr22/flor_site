// ============================================================
// Parser de Relatório — Tickets Empresariais
// Converte texto colado (CSV, TSV, etc.) em linhas de pedidos
// ============================================================

export interface LinhaRelatorio {
  nome: string;
  carne: string;
  acompanhamentos: string;
  empresa?: string;
}

export interface ResultadoParser {
  sucesso: boolean;
  pedidos: LinhaRelatorio[];
  erros: string[];
  separadorDetectado: string;
}

/** Separadores suportados, em ordem de prioridade */
const SEPARADORES = [';', '\t', '|', ','] as const;

/** Palavras-chave de cabeçalho (case-insensitive) */
const PALAVRAS_CABECALHO = ['nome', 'carne', 'acompanhamento', 'empresa', 'funcionario', 'funcionário'];

/**
 * Detecta o separador mais provável analisando a frequência em cada linha.
 * Retorna o separador que aparece de forma mais consistente.
 */
function detectarSeparador(linhas: string[]): string {
  // Pegar no máximo 10 linhas não-vazias para análise
  const amostra = linhas.filter(l => l.trim().length > 0).slice(0, 10);
  if (amostra.length === 0) return ';';

  let melhorSep = ';';
  let melhorScore = -1;

  for (const sep of SEPARADORES) {
    const contagens = amostra.map(l => l.split(sep).length - 1);
    const primeiraContagem = contagens[0];

    // Se todas as linhas têm a mesma contagem de separadores e é >= 2
    if (primeiraContagem >= 2 && contagens.every(c => c === primeiraContagem)) {
      const score = primeiraContagem * 10 + (sep === ';' ? 2 : sep === '\t' ? 1 : 0);
      if (score > melhorScore) {
        melhorScore = score;
        melhorSep = sep;
      }
    }
  }

  // Fallback: tentar encontrar qualquer separador com contagem >= 2 em ao menos 80% das linhas
  if (melhorScore === -1) {
    for (const sep of SEPARADORES) {
      const contagens = amostra.map(l => l.split(sep).length - 1);
      const comSep = contagens.filter(c => c >= 2).length;
      if (comSep / amostra.length >= 0.8) {
        melhorSep = sep;
        break;
      }
    }
  }

  return melhorSep;
}

/**
 * Verifica se uma linha é um cabeçalho (contém palavras como "nome", "carne", etc.)
 */
function ehCabecalho(linha: string): boolean {
  const lower = linha.toLowerCase();
  const matches = PALAVRAS_CABECALHO.filter(p => lower.includes(p));
  return matches.length >= 2;
}

/**
 * Sanitiza um campo: trim, capitalização, remoção de caracteres especiais indesejados
 */
function sanitizarCampo(valor: string): string {
  return valor
    .trim()
    .replace(/^["']|["']$/g, '') // Remove aspas envolventes
    .replace(/\s+/g, ' ');       // Normaliza espaços
}

/**
 * Capitaliza a primeira letra de cada palavra
 */
function capitalizar(texto: string): string {
  return texto
    .toLowerCase()
    .replace(/(?:^|\s|[-/])\S/g, match => match.toUpperCase());
}

/**
 * Parseia texto colado em um array de pedidos.
 *
 * @param texto - Texto bruto colado pelo admin (formato CSV/TSV)
 * @param empresaPadrao - Nome da empresa a usar quando não informado na linha
 * @returns Resultado com pedidos parseados e erros encontrados
 *
 * @example
 * ```ts
 * const resultado = parseRelatorio(
 *   "João;galinha;feijão,arroz\nMaria;carne de sol;farofa",
 *   "Saraiva"
 * );
 * // resultado.pedidos = [
 * //   { nome: "João", carne: "Galinha", acompanhamentos: "Feijão, Arroz", empresa: "Saraiva" },
 * //   { nome: "Maria", carne: "Carne De Sol", acompanhamentos: "Farofa", empresa: "Saraiva" }
 * // ]
 * ```
 */
export function parseRelatorio(texto: string, empresaPadrao?: string): ResultadoParser {
  const erros: string[] = [];
  const pedidos: LinhaRelatorio[] = [];

  if (!texto || texto.trim().length === 0) {
    return { sucesso: false, pedidos: [], erros: ['Texto vazio'], separadorDetectado: '' };
  }

  // Normalizar quebras de linha
  const linhas = texto
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter(l => l.trim().length > 0);

  if (linhas.length === 0) {
    return { sucesso: false, pedidos: [], erros: ['Nenhuma linha válida encontrada'], separadorDetectado: '' };
  }

  const separador = detectarSeparador(linhas);
  let linhasProcessar = linhas;

  // Ignorar cabeçalho se detectado
  if (ehCabecalho(linhasProcessar[0])) {
    linhasProcessar = linhasProcessar.slice(1);
  }

  for (let i = 0; i < linhasProcessar.length; i++) {
    const linhaOriginal = linhasProcessar[i];
    const numeroLinha = i + 1;
    const campos = linhaOriginal.split(separador).map(sanitizarCampo);

    // Validar número mínimo de campos (nome, carne, acompanhamento)
    if (campos.length < 3) {
      erros.push(`Linha ${numeroLinha}: esperado ao menos 3 campos (nome, carne, acompanhamento), encontrado ${campos.length}`);
      continue;
    }

    const nome = campos[0];
    const carne = campos[1];
    const acompanhamentos = campos[2];
    const empresaLinha = campos.length >= 4 ? campos[3] : undefined;

    // Validações
    if (nome.length < 2) {
      erros.push(`Linha ${numeroLinha}: nome muito curto "${nome}"`);
      continue;
    }
    if (nome.length > 255) {
      erros.push(`Linha ${numeroLinha}: nome excede 255 caracteres`);
      continue;
    }
    if (carne.length < 2) {
      erros.push(`Linha ${numeroLinha}: carne/proteína muito curta "${carne}"`);
      continue;
    }
    if (acompanhamentos.length < 1) {
      erros.push(`Linha ${numeroLinha}: acompanhamentos não informados`);
      continue;
    }

    pedidos.push({
      nome: capitalizar(nome),
      carne: capitalizar(carne),
      acompanhamentos: acompanhamentos
        .split(',')
        .map(a => capitalizar(a.trim()))
        .filter(a => a.length > 0)
        .join(', '),
      empresa: empresaLinha ? capitalizar(empresaLinha) : empresaPadrao,
    });
  }

  return {
    sucesso: pedidos.length > 0,
    pedidos,
    erros,
    separadorDetectado: separador === '\t' ? 'TAB' : separador,
  };
}

/**
 * Retorna um rótulo legível para o separador
 */
export function labelSeparador(sep: string): string {
  switch (sep) {
    case ';': return 'Ponto-e-vírgula (;)';
    case '\t': case 'TAB': return 'Tabulação (TAB)';
    case '|': return 'Pipe (|)';
    case ',': return 'Vírgula (,)';
    default: return sep;
  }
}
