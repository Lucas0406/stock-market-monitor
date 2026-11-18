"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Settings, X, Loader2, KeyRound, Check, HelpCircle, Clock, Eye, EyeOff, Send, AlertCircle } from "lucide-react";
import { saveUserSettings, sendTestEmail, ActionResponse } from "@/app/actions";

interface SettingsModalProps {
  initialApiKey?: string | null;
  initialSchedulePreset?: string | null;
}

export function SettingsModal({ initialApiKey, initialSchedulePreset }: SettingsModalProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [apiKey, setApiKey] = React.useState(initialApiKey || "");
  const [schedulePreset, setSchedulePreset] = React.useState(
    initialSchedulePreset || "open_and_close"
  );
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [state, setState] = React.useState<ActionResponse | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [isTestingEmail, setIsTestingEmail] = React.useState(false);
  const [testEmailResult, setTestEmailResult] = React.useState<ActionResponse | null>(null);

  const handleSendTest = async () => {
    setIsTestingEmail(true);
    setTestEmailResult(null);
    try {
      const res = await sendTestEmail(apiKey);
      setTestEmailResult(res);
      if (res?.success) {
        setTimeout(() => {
          setTestEmailResult(null);
        }, 5000);
      }
    } finally {
      setIsTestingEmail(false);
    }
  };

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveUserSettings(apiKey, schedulePreset);
      setState(res);
      if (res.success) {
        setTimeout(() => {
          setState(null);
          setIsOpen(false);
        }, 1200);
      }
    });
  };

  const modalContent = isOpen && mounted && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/25 dark:bg-black/40 backdrop-blur-md animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div className="w-full max-w-lg max-h-[88vh] flex flex-col bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl shadow-2xl relative animate-in zoom-in-95 overflow-hidden my-auto">
        {/* Cabeçalho Fixo no Topo do Modal */}
        <div className="flex items-center justify-between p-5 border-b border-border-light dark:border-border-dark shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex items-center justify-center">
              <Settings className="w-4 h-4 text-muted-light dark:text-muted-dark" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark">
                Preferências do Monitor
              </h3>
              <p className="text-[11px] text-muted-light dark:text-muted-dark">
                Frequência de alertas e credenciais de e-mail.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark hover:bg-surface-light dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo com rolagem suave contida abaixo do cabeçalho */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-5">
          {state?.error && (
            <div className="p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="flex items-center gap-2 p-3 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl">
              <Check className="w-4 h-4 shrink-0" />
              <span>{state.message}</span>
            </div>
          )}

          {/* Seção 1: Presets com borda uniforme suave e cor de hover padrão */}
          <div className="space-y-2.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground-light dark:text-foreground-dark">
              <Clock className="w-3.5 h-3.5 text-muted-light dark:text-muted-dark" />
              <span>Frequência de Checagem no Pregão</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Opção 1: Apenas Abertura */}
              <label
                className={`flex flex-col p-3 rounded-xl border border-border-light dark:border-border-dark text-xs cursor-pointer transition ${
                  schedulePreset === "open_only"
                    ? "bg-surface-light dark:bg-surface-dark"
                    : "bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-foreground-light dark:text-foreground-dark">
                    Apenas Abertura
                  </span>
                  <input
                    type="radio"
                    name="schedule"
                    value="open_only"
                    checked={schedulePreset === "open_only"}
                    onChange={() => setSchedulePreset("open_only")}
                    className="accent-zinc-900 dark:accent-zinc-100"
                  />
                </div>
                <span className="text-[10px] font-normal text-muted-light dark:text-muted-dark leading-tight">
                  Preços consolidados logo após o início do pregão.
                </span>
              </label>

              {/* Opção 2: Apenas Fechamento */}
              <label
                className={`flex flex-col p-3 rounded-xl border border-border-light dark:border-border-dark text-xs cursor-pointer transition ${
                  schedulePreset === "close_only"
                    ? "bg-surface-light dark:bg-surface-dark"
                    : "bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-foreground-light dark:text-foreground-dark">
                    Apenas Fechamento
                  </span>
                  <input
                    type="radio"
                    name="schedule"
                    value="close_only"
                    checked={schedulePreset === "close_only"}
                    onChange={() => setSchedulePreset("close_only")}
                    className="accent-zinc-900 dark:accent-zinc-100"
                  />
                </div>
                <span className="text-[10px] font-normal text-muted-light dark:text-muted-dark leading-tight">
                  Preço oficial consolidado ao fim do pregão.
                </span>
              </label>

              {/* Opção 3: Hora em Hora */}
              <label
                className={`flex flex-col p-3 rounded-xl border border-border-light dark:border-border-dark text-xs cursor-pointer transition ${
                  schedulePreset === "hourly"
                    ? "bg-surface-light dark:bg-surface-dark"
                    : "bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-foreground-light dark:text-foreground-dark">
                    Hora em Hora
                  </span>
                  <input
                    type="radio"
                    name="schedule"
                    value="hourly"
                    checked={schedulePreset === "hourly"}
                    onChange={() => setSchedulePreset("hourly")}
                    className="accent-zinc-900 dark:accent-zinc-100"
                  />
                </div>
                <span className="text-[10px] font-normal text-muted-light dark:text-muted-dark leading-tight">
                  Acompanhamento a cada 60 min das 10h às 18h.
                </span>
              </label>

              {/* Opção 4: Ambos */}
              <label
                className={`flex flex-col p-3 rounded-xl border border-border-light dark:border-border-dark text-xs cursor-pointer transition ${
                  schedulePreset === "open_and_close"
                    ? "bg-surface-light dark:bg-surface-dark"
                    : "bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-foreground-light dark:text-foreground-dark">
                    Ambos
                  </span>
                  <input
                    type="radio"
                    name="schedule"
                    value="open_and_close"
                    checked={schedulePreset === "open_and_close"}
                    onChange={() => setSchedulePreset("open_and_close")}
                    className="accent-zinc-900 dark:accent-zinc-100"
                  />
                </div>
                <span className="text-[10px] font-normal text-muted-light dark:text-muted-dark leading-tight">
                  Notificações na Abertura e no Fechamento.
                </span>
              </label>
            </div>
          </div>

          {/* Seção 2: Chave Pessoal Resend */}
          <div className="space-y-2 pt-2 border-t border-border-light dark:border-border-dark">
            <label
              htmlFor="resend_api_key"
              className="flex items-center gap-1.5 text-xs font-semibold text-foreground-light dark:text-foreground-dark"
            >
              <KeyRound className="w-3.5 h-3.5 text-muted-light dark:text-muted-dark" />
              <span>Chave Pessoal Resend</span>
              <span className="text-[11px] font-normal text-muted-light dark:text-muted-dark">
                &bull; Opcional
              </span>
            </label>

            <div className="relative">
              <input
                id="resend_api_key"
                type={showApiKey ? "text" : "password"}
                placeholder="re_123456789..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full pl-3 pr-9 py-2 text-xs font-mono bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-foreground-light dark:text-foreground-dark placeholder:text-muted-light dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark rounded transition"
                tabIndex={-1}
              >
                {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-start gap-2 p-3 bg-surface-light/70 dark:bg-surface-dark/70 border border-border-light dark:border-border-dark rounded-xl text-[11px] text-muted-light dark:text-muted-dark leading-relaxed break-words">
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-muted-light dark:text-muted-dark" />
              <div>
                No plano gratuito do Resend sem domínio próprio, os e-mails são enviados a partir de{" "}
                <code className="font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-200/50 dark:bg-zinc-800/50 px-1 py-0.5 rounded">
                  onboarding@resend.dev
                </code>{" "}
                para a <strong>conta dona da chave</strong>. Cadastre sua própria chave gratuita do{" "}
                <strong className="text-foreground-light dark:text-foreground-dark">resend.com</strong> para receber alertas no seu e-mail pessoal.
              </div>
            </div>

            {/* Disparo de Teste de E-mail */}
            <div className="pt-0.5">
              <button
                type="button"
                disabled={isTestingEmail}
                onClick={handleSendTest}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark hover:border-zinc-400 dark:hover:border-zinc-600 rounded-lg text-foreground-light dark:text-foreground-dark transition disabled:opacity-50"
              >
                {isTestingEmail ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Disparando teste...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-muted-light dark:text-muted-dark" />
                    <span>Enviar E-mail de Teste</span>
                  </>
                )}
              </button>

              {testEmailResult?.error && (
                <div className="mt-2 flex items-start gap-1.5 p-2.5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{testEmailResult.error}</span>
                </div>
              )}

              {testEmailResult?.success && (
                <div className="mt-2 flex items-start gap-1.5 p-2.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg animate-in fade-in transition-all duration-300">
                  <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{testEmailResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Botões do Rodapé */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-light dark:border-border-dark">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-2 text-xs text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 rounded-xl transition disabled:opacity-50 shadow-xs"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Salvar Preferências</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-foreground-light dark:text-foreground-dark hover:bg-surface-light dark:hover:bg-zinc-800 transition-colors"
        title="Configurações e Horários"
        aria-label="Configurações e Horários"
      >
        <Settings className="w-4 h-4 text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark transition-colors" />
      </button>

      {modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
