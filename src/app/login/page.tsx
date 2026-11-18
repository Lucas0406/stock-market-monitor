"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, TrendingUp, AlertCircle, Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = React.useState<"signin" | "signup">("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Login Social com Google OAuth
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setErrorMsg((err as Error).message || "Erro ao conectar com Google");
      setLoading(false);
    }
  };

  // Login ou Cadastro Tradicional
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.session) {
          router.push("/");
          router.refresh();
        } else {
          setSuccessMsg("Verifique seu e-mail para confirmar o cadastro.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setErrorMsg((err as Error).message || "Falha na autenticação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 relative bg-[#FAFAFA] dark:bg-[#09090B]">
      {/* Botão de Tema no Topo Direito */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        {/* Identidade Visual */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 mx-auto mb-3 shadow-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground-light dark:text-foreground-dark">
            B3 Stock Monitor
          </h1>
          <p className="text-xs text-muted-light dark:text-muted-dark mt-1">
            Alertas de cotação em tempo real e custo zero.
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl p-6 shadow-sm">
          {/* Alertas de Erro / Sucesso */}
          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg">
              {successMsg}
            </div>
          )}

          {/* Botão Google OAuth com fundo contrastante no modo claro */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 text-xs font-medium text-foreground-light dark:text-foreground-dark bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200 dark:bg-surface-dark dark:hover:bg-zinc-800 dark:border-border-dark rounded-xl transition shadow-xs disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar com Google</span>
          </button>

          {/* Divisor */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-light dark:border-border-dark" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-card-light dark:bg-card-dark px-2 text-muted-light dark:text-muted-dark font-mono">
                ou com e-mail
              </span>
            </div>
          </div>

          {/* Formulário Tradicional */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-foreground-light dark:text-foreground-dark mb-1"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                className="w-full px-3 py-2 text-xs bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-foreground-light dark:text-foreground-dark placeholder:text-muted-light dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-foreground-light dark:text-foreground-dark mb-1"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-9 py-2 text-xs bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-foreground-light dark:text-foreground-dark placeholder:text-muted-light dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark p-1 rounded transition-colors"
                  aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                  title={showPassword ? "Ocultar senha" : "Ver senha"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 rounded-xl transition shadow-xs disabled:opacity-50 mt-1"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : mode === "signin" ? (
                "Entrar"
              ) : (
                "Criar Conta"
              )}
            </button>
          </form>

          {/* Alternar modo Login / Cadastro */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-xs text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark transition underline-offset-4 hover:underline"
            >
              {mode === "signin"
                ? "Não tem uma conta? Crie uma agora"
                : "Já possui uma conta? Entrar"}
            </button>
          </div>
        </div>

        {/* Rodapé Seguro e Discreto */}
        <div className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-light dark:text-muted-dark mt-6">
          <Lock className="w-3 h-3 opacity-60 shrink-0" />
          <span>Seus ativos e alertas são estritamente privados e confidenciais.</span>
        </div>
      </div>
    </div>
  );
}
