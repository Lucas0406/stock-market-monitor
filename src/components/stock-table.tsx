"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  Trash2,
  BellRing,
  BellOff,
  ArrowDown,
  ArrowUp,
  Clock,
  X,
  Loader2,
  Pencil,
  ChevronUp,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { MonitoredStock } from "@/types/database";
import { toggleStockAlert, deleteStockAlert, updateStockAlert } from "@/app/actions";

interface StockTableProps {
  stocks: MonitoredStock[];
}

export function StockTable({ stocks }: StockTableProps) {
  const [pendingIds, setPendingIds] = React.useState<Record<string, boolean>>({});
  const [deletingStock, setDeletingStock] = React.useState<{ id: string; ticker: string } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Estados para edição de alerta
  const [editingStock, setEditingStock] = React.useState<MonitoredStock | null>(null);
  const [editMinPrice, setEditMinPrice] = React.useState("");
  const [editMaxPrice, setEditMaxPrice] = React.useState("");
  const [isSavingEdit, setIsSavingEdit] = React.useState(false);
  const [editError, setEditError] = React.useState<string | null>(null);

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Bloqueia a rolagem do fundo se o modal de confirmação ou edição estiver aberto
  React.useEffect(() => {
    if (deletingStock || editingStock) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [deletingStock, editingStock]);

  const handleToggle = async (id: string, currentState: boolean) => {
    setPendingIds((prev) => ({ ...prev, [id]: true }));
    try {
      await toggleStockAlert(id, currentState);
    } finally {
      setPendingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingStock) return;
    const { id } = deletingStock;
    setIsDeleting(true);
    setPendingIds((prev) => ({ ...prev, [id]: true }));
    try {
      await deleteStockAlert(id);
      setDeletingStock(null);
    } finally {
      setIsDeleting(false);
      setPendingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const openEditModal = (stock: MonitoredStock) => {
    setEditingStock(stock);
    setEditMinPrice(stock.target_min_price !== null ? String(stock.target_min_price) : "");
    setEditMaxPrice(stock.target_max_price !== null ? String(stock.target_max_price) : "");
    setEditError(null);
  };

  const adjustEditPrice = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    currentVal: string,
    delta: number
  ) => {
    const num = parseFloat(currentVal) || 0;
    const next = Math.max(0, num + delta);
    setter(next > 0 ? next.toFixed(2) : "");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStock) return;

    setIsSavingEdit(true);
    setEditError(null);
    try {
      const res = await updateStockAlert(editingStock.id, editMinPrice, editMaxPrice);
      if (res?.error) {
        setEditError(res.error);
      } else {
        setEditingStock(null);
      }
    } catch {
      setEditError("Ocorreu uma falha inesperada ao atualizar.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  if (stocks.length === 0) {
    return (
      <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex items-center justify-center mx-auto mb-3 text-muted-light dark:text-muted-dark">
          <BellRing className="w-5 h-5 opacity-60" />
        </div>
        <h3 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark">
          Nenhuma ação monitorada
        </h3>
        <p className="text-xs text-muted-light dark:text-muted-dark max-w-sm mx-auto mt-1">
          Utilize o formulário acima para cadastrar seu primeiro alerta de preço na B3.
        </p>
      </div>
    );
  }

  // Modal de Exclusão
  const deleteModalContent = deletingStock && mounted && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 dark:bg-black/40 backdrop-blur-md animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) setDeletingStock(null);
      }}
    >
      <div className="w-full max-w-sm bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95">
        <button
          type="button"
          disabled={isDeleting}
          onClick={() => setDeletingStock(null)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark hover:bg-surface-light dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-center justify-center text-red-600 dark:text-red-400">
            <Trash2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark">
            Remover alerta de {deletingStock.ticker}?
          </h3>
        </div>

        <p className="text-xs text-muted-light dark:text-muted-dark leading-relaxed mb-5">
          Você deixará de receber notificações por e-mail para as variações de preço deste ativo. Esta ação não pode ser desfeita.
        </p>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => setDeletingStock(null)}
            className="px-3.5 py-2 text-xs font-medium text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark rounded-xl transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleConfirmDelete}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl transition shadow-xs disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Removendo...</span>
              </>
            ) : (
              <span>Sim, remover</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Modal de Edição de Alerta
  const editModalContent = editingStock && mounted && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 dark:bg-black/40 backdrop-blur-md animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSavingEdit) setEditingStock(null);
      }}
    >
      <div className="w-full max-w-md bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95">
        <button
          type="button"
          disabled={isSavingEdit}
          onClick={() => setEditingStock(null)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark hover:bg-surface-light dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex items-center justify-center text-foreground-light dark:text-foreground-dark">
            <Pencil className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark">
              Editar Alerta &bull; {editingStock.ticker}
            </h3>
            {editingStock.company_name && (
              <p className="text-[11px] text-muted-light dark:text-muted-dark">
                {editingStock.company_name}
              </p>
            )}
          </div>
        </div>

        {editError && (
          <div className="mt-3 flex items-start gap-1.5 p-2.5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{editError}</span>
          </div>
        )}

        <form onSubmit={handleSaveEdit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Preço Mínimo */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit_min_price"
                className="flex items-center gap-1.5 text-xs font-medium text-foreground-light dark:text-foreground-dark"
              >
                <ArrowDown className="w-3.5 h-3.5 text-muted-light dark:text-muted-dark" />
                <span>Preço Mínimo</span>
                <span className="text-[11px] font-normal text-muted-light dark:text-muted-dark">
                  &bull; R$
                </span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="edit_min_price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="ex: 35.50"
                  value={editMinPrice}
                  onChange={(e) => setEditMinPrice(e.target.value)}
                  className="w-full pl-3 pr-7 py-2 text-sm font-mono bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-foreground-light dark:text-foreground-dark placeholder:text-muted-light dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="absolute right-1 flex flex-col">
                  <button
                    type="button"
                    onClick={() => adjustEditPrice(setEditMinPrice, editMinPrice, 0.5)}
                    className="p-0.5 text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark transition"
                    tabIndex={-1}
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustEditPrice(setEditMinPrice, editMinPrice, -0.5)}
                    className="p-0.5 text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark transition"
                    tabIndex={-1}
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Preço Máximo */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit_max_price"
                className="flex items-center gap-1.5 text-xs font-medium text-foreground-light dark:text-foreground-dark"
              >
                <ArrowUp className="w-3.5 h-3.5 text-muted-light dark:text-muted-dark" />
                <span>Preço Máximo</span>
                <span className="text-[11px] font-normal text-muted-light dark:text-muted-dark">
                  &bull; R$
                </span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="edit_max_price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="ex: 42.00"
                  value={editMaxPrice}
                  onChange={(e) => setEditMaxPrice(e.target.value)}
                  className="w-full pl-3 pr-7 py-2 text-sm font-mono bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-foreground-light dark:text-foreground-dark placeholder:text-muted-light dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="absolute right-1 flex flex-col">
                  <button
                    type="button"
                    onClick={() => adjustEditPrice(setEditMaxPrice, editMaxPrice, 0.5)}
                    className="p-0.5 text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark transition"
                    tabIndex={-1}
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustEditPrice(setEditMaxPrice, editMaxPrice, -0.5)}
                    className="p-0.5 text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark transition"
                    tabIndex={-1}
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>


          <div className="flex items-center justify-end gap-2 ">
            <button
              type="button"
              disabled={isSavingEdit}
              onClick={() => setEditingStock(null)}
              className="px-3.5 py-2 text-xs font-medium text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSavingEdit}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {isSavingEdit ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <span>Salvar Alterações</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="px-5 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark">
            {stocks.length === 1 ? "Ativo Monitorado" : "Ativos Monitorados"}{" "}
            <span className="text-muted-light dark:text-muted-dark font-normal">&bull; {stocks.length}</span>
          </h3>
          <span className="text-[11px] text-muted-light dark:text-muted-dark hidden sm:inline">
            Checagens automáticas em dias de pregão
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border-light dark:border-border-dark bg-surface-light/50 dark:bg-surface-dark/50 text-muted-light dark:text-muted-dark font-medium uppercase tracking-wider text-[10px]">
                <th className="py-3 px-5">Ativo</th>
                <th className="py-3 px-5">Faixa de Preço</th>
                <th className="py-3 px-5 hidden sm:table-cell">Status</th>
                <th className="py-3 px-5 hidden sm:table-cell">Último Alerta</th>
                <th className="py-3 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {stocks.map((stock) => {
                const isBusy = !!pendingIds[stock.id];
                const lastNotified = stock.last_notified_at
                  ? new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                      timeZone: "America/Sao_Paulo",
                    }).format(new Date(stock.last_notified_at))
                  : "Nenhum ainda";

                return (
                  <tr
                    key={stock.id}
                    className={`hover:bg-surface-light/60 dark:hover:bg-surface-dark/40 transition-colors ${
                      !stock.is_active ? "opacity-60" : ""
                    }`}
                  >
                    {/* Ticker & Nome Oficial */}
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-bold text-foreground-light dark:text-foreground-dark">
                          {stock.ticker}
                        </span>
                        {stock.company_name && (
                          <span className="text-[11px] text-muted-light dark:text-muted-dark font-medium truncate max-w-[200px] sm:max-w-[260px]">
                            {stock.company_name}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Faixa Alvo */}
                    <td className="py-3.5 px-5 font-mono">
                      <div className="flex flex-wrap items-center gap-2">
                        {stock.target_min_price !== null && (
                          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 px-2 py-0.5 rounded text-[11px]">
                            <ArrowDown className="w-3 h-3" />
                            <span>R$ {Number(stock.target_min_price).toFixed(2)}</span>
                          </span>
                        )}
                        {stock.target_max_price !== null && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 px-2 py-0.5 rounded text-[11px]">
                            <ArrowUp className="w-3 h-3" />
                            <span>R$ {Number(stock.target_max_price).toFixed(2)}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Switch Ativo / Pausado (Oculto em telas menores) */}
                    <td className="py-3.5 px-5 hidden sm:table-cell">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleToggle(stock.id, stock.is_active)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                          stock.is_active
                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                            : "bg-surface-light dark:bg-surface-dark text-muted-light dark:text-muted-dark border border-border-light dark:border-border-dark"
                        }`}
                      >
                        {stock.is_active ? (
                          <>
                            <BellRing className="w-3 h-3" />
                            <span>Ativo</span>
                          </>
                        ) : (
                          <>
                            <BellOff className="w-3 h-3" />
                            <span>Pausado</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Data Último Alerta (Oculto em telas menores) */}
                    <td className="py-3.5 px-5 text-muted-light dark:text-muted-dark hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Clock className="w-3 h-3 opacity-60" />
                        <span>{lastNotified}</span>
                      </div>
                    </td>

                    {/* Ações: Editar e Excluir */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => openEditModal(stock)}
                          className="p-1.5 text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark hover:bg-surface-light dark:hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-50"
                          title="Editar alerta"
                          aria-label="Editar alerta"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => setDeletingStock({ id: stock.id, ticker: stock.ticker })}
                          className="p-1.5 text-muted-light dark:text-muted-dark hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors disabled:opacity-50"
                          title="Excluir alerta"
                          aria-label="Excluir alerta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {mounted && deleteModalContent && createPortal(deleteModalContent, document.body)}
      {mounted && editModalContent && createPortal(editModalContent, document.body)}
    </>
  );
}
