import { useState } from 'react';
import { Printer, Download, ExternalLink, Loader2, FileText, ChevronDown } from 'lucide-react';
import { gerarPDFCardapio, abrirPDFCardapio, imprimirPDFCardapio } from '../../../lib/cardapioPDF';
import type { CardapioPDFOptions } from '../../../lib/cardapioPDF';
import type { MenuItemRow } from '../../../lib/database.types';
import { toast } from 'sonner';

interface PrintMenuButtonProps {
  items: MenuItemRow[];
}

export function PrintMenuButton({ items }: PrintMenuButtonProps) {
  const [generating, setGenerating] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<CardapioPDFOptions>({
    incluirPrecos: true,
    incluirDescricoes: true,
  });

  const availableCount = items.filter((i) => i.available).length;

  const handleGenerate = async (
    action: 'download' | 'open' | 'print',
  ) => {
    if (availableCount === 0) {
      toast.error('Nenhum item disponível no cardápio.');
      return;
    }

    setGenerating(true);
    setShowOptions(false);

    try {
      switch (action) {
        case 'download':
          await gerarPDFCardapio(items, options);
          toast.success('PDF do cardápio gerado com sucesso!');
          break;
        case 'open':
          await abrirPDFCardapio(items, options);
          break;
        case 'print':
          await imprimirPDFCardapio(items, options);
          break;
      }
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      toast.error('Erro ao gerar o PDF do cardápio.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="relative">
      {/* Main button group */}
      <div className="flex items-stretch">
        {/* Primary action: Download PDF */}
        <button
          onClick={() => handleGenerate('download')}
          disabled={generating || availableCount === 0}
          className="flex items-center gap-2 rounded-l-lg bg-gradient-to-r from-pink-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-pink-700 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {generating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <FileText size={16} />
          )}
          Imprimir Cardápio do Dia
        </button>

        {/* Dropdown toggle */}
        <button
          onClick={() => setShowOptions((prev) => !prev)}
          disabled={generating || availableCount === 0}
          className="flex items-center rounded-r-lg border-l border-pink-700 bg-gradient-to-r from-pink-600 to-pink-500 px-2 py-2 text-white transition hover:from-pink-700 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Dropdown menu */}
      {showOptions && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-30" onClick={() => setShowOptions(false)} />

          <div className="absolute right-0 z-40 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
            {/* Actions */}
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Ação
            </p>
            <div className="mb-3 flex gap-1">
              <button
                onClick={() => handleGenerate('download')}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-pink-50 hover:text-pink-700"
              >
                <Download size={14} />
                Baixar
              </button>
              <button
                onClick={() => handleGenerate('open')}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-pink-50 hover:text-pink-700"
              >
                <ExternalLink size={14} />
                Nova Aba
              </button>
              <button
                onClick={() => handleGenerate('print')}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-pink-50 hover:text-pink-700"
              >
                <Printer size={14} />
                Imprimir
              </button>
            </div>

            {/* Options */}
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Opções
            </p>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={options.incluirPrecos}
                  onChange={(e) =>
                    setOptions((prev) => ({ ...prev, incluirPrecos: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                Incluir preços
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={options.incluirDescricoes}
                  onChange={(e) =>
                    setOptions((prev) => ({ ...prev, incluirDescricoes: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                Incluir descrições
              </label>
            </div>

            {/* Info */}
            <p className="mt-3 text-center text-xs text-gray-400">
              {availableCount} {availableCount === 1 ? 'item disponível' : 'itens disponíveis'}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
