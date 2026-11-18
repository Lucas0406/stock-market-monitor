// ==============================================================================
// SUPABASE EDGE FUNCTION: check-stock-prices (Deno Runtime)
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

interface MonitoredStock {
  id: string;
  user_id: string;
  user_email: string;
  ticker: string;
  target_min_price: number | null;
  target_max_price: number | null;
  is_active: boolean;
  last_notified_at: string | null;
}

interface UserSetting {
  user_id: string;
  resend_api_key: string | null;
  schedule_preset: "open_only" | "close_only" | "open_and_close" | "hourly";
}

interface BrapiApiResponse {
  results: Array<{
    symbol: string;
    regularMarketPrice: number;
  }>;
}

// -----------------------------------------------------------------------------
// 1. DATA, FUSO HORÁRIO E FERIADOS (B3 / BRASIL)
// -----------------------------------------------------------------------------

function getBrazilDate() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    weekday: "short",
  });
  const parts = formatter.formatToParts(now);
  const findPart = (type: string) => parts.find((p) => p.type === type)?.value || "";
  const year = parseInt(findPart("year"), 10);
  const month = parseInt(findPart("month"), 10);
  const day = parseInt(findPart("day"), 10);
  const hour = parseInt(findPart("hour"), 10);

  const daysMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const dayOfWeek = daysMap[findPart("weekday")] ?? now.getUTCDay();
  const pad = (n: number) => n.toString().padStart(2, "0");

  return { dateStr: `${year}-${pad(month)}-${pad(day)}`, year, hour, dayOfWeek };
}

function getDeterministicHolidays(year: number): Set<string> {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const fixedHolidays = [
    `${year}-01-01`, `${year}-04-21`, `${year}-05-01`, `${year}-09-07`,
    `${year}-10-12`, `${year}-02-11`, `${year}-15-11`, `${year}-11-20`, `${year}-12-25`,
  ];
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const easterMonth = Math.floor((h + l - 7 * m + 114) / 31);
  const easterDay = ((h + l - 7 * m + 114) % 31) + 1;
  const easter = new Date(Date.UTC(year, easterMonth - 1, easterDay));
  const addDays = (base: Date, days: number) => {
    const dt = new Date(base.getTime() + days * 86400000);
    return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
  };

  return new Set([
    ...fixedHolidays,
    addDays(easter, -48),
    addDays(easter, -47),
    addDays(easter, -2),
    addDays(easter, 60),
  ]);
}

async function isNationalHoliday(year: number, dateStr: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const holidays = await res.json();
      if (holidays.some((h: { date: string }) => h.date === dateStr)) return true;
    }
  } catch {
    // Fallback determinístico
  }
  return getDeterministicHolidays(year).has(dateStr);
}

