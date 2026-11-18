"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { B3_STOCKS } from "@/lib/b3-stocks";

export interface ActionResponse {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function createStockAlert(
  _prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const rawTicker = (formData.get("ticker") as string)?.trim().toUpperCase();
  let rawCompanyName = (formData.get("company_name") as string)?.trim() || null;
  const rawMinPrice = formData.get("target_min_price") as string;
  const rawMaxPrice = formData.get("target_max_price") as string;

  if (!rawTicker) {
    return { error: "Informe o código do ticker da ação (ex: PETR4)." };
  }

  const tickerRegex = /^[A-Z]{4}[0-9]{1,2}[B]?$/;
  if (!tickerRegex.test(rawTicker)) {
    return {
      error: "Ticker inválido. Exemplos válidos: PETR4, VALE3, ITUB4, BOVA11.",
    };
  }

  // Preenche o nome oficial automaticamente se existir no catálogo e não tiver sido enviado
  if (!rawCompanyName) {
    const found = B3_STOCKS.find((s) => s.ticker === rawTicker);
    if (found) rawCompanyName = found.name;
  }

  const minPrice = rawMinPrice ? parseFloat(rawMinPrice.replace(",", ".")) : null;
  const maxPrice = rawMaxPrice ? parseFloat(rawMaxPrice.replace(",", ".")) : null;

  if (minPrice === null && maxPrice === null) {
    return { error: "Preencha ao menos um preço alvo (mínimo ou máximo)." };
  }

  if (minPrice !== null && (isNaN(minPrice) || minPrice <= 0)) {
    return { error: "Preço mínimo deve ser um número positivo válido." };
  }

  if (maxPrice !== null && (isNaN(maxPrice) || maxPrice <= 0)) {
    return { error: "Preço máximo deve ser um número positivo válido." };
  }

  if (minPrice !== null && maxPrice !== null && minPrice >= maxPrice) {
    return { error: "O preço mínimo deve ser estritamente menor que o preço máximo." };
  }

  const { error } = await (supabase.from("monitored_stocks") as any).insert({
    user_id: user.id,
    user_email: user.email,
    ticker: rawTicker,
    company_name: rawCompanyName,
    target_min_price: minPrice,
    target_max_price: maxPrice,
    is_active: true,
  });

  if (error) {
    console.error("Supabase insert error:", error);
    return { error: "Erro ao cadastrar alerta. Tente novamente." };
  }

  revalidatePath("/");
  return { success: true };
}

export async function toggleStockAlert(id: string, currentState: boolean) {
  const supabase = createClient();
  const { error } = await (supabase.from("monitored_stocks") as any)
    .update({ is_active: !currentState })
    .eq("id", id);

  if (error) {
    console.error("Toggle error:", error);
    throw new Error("Falha ao atualizar o status do alerta.");
  }

  revalidatePath("/");
}

export async function deleteStockAlert(id: string) {
  const supabase = createClient();
  const { error } = await (supabase.from("monitored_stocks") as any)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete error:", error);
    throw new Error("Falha ao excluir o alerta.");
  }

  revalidatePath("/");
}

export async function updateStockAlert(
  id: string,
  rawMinPrice: string,
  rawMaxPrice: string
): Promise<ActionResponse> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const minPrice = rawMinPrice ? parseFloat(rawMinPrice.replace(",", ".")) : null;
  const maxPrice = rawMaxPrice ? parseFloat(rawMaxPrice.replace(",", ".")) : null;

  if (minPrice === null && maxPrice === null) {
    return { error: "Preencha ao menos um preço alvo (mínimo ou máximo)." };
  }

  if (minPrice !== null && (isNaN(minPrice) || minPrice <= 0)) {
    return { error: "Preço mínimo deve ser um número positivo válido." };
  }

  if (maxPrice !== null && (isNaN(maxPrice) || maxPrice <= 0)) {
    return { error: "Preço máximo deve ser um número positivo válido." };
  }

  if (minPrice !== null && maxPrice !== null && minPrice >= maxPrice) {
    return { error: "O preço mínimo deve ser menor que o preço máximo." };
  }

  const { error } = await (supabase.from("monitored_stocks") as any)
    .update({
      target_min_price: minPrice,
      target_max_price: maxPrice,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Update error:", error);
    return { error: "Erro ao atualizar alerta. Tente novamente." };
  }

  revalidatePath("/");
  return { success: true, message: "Alerta atualizado com sucesso!" };
}

