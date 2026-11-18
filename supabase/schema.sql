-- ==============================================================================
-- 1. TABELA DE MONITORAMENTO DE AÇÕES (monitored_stocks)
-- ==============================================================================

create table if not exists public.monitored_stocks (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    user_email text not null,
    ticker text not null,
    company_name text null,
    target_min_price numeric(12, 2) null,
    target_max_price numeric(12, 2) null,
    is_active boolean not null default true,
    last_notified_at timestamptz null,
    created_at timestamptz not null default now(),

    -- Garante que pelo menos um dos alvos esteja preenchido
    constraint check_at_least_one_target check (
        target_min_price is not null or target_max_price is not null
    ),
    -- Garante que se informados, os preços sejam estritamente positivos
    constraint check_positive_prices check (
        (target_min_price is null or target_min_price > 0) and
        (target_max_price is null or target_max_price > 0)
    ),
    -- Garante coerência se ambos forem definidos
    constraint check_min_lower_than_max check (
        (target_min_price is null or target_max_price is null) or
        (target_min_price < target_max_price)
    )
);

-- Índices para otimizar busca e agrupamento na Edge Function
create index if not exists idx_monitored_stocks_user_id on public.monitored_stocks(user_id);
create index if not exists idx_monitored_stocks_active_ticker on public.monitored_stocks(ticker) where is_active = true;

-- ==============================================================================
-- 2. TABELA DE CONFIGURAÇÕES DO USUÁRIO (user_settings)
-- Inclui presets de horários e suporte a chaves individuais da Resend
-- ==============================================================================

create table if not exists public.user_settings (
    user_id uuid primary key references auth.users(id) on delete cascade,
    resend_api_key text null,
    -- Presets de Horário:
    -- 'open_only': Apenas na Abertura (~10h)
    -- 'close_only': Apenas no Fechamento (~18h)
    -- 'open_and_close': Ambos (Abertura e Fechamento)
    -- 'hourly': De hora em hora durante o pregão (10h às 18h)
    schedule_preset text not null default 'open_and_close',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint check_valid_preset check (
        schedule_preset in ('open_only', 'close_only', 'open_and_close', 'hourly')
    )
);

-- ==============================================================================
-- 3. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ==============================================================================

alter table public.monitored_stocks enable row level security;
alter table public.user_settings enable row level security;

-- Políticas para monitored_stocks
create policy "Users can view own monitored stocks"
    on public.monitored_stocks for select
    using (auth.uid() = user_id);

create policy "Users can insert own monitored stocks"
    on public.monitored_stocks for insert
    with check (auth.uid() = user_id);

create policy "Users can update own monitored stocks"
    on public.monitored_stocks for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete own monitored stocks"
    on public.monitored_stocks for delete
    using (auth.uid() = user_id);

-- Políticas para user_settings
create policy "Users can view own settings"
    on public.user_settings for select
    using (auth.uid() = user_id);

create policy "Users can insert/update own settings"
    on public.user_settings for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- ==============================================================================
-- 4. AGENDAMENTO AUTOMÁTICO COM pg_cron E pg_net
-- ==============================================================================
create extension if not exists pg_cron;
create extension if not exists pg_net;

grant usage on schema cron to postgres;

-- Disparo contínuo durante o pregão B3 (10:05 até 18:05 BRT = 13:05 até 21:05 UTC)
select cron.schedule(
    'check-stocks-trading-hours',
    '5 13-21 * * 1-5',
    $$
    select net.http_post(
        url := 'https://fcbepognbrbccwpyvhbf.supabase.co/functions/v1/check-stock-prices',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer 2oe@r8*fh29(n1oir'
        ),
        body := jsonb_build_object(
            'trigger', 'hourly_check',
            'timestamp', now()
        )
    );
    $$
);
