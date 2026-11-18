# B3 Stock Market Monitor & Alert SaaS

Sistema minimalista de alta performance para monitoramento contínuo e alerta de preços de ações negociadas na B3 (Bolsa Brasileira). Arquitetura concebida para rodar com **custo zero** permanente, utilizando os planos gratuitos da Vercel, Supabase e Resend.

---

## 🛠 Stack Tecnológica

- **Frontend & SSR:** [Next.js 14+](https://nextjs.org/) (App Router), TypeScript, Tailwind CSS, Lucide Icons, `next-themes`.
- **Banco de Dados & Autenticação:** [Supabase](https://supabase.com/) (PostgreSQL com Row Level Security & Supabase Auth SSR).
- **Worker & Automação:** Supabase Edge Functions (Deno / TypeScript) acionada via `pg_cron` e `pg_net`.
- **Cotações Financeiras:** [Brapi API](https://brapi.dev/) com requisições em batching.
- **Disparo de E-mails Transacionais:** [Resend API](https://resend.com/).

---

## 📁 Estrutura do Projeto

```text
├── src/
│   ├── app/
│   │   ├── actions.ts              # Server Actions (CRUD de alertas e logout)
│   │   ├── auth/callback/route.ts  # Rota para troca de código OAuth (Google)
│   │   ├── globals.css             # Estilos globais e tokens Tailwind
│   │   ├── layout.tsx              # Root Layout com ThemeProvider
│   │   ├── login/page.tsx          # Página de login com Google OAuth e E-mail
│   │   └── page.tsx                # Dashboard principal protegido
│   ├── components/
│   │   ├── header.tsx              # Header minimalista com Logo, Theme Toggle e Sair
│   │   ├── stock-alert-form.tsx    # Formulário de cadastro de novo alerta
│   │   ├── stock-table.tsx         # Tabela minimalista com switch e exclusão
│   │   ├── theme-provider.tsx      # Provider de temas (next-themes)
│   │   └── theme-toggle.tsx        # Botão de alternância Dark/Light mode
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts           # Cliente Supabase Browser (@supabase/ssr)
│   │       ├── server.ts           # Cliente Supabase Server Component / Actions
│   │       └── middleware.ts       # Validador e renovador de sessão no middleware
│   ├── middleware.ts               # Proteção de rotas do Next.js
│   └── types/
│       └── database.ts             # Definições de tipos TypeScript do Supabase
├── supabase/
│   ├── functions/
│   │   └── check-stock-prices/
│   │       └── index.ts            # Edge Function do Worker (Deno)
│   └── schema.sql                  # Script SQL (Tabela, RLS, pg_cron e pg_net)
├── .env.example
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## ⚡ Passo a Passo de Configuração

### 1. Supabase (Banco de Dados & Auth)
1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. Vá em **SQL Editor** e execute o script contido em `supabase/schema.sql`.
3. Em **Project Settings -> API**, copie:
   - `Project URL`
   - `anon public key`
   - `service_role key` (mantenha secreta)
4. Vá em **Authentication -> URL Configuration**:
   - Adicione `http://localhost:3000/auth/callback` e o domínio da sua Vercel nas **Redirect URLs**.

### 2. Google OAuth no Supabase
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um projeto e configure a tela de consentimento OAuth.
3. Crie credenciais de **ID do cliente OAuth** (Tipo: *Aplicativo da Web*).
4. No campo **URIs de redirecionamento autorizados**, insira a URL de callback do Supabase:
   `https://<YOUR-PROJECT-ID>.supabase.co/auth/v1/callback`
5. No Supabase, vá em **Authentication -> Providers -> Google**, ative o provedor e cole o `Client ID` e `Client Secret`.

### 3. Brapi & Resend
1. **Brapi:** Crie sua conta em [brapi.dev](https://brapi.dev) e gere seu token gratuito.
2. **Resend:** Crie sua conta em [resend.com](https://resend.com), adicione e valide seu domínio de envio (ou use o remetente de teste `onboarding@resend.dev` para e-mails destinados à sua própria conta de cadastro). Gere uma chave de API em **API Keys**.

### 4. Deploy da Supabase Edge Function
Instale a Supabase CLI se ainda não possuir e faça o deploy:
```bash
supabase login
supabase link --project-ref <YOUR-PROJECT-ID>
supabase secrets set BRAPI_TOKEN="seu_token" RESEND_API_KEY="sua_chave" RESEND_FROM_EMAIL="B3 Alert <alerta@seu-dominio.com>" CRON_SECRET="sua_chave_secreta"
supabase functions deploy check-stock-prices --no-verify-jwt
```

---

## 🚀 Execução Local

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Iniciar servidor de desenvolvimento
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000).