// Salvar configurações do usuário (chave pessoal do Resend e preset de horário)
export async function saveUserSettings(
  apiKey: string,
  schedulePreset: string
): Promise<ActionResponse> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const cleanKey = apiKey.trim();
  const validPresets = ["open_only", "close_only", "open_and_close", "hourly"];
  const finalPreset = validPresets.includes(schedulePreset)
    ? schedulePreset
    : "open_and_close";

  const { error } = await (supabase.from("user_settings") as any).upsert({
    user_id: user.id,
    resend_api_key: cleanKey || null,
    schedule_preset: finalPreset,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Erro ao salvar configurações:", error);
    return { error: "Não foi possível salvar as configurações." };
  }

  revalidatePath("/");
  return { success: true, message: "Preferências salvas com sucesso!" };
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  const visibleStart = local.slice(0, 2);
  const visibleEnd = local.slice(-1);
  return `${visibleStart}***${visibleEnd}@${domain}`;
}

export async function sendTestEmail(customApiKey?: string): Promise<ActionResponse> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  // Se o usuário digitou uma chave, usa ela; senão tenta a salva no banco; senão a env padrão
  let apiKey = customApiKey?.trim();
  if (!apiKey) {
    const { data: settings } = await (supabase.from("user_settings") as any)
      .select("resend_api_key")
      .eq("user_id", user.id)
      .maybeSingle();
    apiKey = settings?.resend_api_key;
  }
  if (!apiKey) {
    apiKey = process.env.RESEND_API_KEY;
  }

  if (!apiKey) {
    return {
      error: "Nenhuma chave Resend configurada. Adicione sua chave pessoal da Resend.",
    };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [user.email],
        subject: `[B3 Monitor • Teste] Alerta de Cotação Exemplo (BBAS3)`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; padding: 24px;">
            <div style="border-bottom: 1px solid #f3f4f6; padding-bottom: 16px; margin-bottom: 20px;">
              <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: #10b981; text-transform: uppercase;">
                Teste de Conexão Bem-Sucedido
              </span>
              <h1 style="font-size: 18px; font-weight: 700; color: #111827; margin: 6px 0 0 0;">
                B3 Stock Monitor • Notificação de Teste
              </h1>
            </div>

            <p style="font-size: 14px; color: #4b5563; line-height: 1.5; margin: 0 0 16px 0;">
              Olá! Este é um disparo de teste para confirmar que seu serviço de e-mail e sua chave da Resend estão funcionando perfeitamente.
            </p>

            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px;">Exemplo de Alerta Disparado</div>
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <span style="font-family: monospace; font-size: 18px; font-weight: bold; color: #111827;">BBAS3</span>
                <span style="font-family: monospace; font-size: 16px; font-weight: 600; color: #059669;">R$ 28,45</span>
              </div>
              <div style="font-size: 12px; color: #4b5563; margin-top: 6px;">
                Condição: Cotação ultrapassou a meta de teto estipulada.
              </div>
            </div>

            <div style="font-size: 11px; color: #9ca3af; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 12px;">
              Enviado para ${user.email} &bull; Monitoramento Privado B3
            </div>
          </div>
        `,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        error: data.message || "Erro retornado pela API do Resend ao enviar e-mail.",
      };
    }

    return {
      success: true,
      message: `E-mail de teste enviado com sucesso para ${maskEmail(user.email)}! Verifique sua caixa de entrada.`,
    };
  } catch (err: any) {
    return { error: `Falha na requisição de e-mail: ${err.message}` };
  }
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
