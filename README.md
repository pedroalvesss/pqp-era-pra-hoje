# pqp, era pra hoje?

O caderninho de demandas que não esquece. Anota rápido, mostra o que vence hoje e avisa antes do prazo. Funciona no PC e no celular (PWA com push).

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui (Radix) · Auth.js · Drizzle ORM · Postgres (Supabase) · react-hook-form + Zod · Web Push · Vitest + Testing Library + PGlite · Vercel

## Como funciona

- **Zero trust no client.** O browser nunca fala com o banco. A sessão do Auth.js (JWT) fica em cookie `httpOnly`. Leituras rodam em Server Components (`services/`, todos `server-only`) e só DTOs chegam ao client. Mutações são Server Actions (`actions/`) validadas com Zod.
- **Dono de cada linha.** Todo service filtra pelo usuário da sessão. As tabelas têm RLS ligado sem policies, então a API pública do Supabase não enxerga nada; só o app, que conecta como dono.
- **Senha.** Login por e-mail e senha (Credentials do Auth.js), hash com `scrypt` do Node. "Esqueci a senha" manda um link de uso único (1 h) pelo Resend.
- **Formulários.** react-hook-form com o mesmo schema Zod que o servidor usa.
- **Fuso horário.** "Hoje" é calculado no fuso do usuário (pego do aparelho no cadastro), não no fuso UTC do servidor.
- **Push.** O `pg_cron` do Supabase chama `/api/cron/push` a cada 5 min. A rota procura demandas dentro da antecedência configurada, grava o aviso e manda Web Push para cada aparelho inscrito.
- **Detalhe da demanda.** `/d/[id]` abre como drawer por cima da tela atual (rota interceptada) ou como página cheia quando acessado direto (link do push).

## Rodando local

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run db:migrate
npm run dev
```

### Banco (Supabase)

1. Crie um projeto no Supabase e copie as connection strings em **Connect** (pooler transaction na `DATABASE_URL`, direta na `DATABASE_URL_DIRECT`).
2. `npm run db:migrate` aplica `db/migrations`.
3. Depois do primeiro deploy, rode `supabase/cron.sql` no SQL Editor (troque `<APP_URL>` e `<CRON_SECRET>`).

Mudou o `db/schema.ts`? `npm run db:generate` cria a migration nova.

### Chaves

```bash
npx auth secret                  # AUTH_SECRET
npx web-push generate-vapid-keys # VAPID
```

## Scripts

| comando               | o que faz                         |
| --------------------- | --------------------------------- |
| `npm run dev`         | servidor de desenvolvimento       |
| `npm test`            | Vitest (services contra PGlite)   |
| `npm run lint`        | ESLint                            |
| `npm run typecheck`   | TypeScript                        |
| `npm run format`      | Prettier                          |
| `npm run db:generate` | gera migration a partir do schema |
| `npm run db:migrate`  | aplica as migrations              |
| `npm run db:studio`   | Drizzle Studio                    |

Hooks do Husky rodam lint-staged no pre-commit e commitlint (Conventional Commits) no commit-msg.

## Estrutura

```
app/
  (auth)/        entrar, criar-conta, redefinir-senha
  (app)/         shell com sidebar/tab bar
    (inicio)/    home com a folhinha do dia
    demandas/ quadro/ projetos/ busca/ avisos/ perfil/ d/[id]/
    @modal/      drawer da demanda (rota interceptada)
  api/auth/      Auth.js
  api/cron/push/
auth.ts          Auth.js (Credentials); auth.config.ts roda no proxy
db/              schema Drizzle e migrations
actions/         Server Actions (mutações)
services/        acesso ao banco, um arquivo por função
components/      componentes usados em mais de uma rota
contexts/ hooks/ lib/
supabase/        cron (pg_cron)
```

Cada rota tem `_components`, `__tests__`, `loading.tsx` e `error.tsx`.
