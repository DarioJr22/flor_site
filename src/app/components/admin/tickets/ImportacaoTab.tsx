// ============================================================
// ImportacaoTab — Aba de importação de pedidos (copar e colar texto)
// ============================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import {
  ClipboardPaste,
  Trash2,
  Save,
  Printer,
  Loader2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useEmpresas } from '../../../../hooks/useEmpresas';
import { useTickets } from '../../../../hooks/useTickets';
import { useImpressoraGT710 } from '../../../../hooks/useImpressoraGT710';
import { parseRelatorio, labelSeparador } from '../../../../lib/tickets/parseRelatorio';
import { GridPedidos, type PedidoGrid } from './GridPedidos';
import { ImpressoraControls } from './ImpressoraControls';
import type { TicketAlimentacaoInsert, TicketAlimentacaoRow } from '../../../../lib/database.types';

export function ImportacaoTab() {
  const { empresas, ativas, empresasMap } = useEmpresas();
  const { createBatch, marcarImpressos, verificarDuplicados } = useTickets();
  const impressoraHook = useImpressoraGT710();

  const [empresaSelecionadaId, setEmpresaSelecionadaId] = useState<string>('');
  const [dataRefeicao, setDataRefeicao] = useState(() => {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  });
  const [textoRelatorio, setTextoRelatorio] = useState('');
  const [pedidos, setPedidos] = useState<PedidoGrid[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [processando, setProcessando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [imprimindoId, setImprimindoId] = useState<string | null>(null);
  const [pedidosSalvos, setPedidosSalvos] = useState(false);
  const [separadorInfo, setSeparadorInfo] = useState('');
  const [errosParser, setErrosParser] = useState<string[]>([]);
  const [empresaError, setEmpresaError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const processTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-processar após Ctrl+V com delay
  const handlePaste = useCallback(() => {
    if (processTimeoutRef.current) clearTimeout(processTimeoutRef.current);
    processTimeoutRef.current = setTimeout(() => {
      if (textareaRef.current && textareaRef.current.value.trim()) {
        processarRelatorio(textareaRef.current.value);
      }
    }, 500) as unknown as ReturnType<typeof setTimeout>;
  }, [empresaSelecionadaId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Atalhos de teclado
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (pedidos.length > 0 && !pedidosSalvos) handleSalvar();
      }
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        if (selectedIds.size > 0) handleImprimirSelecionados();
      }
      if (e.key === 'Escape') {
        setSelectedIds(new Set());
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [pedidos, pedidosSalvos, selectedIds]); // eslint-disable-line react-hooks/exhaustive-deps

  const processarRelatorio = (texto?: string) => {
    const input = texto ?? textoRelatorio;
    if (!input.trim()) {
      toast.error('Cole o relatório antes de processar');
      return;
    }

    setProcessando(true);
    const empresaPadrao = empresaSelecionadaId
      ? empresasMap[empresaSelecionadaId]
      : undefined;

    const resultado = parseRelatorio(input, empresaPadrao);
    setSeparadorInfo(resultado.separadorDetectado);
    setErrosParser(resultado.erros);

    if (!resultado.sucesso) {
      toast.error('Nenhum pedido válido encontrado');
      setProcessando(false);
      return;
    }

    // Converter para grid
    const novosPedidos: PedidoGrid[] = resultado.pedidos.map((p, i) => {
      // Tentar encontrar a empresa pelo nome
      const empresaEncontrada = empresas.find(
        e => e.nome.toLowerCase() === (p.empresa ?? '').toLowerCase()
      );
      const empSelecionada = empresas.find(e => e.id === empresaSelecionadaId);
      return {
        id: `temp-${Date.now()}-${i}`,
        nome: p.nome,
        carne: p.carne,
        acompanhamentos: p.acompanhamentos,
        empresa: empresaEncontrada?.nome ?? p.empresa ?? 'Não identificada',
        empresaId: empresaEncontrada?.id ?? empresaSelecionadaId ?? '',
        status: 'pendente',
        valor: empresaEncontrada?.valor_ticket ?? empSelecionada?.valor_ticket ?? 25.0,
        editado: false,
      };
    });

    setPedidos(novosPedidos);
    setPedidosSalvos(false);
    setSelectedIds(new Set());

    toast.success(`${novosPedidos.length} pedidos processados`, {
      description: resultado.erros.length > 0
        ? `${resultado.erros.length} linhas com erro`
        : undefined,
    });
    setProcessando(false);
  };

  const handlePedidoChange = (index: number, campo: keyof PedidoGrid, valor: string) => {
    setPedidos(prev =>
      prev.map((p, i) => (i === index ? { ...p, [campo]: valor, editado: true } : p))
    );
    setPedidosSalvos(false);
  };

  const handleRemovePedido = (index: number) => {
    setPedidos(prev => prev.filter((_, i) => i !== index));
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === pedidos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pedidos.map(p => p.id)));
    }
  };

  const handleLimpar = () => {
    setTextoRelatorio('');
    setPedidos([]);
    setSelectedIds(new Set());
    setErrosParser([]);
    setSeparadorInfo('');
    setPedidosSalvos(false);
  };

  const handleSalvar = async () => {
    // Validação obrigatória: empresa e data
    if (!empresaSelecionadaId) {
      setEmpresaError(true);
      toast.error('Selecione uma empresa antes de salvar');
      return;
    }
    setEmpresaError(false);
    if (!dataRefeicao) {
      toast.error('Selecione a data da refeição antes de salvar');
      return;
    }

    // Processar relatório automaticamente se ainda não foi processado
    let pedidosParaSalvar: PedidoGrid[] = pedidos;
    if (pedidos.length === 0) {
      if (!textoRelatorio.trim()) {
        toast.error('Cole o relatório antes de salvar');
        return;
      }
      setProcessando(true);
      const empresaPadrao = empresas.find(e => e.id === empresaSelecionadaId);
      const resultadoParse = parseRelatorio(textoRelatorio, empresaPadrao?.nome);
      setSeparadorInfo(resultadoParse.separadorDetectado);
      setErrosParser(resultadoParse.erros);
      setProcessando(false);
      if (!resultadoParse.sucesso) {
        toast.error('Nenhum pedido válido encontrado no relatório');
        return;
      }
      pedidosParaSalvar = resultadoParse.pedidos.map((p, i) => {
        const empresaEncontrada = empresas.find(
          e => e.nome.toLowerCase() === (p.empresa ?? '').toLowerCase()
        );
        const emp = empresaEncontrada ?? empresas.find(e => e.id === empresaSelecionadaId);
        return {
          id: `temp-${Date.now()}-${i}`,
          nome: p.nome,
          carne: p.carne,
          acompanhamentos: p.acompanhamentos,
          empresa: emp?.nome ?? 'Não identificada',
          empresaId: emp?.id ?? empresaSelecionadaId,
          status: 'pendente' as const,
          valor: emp?.valor_ticket ?? 25.0,
          editado: false,
        };
      });
      setPedidos(pedidosParaSalvar);
    }

    if (pedidosParaSalvar.length === 0) return;

    // Garantir empresaId em todos os pedidos
    pedidosParaSalvar = pedidosParaSalvar.map(p => ({
      ...p,
      empresaId: p.empresaId || empresaSelecionadaId,
    }));

    setSalvando(true);

    // Verificar duplicados
    const nomes = pedidosParaSalvar.map(p => p.nome);
    const duplicados = await verificarDuplicados(nomes, empresaSelecionadaId, dataRefeicao);
    if (duplicados.length > 0) {
      const continuar = confirm(
        `${duplicados.length} ticket(s) duplicados encontrados:\n${duplicados.join(', ')}\n\nDeseja continuar mesmo assim?`
      );
      if (!continuar) {
        setSalvando(false);
        return;
      }
    }

    // Gerar lote de importação
    const loteId = crypto.randomUUID();
    const ticketsBatch: TicketAlimentacaoInsert[] = pedidosParaSalvar.map(p => ({
      empresa_id: p.empresaId,
      nome_funcionario: p.nome,
      carne: p.carne,
      acompanhamentos: p.acompanhamentos,
      data_refeicao: dataRefeicao,
      valor: p.valor,
      lote_importacao: loteId,
    }));

    const resultado = await createBatch(ticketsBatch);
    if (resultado && resultado.length > 0) {
      const ticketsSalvos = resultado as TicketAlimentacaoRow[];
      const pedidosAtualizados = pedidosParaSalvar.map((p, i) => ({
        ...p,
        id: ticketsSalvos[i]?.id ?? p.id,
        status: ticketsSalvos[i]?.status ?? p.status,
        ticketRef: ticketsSalvos[i],
      }));
      setPedidos(pedidosAtualizados);
      setPedidosSalvos(true);
      // Auto-selecionar todos após salvar para botão Imprimir aparecer imediatamente
      setSelectedIds(new Set(pedidosAtualizados.map(p => p.id)));
      toast.success(`${resultado.length} tickets salvos! Clique em Imprimir para imprimir.`);
    } else {
      toast.error('Erro ao salvar tickets');
    }
    setSalvando(false);
  };

  const handleImprimirUnico = async (pedido: PedidoGrid) => {
    if (!pedido.ticketRef) {
      toast.error('Salve os pedidos antes de imprimir');
      return;
    }

    setImprimindoId(pedido.id);

    const ok = await impressoraHook.imprimirEtiqueta(
      pedido.ticketRef,
      empresasMap[pedido.empresaId]
    );
    if (ok) {
      await marcarImpressos([pedido.ticketRef.id]);
      setPedidos(prev =>
        prev.map(p => (p.id === pedido.id ? { ...p, status: 'impresso' } : p))
      );
      toast.success(`Etiqueta impressa: ${pedido.nome}`);
    } else {
      toast.error('Erro ao imprimir etiqueta');
    }

    setImprimindoId(null);
  };

  const handleImprimirSelecionados = async () => {
    const selecionados = pedidos.filter(p => selectedIds.has(p.id));
    const comRef = selecionados.filter(p => p.ticketRef);

    if (comRef.length === 0) {
      toast.error('Salve os pedidos antes de imprimir');
      return;
    }

    const tickets = comRef.map(p => p.ticketRef!);
    const resultado = await impressoraHook.imprimirLote(tickets, empresasMap);

    if (resultado.sucesso > 0) {
      const ids = comRef.map(p => p.ticketRef!.id);
      await marcarImpressos(ids);
      setPedidos(prev =>
        prev.map(p =>
          ids.includes(p.ticketRef?.id ?? '')
            ? { ...p, status: 'impresso' }
            : p
        )
      );
      toast.success(`${resultado.sucesso} etiquetas enviadas para impressão`);
      if (resultado.erros > 0) {
        toast.warning(`${resultado.erros} etiquetas com erro`);
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Seleção de empresa e data */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Empresa <span className="text-red-500">*</span>
          </label>
          <select
            value={empresaSelecionadaId}
            onChange={e => { setEmpresaSelecionadaId(e.target.value); setEmpresaError(false); }}
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-amber-500 ${
              empresaError ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="" disabled>Selecione uma empresa *</option>
            {ativas.map(e => (
              <option key={e.id} value={e.id}>
                {e.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Data da Refeição</label>
          <input
            type="date"
            value={dataRefeicao}
            onChange={e => setDataRefeicao(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Textarea de importação */}
      <div>
        <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
          <ClipboardPaste size={14} />
          Cole o relatório aqui
        </label>
        <textarea
          ref={textareaRef}
          value={textoRelatorio}
          onChange={e => setTextoRelatorio(e.target.value)}
          onPaste={handlePaste}
          rows={8}
          placeholder={`nome;carne;acompanhamento;empresa\nFulano;galinha guisada;feijão,arroz;saraiva\nCiclano;carne de sol;farofa,arroz;saraiva`}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
        />

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            {textoRelatorio.trim() && !pedidosSalvos && (
              <button
                onClick={handleSalvar}
                disabled={salvando || processando}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {salvando || processando ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                Salvar Pedidos
              </button>
            )}
            <button
              onClick={() => processarRelatorio()}
              disabled={processando || !textoRelatorio.trim()}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              {processando ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <FileText size={14} />
              )}
              Pré-visualizar
            </button>
            <button
              onClick={handleLimpar}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <Trash2 size={14} /> Limpar
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {separadorInfo && (
              <span>
                <Info size={12} className="inline" /> Separador: {labelSeparador(separadorInfo)}
              </span>
            )}
            <span>{pedidos.length} pedidos</span>
          </div>
        </div>
      </div>

      {/* Erros do parser */}
      {errosParser.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
          <div className="mb-1 flex items-center gap-1 text-sm font-semibold text-yellow-700">
            <AlertTriangle size={14} />
            {errosParser.length} linha(s) com problema
          </div>
          <ul className="list-inside list-disc text-xs text-yellow-600">
            {errosParser.slice(0, 5).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
            {errosParser.length > 5 && (
              <li>...e mais {errosParser.length - 5} erros</li>
            )}
          </ul>
        </div>
      )}

      {/* Grid de pedidos processados */}
      {pedidos.length > 0 && (
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-gray-900">
              Pedidos Processados ({pedidos.length})
            </h4>
            <div className="flex gap-2">
              {pedidosSalvos && (
                <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                  <CheckCircle2 size={14} /> Salvos!
                </span>
              )}
              {selectedIds.size > 0 && pedidosSalvos && (
                <button
                  onClick={handleImprimirSelecionados}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Printer size={14} /> Imprimir {selectedIds.size} selecionado(s)
                </button>
              )}
            </div>
          </div>

          <GridPedidos
            pedidos={pedidos}
            onPedidoChange={handlePedidoChange}
            onRemovePedido={handleRemovePedido}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onImprimirUnico={pedidosSalvos ? handleImprimirUnico : undefined}
            imprimindoId={imprimindoId}
          />
        </div>
      )}

      {/* Controles da impressora */}
      <ImpressoraControls />
    </div>
  );
}
