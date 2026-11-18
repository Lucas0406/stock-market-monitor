"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { LogOut, X, Loader2 } from "lucide-react";
import { signOutAction } from "@/app/actions";

export function SignOutModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Desabilita a rolagem da página enquanto o modal estiver aberto
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleConfirm = () => {
    startTransition(async () => {
      await signOutAction();
    });
  };

  const modalContent = isOpen && mounted && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 dark:bg-black/40 backdrop-blur-md animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) setIsOpen(false);
      }}
    >
      <div className="w-full max-w-sm bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95">
        <button
          type="button"
          disabled={isPending}
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark hover:bg-surface-light dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-center justify-center text-red-600 dark:text-red-400">
            <LogOut className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark">
            Encerrar sessão?
          </h3>
        </div>

        <p className="text-xs text-muted-light dark:text-muted-dark leading-relaxed mb-5">
          O monitoramento dos seus ativos continuará rodando normalmente em segundo plano. Deseja sair agora?
        </p>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => setIsOpen(false)}
            className="px-3.5 py-2 text-xs font-medium text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark rounded-xl transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleConfirm}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl transition shadow-xs disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saindo...</span>
              </>
            ) : (
              <span>Sim, sair</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-foreground-light dark:text-foreground-dark hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-900/60 hover:bg-red-50/50 dark:hover:bg-red-950/30 transition-colors text-xs font-medium"
        title="Encerrar sessão"
        aria-label="Encerrar sessão"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Sair</span>
      </button>

      {modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
