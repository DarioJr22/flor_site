import { useState } from 'react';
import { useOrders } from '../../../hooks/useOrders';
import type { OrderRow, OrderStatus } from '../../../lib/database.types';
import { toast } from 'sonner';
import {
  Loader2,
  Trash2,
  Eye,
  X,
  ChevronDown,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
} from 'lucide-react';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; icon: typeof Clock }
> = {
  pending:    { label: 'Pendente',    color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed:  { label: 'Confirmado',  color: 'bg-blue-100 text-blue-800',     icon: CheckCircle2 },
  preparing:  { label: 'Preparando',  color: 'bg-purple-100 text-purple-800', icon: ChefHat },
  delivered:  { label: 'Entregue',    color: 'bg-green-100 text-green-800',   icon: Package },
  cancelled:  { label: 'Cancelado',   color: 'bg-red-100 text-red-800',       icon: XCircle },
};

const ALL_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'];

export function OrdersManager() {
  const { orders, loading, error, update, remove } = useOrders();
  const [viewOrder, setViewOrder] = useState<OrderRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');

  const filteredOrders =
    filterStatus === 'all'
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    setUpdatingId(id);
    const result = await update(id, { status: newStatus });
    if (result) toast.success(`Status → ${STATUS_CONFIG[newStatus].label}`);
    else toast.error('Erro ao atualizar status');
    setUpdatingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este pedido?')) return;
    setDeletingId(id);
    const ok = await remove(id);
    if (ok) toast.success('Pedido excluído!');
    else toast.error('Erro ao excluir');
    setDeletingId(null);
  };

  const parseItems = (items: unknown): Array<{ name: string; quantity: number; price: number; observations?: string }> => {
    try {
      if (Array.isArray(items)) return items;
      if (typeof items === 'string') return JSON.parse(items);
      return [];
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header + filter */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Pedidos</h2>
          <p className="text-sm text-gray-500">{filteredOrders.length} pedidos</p>
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'all')}
            className="appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-8 text-sm outline-none focus:border-amber-500"
          >
            <option value="all">Todos os status</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s].label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => {
                const items = parseItems(order.items);
                const cfg = STATUS_CONFIG[order.status];
                return (
                  <tr key={order.id} className="transition hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {order.id.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {order.customer_name || '—'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.customer_phone || ''}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      R$ {Number(order.total).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative inline-block">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as OrderStatus)
                          }
                          disabled={updatingId === order.id}
                          className={`appearance-none rounded-full px-3 py-1 pr-7 text-xs font-medium outline-none ${cfg.color}`}
                        >
                          {ALL_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_CONFIG[s].label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={12}
                          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}{' '}
                      {new Date(order.created_at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setViewOrder(order)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                          title="Detalhes"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          disabled={deletingId === order.id}
                          className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          title="Excluir"
                        >
                          {deletingId === order.id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    Nenhum pedido encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Detalhes do Pedido</h3>
              <button
                onClick={() => setViewOrder(null)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs font-medium text-gray-500">ID</span>
                  <p className="font-mono text-xs text-gray-700">{viewOrder.id}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500">Status</span>
                  <p>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CONFIG[viewOrder.status].color}`}
                    >
                      {STATUS_CONFIG[viewOrder.status].label}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500">Cliente</span>
                  <p className="text-gray-900">{viewOrder.customer_name || '—'}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500">Telefone</span>
                  <p className="text-gray-900">{viewOrder.customer_phone || '—'}</p>
                </div>
                {viewOrder.customer_address && (
                  <div className="col-span-2">
                    <span className="text-xs font-medium text-gray-500">Endereço</span>
                    <p className="text-gray-900">{viewOrder.customer_address}</p>
                  </div>
                )}
                {viewOrder.promo_code && (
                  <div>
                    <span className="text-xs font-medium text-gray-500">Código Promo</span>
                    <p className="font-mono text-amber-700">{viewOrder.promo_code}</p>
                  </div>
                )}
              </div>

              <hr />

              <div>
                <span className="mb-2 block text-xs font-medium text-gray-500">Itens</span>
                <div className="space-y-2">
                  {parseItems(viewOrder.items).map((item, idx) => (
                    <div key={idx} className="flex justify-between rounded-lg bg-gray-50 px-3 py-2">
                      <div>
                        <span className="font-medium text-gray-900">
                          {item.quantity}× {item.name}
                        </span>
                        {item.observations && (
                          <p className="text-xs text-gray-500">📝 {item.observations}</p>
                        )}
                      </div>
                      <span className="font-medium text-gray-700">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between border-t pt-3 text-base font-bold text-gray-900">
                <span>Total</span>
                <span>R$ {Number(viewOrder.total).toFixed(2)}</span>
              </div>

              <p className="text-right text-xs text-gray-400">
                {new Date(viewOrder.created_at).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
