// ============================================================
// ImpressoraControls — Status e controles da impressora POS-80
// ============================================================

import { Printer, TestTube, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useImpressoraGT710 } from '../../../../hooks/useImpressoraGT710';

interface Props {
  /** Expor o hook para uso pelo componente pai */
  onHookReady?: (hook: ReturnType<typeof useImpressoraGT710>) => void;
}

export function ImpressoraControls({ onHookReady }: Props) {
  const impressoraHook = useImpressoraGT710();
  const { status, progresso, testarImpressao } = impressoraHook;

  // Expor hook para o componente pai
  if (onHookReady) onHookReady(impressoraHook);

  const handleTeste = async () => {
    const ok = await testarImpressao();
    if (ok) toast.success('Etiqueta de teste enviada! Selecione a impressora POS-80 no diálogo.');
    else toast.error(status.ultimoErro ?? 'Erro ao imprimir teste');
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5">
      {/* Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Printer size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Impressora:</span>
        </div>

        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-green-500" />
          <span className="text-xs font-semibold text-green-600">
            {status.modelo} (Driver Windows)
          </span>
        </div>

        {status.ultimoErro && (
          <span className="text-xs text-red-500" title={status.ultimoErro}>
            <AlertCircle size={12} className="inline" /> {status.ultimoErro}
          </span>
        )}
      </div>

      {/* Dica */}
      <span className="text-xs text-gray-400">
        Selecione <b>POS-80</b> ou <b>POS80 Printer</b> no diálogo de impressão
      </span>

      {/* Progresso de lote */}
      {progresso && !progresso.concluido && (
        <div className="flex items-center gap-2">
          <Loader2 size={14} className="animate-spin text-amber-600" />
          <span className="text-xs text-gray-600">
            Preparando {progresso.total} etiquetas...
          </span>
        </div>
      )}

      {/* Botão Teste */}
      <button
        onClick={handleTeste}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
      >
        <TestTube size={13} /> Imprimir Teste
      </button>
    </div>
  );
}
