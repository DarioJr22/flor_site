// ============================================================
// HistoricoTab — Aba de histórico, relatórios e gráficos
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Search,
  Download,
  FileText,
  Loader2,
  Filter,
  Trash2,
  BarChart3,
  Eye,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useEmpresas } from '../../../../hooks/useEmpresas';
import { useTickets, type FiltrosTickets } from '../../../../hooks/useTickets';
import { exportarHistoricoCSV, calcularDadosRelatorio, gerarRelatorioPDF } from '../../../../lib/tickets/relatorios';

const STATUS_BADGE: Record<string, string> = {
  pendente: 'bg-yellow-100 text-yellow-700',
  impresso: 'bg-blue-100 text-blue-700',
  entregue: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-600',
};

const CHART_COLORS = ['#E91E8C', '#FFD700', '#8BC34A', '#2196F3', '#FF5722', '#9C27B0', '#00BCD4', '#FF9800'];

export function HistoricoTab() {
  const { empresas, empresasMap } = useEmpresas();
  const { tickets, loading, fetchAll } = useTickets();

  // Filtros
  const [empresaFiltro, setEmpresaFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [dataInicio, setDataInicio] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [dataFim, setDataFim] = useState(() => new Date().toISOString().split('T')[0]);

  const aplicarFiltros = useCallback(() => {
    const filtros: FiltrosTickets = {};
    if (empresaFiltro) filtros.empresaId = empresaFiltro;
    if (statusFiltro) filtros.status = statusFiltro;
    if (dataInicio) filtros.dataInicio = dataInicio;
    if (dataFim) filtros.dataFim = dataFim;
    fetchAll(filtros);
  }, [empresaFiltro, statusFiltro, dataInicio, dataFim, fetchAll]);

  useEffect(() => {
    aplicarFiltros();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const limparFiltros = () => {
    setEmpresaFiltro('');
    setStatusFiltro('');
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    setDataInicio(d.toISOString().split('T')[0]);
    setDataFim(new Date().toISOString().split('T')[0]);
  };

  // Estatísticas
  const totalTickets = tickets.length;
  const valorTotal = tickets.reduce((sum, t) => sum + (t.valor ?? 0), 0);
  const ticketMedio = totalTickets > 0 ? valorTotal / totalTickets : 0;
  // Empresas distintas nos tickets do período filtrado
  const empresasNoPeriodo = new Set(tickets.map(t => t.empresa_id)).size;

  // Dados para gráficos
  const porDiaData = Object.entries(
    tickets.reduce<Record<string, number>>((acc, t) => {
      acc[t.data_refeicao] = (acc[t.data_refeicao] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([data, total]) => ({
      data: data.split('-').reverse().slice(0, 2).join('/'),
      total,
    }));

  const porEmpresaData = Object.entries(
    tickets.reduce<Record<string, number>>((acc, t) => {
      const nome = empresasMap[t.empresa_id] ?? 'Desconhecida';
      acc[nome] = (acc[nome] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([nome, total]) => ({ nome, total }));

  const porCarneData = Object.entries(
    tickets.reduce<Record<string, number>>((acc, t) => {
      const carne = t.carne.toLowerCase();
      acc[carne] = (acc[carne] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([nome, value]) => ({
      nome: nome.charAt(0).toUpperCase() + nome.slice(1),
      value,
    }));

  const formatarMoeda = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const handleExportCSV = () => {
    if (tickets.length === 0) {
      toast.error('Nenhum ticket para exportar');
      return;
    }
    exportarHistoricoCSV(tickets, empresasMap, `tickets_${dataInicio}_${dataFim}`);
    toast.success('CSV exportado!');
  };

  const handleGerarPDF = async () => {
    if (!empresaFiltro) {
      toast.error('Selecione uma empresa para gerar o relatório PDF');
      return;
    }
    const empresa = empresas.find(e => e.id === empresaFiltro);
    if (!empresa) return;

    const dados = calcularDadosRelatorio(empresa, tickets, dataInicio, dataFim);
    try {
      const pdfMake = await import('pdfmake/build/pdfmake');
      const docDef = gerarRelatorioPDF(dados);
      pdfMake.default.createPdf(docDef).open();
      toast.success('Relatório PDF gerado!');
    } catch {
      toast.error('Erro ao gerar PDF');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Filter size={14} />
          Filtros
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Empresa</label>
            <select
              value={empresaFiltro}
              onChange={e => setEmpresaFiltro(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
            >
              <option value="">Todas</option>
              {empresas.map(e => (
                <option key={e.id} value={e.id}>{e.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Período Início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={e => setDataInicio(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Período Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={e => setDataFim(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Status</label>
            <select
              value={statusFiltro}
              onChange={e => setStatusFiltro(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
            >
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="impresso">Impresso</option>
              <option value="entregue">Entregue</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={aplicarFiltros}
            className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            <Search size={14} /> Filtrar
          </button>
          <button
            onClick={limparFiltros}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <Trash2 size={14} /> Limpar
          </button>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Tickets', value: String(totalTickets), color: 'text-amber-600' },
          { label: 'Valor Total', value: formatarMoeda(valorTotal), color: 'text-green-600' },
          { label: 'Ticket Médio', value: formatarMoeda(ticketMedio), color: 'text-blue-600' },
          { label: 'Empresas', value: `${empresasNoPeriodo} no período`, color: 'text-purple-600' },
        ].map(card => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium text-gray-500">{card.label}</p>
            <p className={`mt-1 text-xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Botões de exportação */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Download size={14} /> Exportar CSV
        </button>
        <button
          onClick={handleGerarPDF}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <FileText size={14} /> Relatório PDF
        </button>
      </div>

      {/* Gráficos */}
      {tickets.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Evolução por dia */}
          {porDiaData.length > 1 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
                <BarChart3 size={14} /> Evolução de Pedidos
              </h4>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={porDiaData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="data" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#E91E8C"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Tickets"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Top empresas */}
          {porEmpresaData.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
                <BarChart3 size={14} /> Top 5 Empresas
              </h4>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={porEmpresaData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="nome" type="category" tick={{ fontSize: 10 }} width={100} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#FFD700" name="Tickets" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Distribuição por carne */}
          {porCarneData.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 lg:col-span-2">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
                <BarChart3 size={14} /> Distribuição por Tipo de Carne
              </h4>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={porCarneData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      nameKey="nome"
                      label={({ nome, percent }) => `${nome} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {porCarneData.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabela de histórico */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Eye size={32} className="mb-2" />
          <p className="text-sm">Nenhum ticket encontrado para o período</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Ticket</th>
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">Funcionário</th>
                  <th className="px-4 py-3">Carne</th>
                  <th className="px-4 py-3">Acomp.</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.slice(0, 100).map(ticket => (
                  <tr key={ticket.id} className="transition hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-2.5 text-xs text-gray-600">
                      {ticket.data_refeicao.split('-').reverse().join('/')}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-gray-500">
                      {ticket.numero_ticket ? `#${ticket.numero_ticket}` : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">
                      {empresasMap[ticket.empresa_id] ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-gray-900">
                      {ticket.nome_funcionario}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{ticket.carne}</td>
                    <td className="max-w-[200px] truncate px-4 py-2.5 text-xs text-gray-500" title={ticket.acompanhamentos}>
                      {ticket.acompanhamentos}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          STATUS_BADGE[ticket.status] ?? STATUS_BADGE.pendente
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-xs font-medium text-gray-900">
                      {ticket.valor != null ? formatarMoeda(ticket.valor) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tickets.length > 100 && (
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-center text-xs text-gray-500">
              Mostrando 100 de {tickets.length} tickets. Use os filtros para refinar.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
