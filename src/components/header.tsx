import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SettingsModal } from "@/components/settings-modal";
import { SignOutModal } from "@/components/sign-out-modal";

interface HeaderProps {
  userResendApiKey?: string | null;
  userSchedulePreset?: string | null;
}

export function Header({ userResendApiKey, userSchedulePreset }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-light dark:border-border-dark bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo / Marca Minimalista */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-foreground-light dark:text-foreground-dark group"
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-base">B3 Monitor</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark uppercase">
              BETA
            </span>
          </div>
        </Link>

        {/* Ações: Configurações, Tema e Sair com modal */}
        <div className="flex items-center gap-2">
          {/* Modal de Configurações da Chave e Presets de Horário */}
          <SettingsModal
            initialApiKey={userResendApiKey}
            initialSchedulePreset={userSchedulePreset}
          />

          {/* Alternador de Tema */}
          <ThemeToggle />

          {/* Modal de Confirmação de Saída com Hover Vermelho */}
          <SignOutModal />
        </div>
      </div>
    </header>
  );
}
