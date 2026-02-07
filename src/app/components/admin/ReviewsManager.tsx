import { useState, type FormEvent } from 'react';
import { useReviews } from '../../../hooks/useReviews';
import type { ReviewInsert, ReviewRow } from '../../../lib/database.types';
import { BUCKETS } from '../../../lib/storage';
import { ImageUploader } from './ImageUploader';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Star,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const EMPTY_FORM: ReviewInsert = {
  name: '',
  rating: 5,
  comment: '',
  date: new Date().toISOString().split('T')[0],
  approved: false,
  avatar_path: '',
};

export function ReviewsManager() {
  const { reviews, loading, error, create, update, remove } = useReviews();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ReviewInsert>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (review: ReviewRow) => {
    setEditingId(review.id);
    setForm({
      name: review.name,
      rating: review.rating,
      comment: review.comment ?? '',
      date: review.date ?? '',
      approved: review.approved,
      avatar_path: review.avatar_path ?? '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (editingId) {
      const result = await update(editingId, form);
      if (result) { toast.success('Avaliação atualizada!'); setDialogOpen(false); }
      else toast.error('Erro ao atualizar');
    } else {
      const result = await create(form);
      if (result) { toast.success('Avaliação criada!'); setDialogOpen(false); }
      else toast.error('Erro ao criar');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta avaliação?')) return;
    setDeletingId(id);
    const ok = await remove(id);
    if (ok) toast.success('Avaliação excluída!');
    else toast.error('Erro ao excluir');
    setDeletingId(null);
  };

  const toggleApproval = async (review: ReviewRow) => {
    const result = await update(review.id, { approved: !review.approved });
    if (result) {
      toast.success(result.approved ? 'Avaliação aprovada!' : 'Avaliação reprovada!');
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((v) => (
        <Star
          key={v}
          size={14}
          className={v <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Avaliações</h2>
          <p className="text-sm text-gray-500">
            {reviews.length} avaliações &middot;{' '}
            {reviews.filter((r) => r.approved).length} aprovadas
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
        >
          <Plus size={16} /> Nova Avaliação
        </button>
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
                <th className="px-4 py-3">Autor</th>
                <th className="px-4 py-3">Nota</th>
                <th className="px-4 py-3">Comentário</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <tr key={review.id} className="transition hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{review.name}</td>
                  <td className="px-4 py-3">{renderStars(review.rating)}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-gray-600">
                    {review.comment || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{review.date || '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleApproval(review)}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition ${
                        review.approved
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      {review.approved ? (
                        <>
                          <CheckCircle2 size={12} /> Aprovada
                        </>
                      ) : (
                        <>
                          <XCircle size={12} /> Pendente
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(review)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-amber-50 hover:text-amber-600"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={deletingId === review.id}
                        className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        title="Excluir"
                      >
                        {deletingId === review.id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {reviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    Nenhuma avaliação
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? 'Editar Avaliação' : 'Nova Avaliação'}
              </h3>
              <button
                onClick={() => setDialogOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nome *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Nota *</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setForm({ ...form, rating: v })}
                      className="transition hover:scale-110"
                    >
                      <Star
                        size={24}
                        className={
                          v <= form.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Comentário</label>
                <textarea
                  rows={3}
                  value={form.comment ?? ''}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Data</label>
                  <input
                    type="date"
                    value={form.date ?? ''}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Avatar</label>
                  <ImageUploader
                    bucket={BUCKETS.REVIEWS}
                    currentImage={form.avatar_path || null}
                    onUploadComplete={(path) => setForm({ ...form, avatar_path: path })}
                    onRemove={() => setForm({ ...form, avatar_path: '' })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="review-approved"
                  checked={form.approved}
                  onChange={(e) => setForm({ ...form, approved: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="review-approved" className="text-sm text-gray-700">
                  Aprovar avaliação
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {editingId ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
