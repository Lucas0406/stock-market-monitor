import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { StockAlertForm } from "@/components/stock-alert-form";
import { StockTable } from "@/components/stock-table";
import { ShieldCheck, Activity } from "lucide-react";
import { MonitoredStock } from "@/types/database";

export const revalidate = 0; // Garantir dados sempre frescos no carregamento

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Buscar ações monitoradas do usuário logado
  const { data: stocks, error } = await (supabase
    .from("monitored_stocks") as any)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao carregar ações monitoradas:", error);
  }

  // Buscar configurações de API key e preset de horário do usuário
  const { data: settings } = await (supabase
    .from("user_settings") as any)
    .select("resend_api_key, schedule_preset")
    .eq("user_id", user.id)
    .maybeSingle();

  const monitoredList: MonitoredStock[] = (stocks as MonitoredStock[]) || [];
  const activeCount = monitoredList.filter((s) => s.is_active).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#09090B]">
      {/* Cabeçalho */}
      <Header
        userResendApiKey={settings?.resend_api_key}
        userSchedulePreset={settings?.schedule_preset}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Banner de Status Minimalista */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-card-dark">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div>
              <p className="text-xs font-semibold text-foreground-light dark:text-foreground-dark">
                Monitoramento Contínuo
              </p>
              <p className="text-[11px] text-muted-light dark:text-muted-dark">
                Vigília automática de cotações durante o pregão oficial da Bolsa.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-muted-light dark:text-muted-dark">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                <strong className="text-foreground-light dark:text-foreground-dark">
                  {activeCount}
                </strong>{" "}
                {activeCount === 1 ? "Ativo em vigília" : "Ativos em vigília"}
              </span>
            </div>
          </div>
        </div>

        {/* Formulário de Adição */}
        <StockAlertForm />

        {/* Lista de Ações Monitoradas */}
        <section className="space-y-3">
          <StockTable stocks={monitoredList} />
        </section>
      </main>

      {/* Rodapé Minimalista e Sofisticado */}
      <footer className="border-t border-border-light dark:border-border-dark py-6 mt-12 bg-white/50 dark:bg-background-dark/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-light dark:text-muted-dark">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-zinc-500" />
            <span>B3 Stock Monitor &bull; Alertas pessoais de alta precisão</span>
          </div>
          <div className="font-mono text-[11px] hidden sm:block">
            Dados de mercado B3 &bull; Acesso estritamente privado
          </div>
        </div>
      </footer>
    </div>
  );
}