function generateEmailHtml({ ticker, currentPrice, minPrice, maxPrice, timestamp }: any) {
  let title = "Dentro da Faixa de Monitoramento";
  const badgeColor = "#16A34A";
  const badgeBg = "#F0FDF4";
  let targetDesc = "";

  if (minPrice !== null && maxPrice !== null) {
    title = "Dentro da Faixa Alvo";
    targetDesc = `Faixa monitorada: R$ ${Number(minPrice).toFixed(2)} a R$ ${Number(maxPrice).toFixed(2)}`;
  } else if (minPrice !== null) {
    title = "Acima do Piso Mínimo";
    targetDesc = `Piso mínimo monitorado: R$ ${Number(minPrice).toFixed(2)}`;
  } else if (maxPrice !== null) {
    title = "Abaixo do Teto Máximo";
    targetDesc = `Teto máximo monitorado: R$ ${Number(maxPrice).toFixed(2)}`;
  }

  return `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:32px 16px;background-color:#FAFAFA;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#111827;">
    <table align="center" width="100%" style="max-width:500px;background:#FFF;border:1px solid #E5E7EB;border-radius:12px;padding:28px;">
      <tr>
        <td>
          <span style="font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;">Monitor B3</span>
          <h2 style="margin:4px 0 16px;font-size:22px;">${ticker}</h2>
          <span style="display:inline-block;padding:4px 10px;font-size:12px;font-weight:600;color:${badgeColor};background:${badgeBg};border-radius:99px;">
            ${title}
          </span>
          <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:16px;margin:20px 0;">
            <div style="font-size:12px;color:#6B7280;">Cotação Atual: <strong style="font-size:18px;color:#111827;">R$ ${currentPrice.toFixed(2)}</strong></div>
            <div style="font-size:12px;color:#6B7280;margin-top:6px;">${targetDesc}</div>
          </div>
          <div style="font-size:11px;color:#9CA3AF;">Disparado em: ${timestamp} (Horário de Brasília). Alertas pausados por 6h.</div>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
}

serve(async (req: Request) => {
  try {
    const expectedSecret = Deno.env.get("CRON_SECRET");
    const authHeader = req.headers.get("Authorization");

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized access: invalid cron secret" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { dateStr, year, hour, dayOfWeek } = getBrazilDate();
    if (dayOfWeek === 0 || dayOfWeek === 6 || (await isNationalHoliday(year, dateStr))) {
      return new Response(JSON.stringify({ status: "skipped", message: "B3 closed (weekend or holiday)" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    let isManualTrigger = false;
    try {
      const body = await req.json();
      if (body?.trigger === "manual") isManualTrigger = true;
    } catch {
      // Sem body json
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: stocks, error: dbError } = await supabase
      .from("monitored_stocks")
      .select("*")
      .eq("is_active", true);

    if (dbError) throw new Error(`Database error: ${dbError.message}`);
    if (!stocks || stocks.length === 0) {
      return new Response(JSON.stringify({ message: "No active stocks" }), { status: 200 });
    }

    // Configurações de API keys e Presets de Horários
    const userIds = Array.from(new Set(stocks.map((s: MonitoredStock) => s.user_id)));
    const { data: userSettings } = await supabase
      .from("user_settings")
      .select("user_id, resend_api_key, schedule_preset")
      .in("user_id", userIds);

    const settingsMap = new Map<string, UserSetting>();
    if (userSettings) {
      userSettings.forEach((u: UserSetting) => settingsMap.set(u.user_id, u));
    }

    const isMarketOpenHour = hour === 10;
    const isMarketCloseHour = hour >= 17;

    const filteredStocks = stocks.filter((stock: MonitoredStock) => {
      if (isManualTrigger) return true;

      const userConfig = settingsMap.get(stock.user_id);
      const preset = userConfig?.schedule_preset || "open_and_close";

      if (preset === "open_only") return isMarketOpenHour;
      if (preset === "close_only") return isMarketCloseHour;
      if (preset === "open_and_close") return isMarketOpenHour || isMarketCloseHour;
      if (preset === "hourly") return true;

      return true;
    });

    if (filteredStocks.length === 0) {
      return new Response(JSON.stringify({ message: "No stocks eligible for current hour preset" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const uniqueTickers = Array.from(new Set(filteredStocks.map((s: MonitoredStock) => s.ticker.toUpperCase())));
    const brapiToken = Deno.env.get("BRAPI_TOKEN") || "";
    const quotesMap = new Map<string, number>();

    // Batching de tickers (lotes de 20)
    for (let i = 0; i < uniqueTickers.length; i += 20) {
      const chunk = uniqueTickers.slice(i, i + 20).join(",");
      const res = await fetch(`https://brapi.dev/api/quote/${chunk}${brapiToken ? `?token=${brapiToken}` : ""}`);
      if (res.ok) {
        const json: BrapiApiResponse = await res.json();
        json.results?.forEach((item) => quotesMap.set(item.symbol.toUpperCase(), item.regularMarketPrice));
      }
    }

    const defaultResendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendFrom = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
    const now = new Date();
    const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
    let emailsSent = 0;

    for (const stock of filteredStocks as MonitoredStock[]) {
      const currentPrice = quotesMap.get(stock.ticker.toUpperCase());
      if (currentPrice === undefined) continue;

      if (stock.last_notified_at && now.getTime() - new Date(stock.last_notified_at).getTime() < SIX_HOURS_MS) {
        continue;
      }

      let shouldAlert = false;

      // Lógica de monitoramento dentro da faixa de preço
      if (stock.target_min_price !== null && stock.target_max_price !== null) {
        shouldAlert = currentPrice >= stock.target_min_price && currentPrice <= stock.target_max_price;
      } else if (stock.target_min_price !== null) {
        shouldAlert = currentPrice >= stock.target_min_price;
      } else if (stock.target_max_price !== null) {
        shouldAlert = currentPrice <= stock.target_max_price;
      }

      const userConfig = settingsMap.get(stock.user_id);
      const activeApiKey = userConfig?.resend_api_key || defaultResendApiKey;

      if (shouldAlert && activeApiKey) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${activeApiKey}` },
          body: JSON.stringify({
            from: resendFrom,
            to: [stock.user_email],
            subject: `[Alerta B3] ${stock.ticker} atingiu R$ ${currentPrice.toFixed(2)} (dentro da faixa)`,
            html: generateEmailHtml({
              ticker: stock.ticker,
              currentPrice,
              minPrice: stock.target_min_price,
              maxPrice: stock.target_max_price,
              timestamp: now.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" }),
            }),
          }),
        });

        if (res.ok) {
          emailsSent++;
          await supabase.from("monitored_stocks").update({ last_notified_at: now.toISOString() }).eq("id", stock.id);
        }
      }
    }

    return new Response(JSON.stringify({ status: "success", hourBRT: hour, emailsSent }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
