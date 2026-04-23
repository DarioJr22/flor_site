// ============================================================
// GridPedidos — Grid editável de pedidos processados
// ============================================================

import { useState } from 'react';
import { Printer, Trash2, Loader2 } from 'lucide-react';
import type { TicketAlimentacaoRow } from '../../../../lib/database.types';

export interface PedidoGrid {
  /** ID temporário (índice) para pedidos não salvos, ou ID real para salvos */
  id: string;
  nome: string;
  carne: string;
  acompanhamentos: string;
  empresa: string;
  empresaId: string;
  status: string;
  valor: number;
  editado: boolean;
  /** Referência opcional ao ticket salvo */
  ticketRef?: TicketAlimentacaoRow;
}

interface Props {
  pedidos: PedidoGrid[];
  onPedidoChange: (index: number, campo: keyof PedidoGrid, valor: string) => void;
  onRemovePedido: (index: number) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onImprimirUnico?: (pedido: PedidoGrid) => void;
  imprimindoId?: string | null;
}

const STATUS_BADGE: Record<string, string> = {
  pendente: 'bg-yellow-100 text-yellow-700',
  impresso: 'bg-blue-100 text-blue-700',
  entregue: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-600',
};

export function GridPedidos({
  pedidos,
  onPedidoChange,
  onRemovePedido,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onImprimirUnico,
  imprimindoId,
}: Props) {
  const [editingCell, setEditingCell] = useState<{ index: number; campo: string } | null>(null);

  const todosSelected = pedidos.length > 0 && pedidos.every(p => selectedIds.has(p.id));

  if (pedidos.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-gray-400">
        Nenhum pedido processado. Cole o relatório acima e clique em "Processar".
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-3 py-3 text-center">
                <input
                  type="checkbox"
                  checked={todosSelected}
                  onChange={onSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
              </th>
              <th className="px-3 py-3">Nome</th>
              <th className="px-3 py-3">Carne</th>
              <th className="px-3 py-3">Acompanhamentos</th>
              <th className="px-3 py-3">Empresa</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pedidos.map((pedido, index) => (
              <tr
                key={pedido.id}
                className={`transition ${
                  pedido.editado ? 'bg-amber-50/50' : 'hover:bg-gray-50'
                } ${selectedIds.has(pedido.id) ? 'bg-amber-50' : ''}`}
              >
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(pedido.id)}
                    onChange={() => onToggleSelect(pedido.id)}
                    className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                </td>
                <td className="px-3 py-2">
                  <EditableCell
                    value={pedido.nome}
                    isEditing={editingCell?.index === index && editingCell?.campo === 'nome'}
                    onStartEdit={() => setEditingCell({ index, campo: 'nome' })}
                    onEndEdit={val => {
                      onPedidoChange(index, 'nome', val);
                      setEditingCell(null);
                    }}
                  />
                </td>
                <td className="px-3 py-2">
                  <EditableCell
                    value={pedido.carne}
                    isEditing={editingCell?.index === index && editingCell?.campo === 'carne'}
                    onStartEdit={() => setEditingCell({ index, campo: 'carne' })}
                    onEndEdit={val => {
                      onPedidoChange(index, 'carne', val);
                      setEditingCell(null);
                    }}
                  />
                </td>
                <td className="px-3 py-2">
                  <EditableCell
                    value={pedido.acompanhamentos}
                    isEditing={editingCell?.index === index && editingCell?.campo === 'acompanhamentos'}
                    onStartEdit={() => setEditingCell({ index, campo: 'acompanhamentos' })}
                    onEndEdit={val => {
                      onPedidoChange(index, 'acompanhamentos', val);
                      setEditingCell(null);
                    }}
                  />
                </td>
                <td className="px-3 py-2 text-xs text-gray-600">{pedido.empresa}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      STATUS_BADGE[pedido.status] ?? STATUS_BADGE.pendente
                    }`}
                  >
                    {pedido.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1">
                    {onImprimirUnico && (
                      <button
                        onClick={() => onImprimirUnico(pedido)}
                        disabled={imprimindoId === pedido.id}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                        title="Imprimir etiqueta"
                      >
                        {imprimindoId === pedido.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Printer size={14} />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => onRemovePedido(index)}
                      className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                      title="Remover"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----- Célula Editável -----

interface EditableCellProps {
  value: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onEndEdit: (value: string) => void;
}

function EditableCell({ value, isEditing, onStartEdit, onEndEdit }: EditableCellProps) {
  const [tempValue, setTempValue] = useState(value);

  if (isEditing) {
    return (
      <input
        autoFocus
        className="w-full rounded border border-amber-400 bg-amber-50 px-2 py-1 text-sm outline-none"
        value={tempValue}
        onChange={e => setTempValue(e.target.value)}
        onBlur={() => onEndEdit(tempValue)}
        onKeyDown={e => {
          if (e.key === 'Enter') onEndEdit(tempValue);
          if (e.key === 'Escape') {
            setTempValue(value);
            onEndEdit(value);
          }
        }}
      />
    );
  }

  return (
    <span
      className="cursor-pointer rounded px-1 py-0.5 text-gray-900 hover:bg-amber-50"
      onClick={() => {
        setTempValue(value);
        onStartEdit();
      }}
      title="Clique para editar"
    >
      {value}
    </span>
  );
}
