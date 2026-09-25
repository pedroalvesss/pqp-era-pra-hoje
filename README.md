# pqp, era pra hoje?

O caderninho de demandas que não esquece. Anota rápido, mostra o que vence hoje e avisa antes do prazo. Funciona no PC e no celular (PWA com push).

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui (Radix) · Zod · Supabase (Auth + Postgres) · Web Push · Vitest + Testing Library · Vercel

## Como funciona

- **Zero trust no client.** O browser nunca fala com o Supabase. A sessão fica em cookie `httpOnly`. Leituras rodam em Server Components (`services/`, todos `server-only`) e só DTOs chegam ao client. Mutações são Server Actions (`actions/`) validadas com Zod.
- **RLS em tudo.** Cada tabela só deixa o dono ler e escrever.
- **Fuso horário.** "Hoje" é calculado no fuso do usuário (pego do aparelho no cadastro), não no fuso UTC do servidor.
- **Push.** O `pg_cron` do Supabase chama `/api/cron/push` a cada 5 min. A rota procura demandas dentro da antecedência configurada, grava o aviso e manda Web Push para cada aparelho inscrito.
- **Detalhe da demanda.** `/d/[id]` abre como drawer por cima da tela atual (rota interceptada) ou como página cheia quando acessado direto (link do push).

## Rodando local

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev
```

### Supabase

1. Crie um projeto e rode `supabase/migrations/0001_init.sql` no SQL Editor.
2. Em **Authentication → URL Configuration**, adicione `http://localhost:3000/auth/confirm` e a URL de produção + `/auth/confirm` às Redirect URLs.
3. Depois do primeiro deploy, rode `supabase/cron.sql` (troque `<APP_URL>` e `<CRON_SECRET>`).

### Chaves VAPID

```bash
npx web-push generate-vapid-keys
```

## Scripts

| comando             | o que faz                   |
| ------------------- | --------------------------- |
| `npm run dev`       | servidor de desenvolvimento |
| `npm test`          | Vitest                      |
| `npm run lint`      | ESLint                      |
| `npm run typecheck` | TypeScript                  |
| `npm run format`    | Prettier                    |

Hooks do Husky rodam lint-staged no pre-commit e commitlint (Conventional Commits) no commit-msg.

## Estrutura

```
app/
  (auth)/        entrar, criar-conta, redefinir-senha
  (app)/         shell com sidebar/tab bar
    (inicio)/    home com a folhinha do dia
    demandas/ quadro/ projetos/ busca/ avisos/ perfil/ d/[id]/
    @modal/      drawer da demanda (rota interceptada)
  api/cron/push/
actions/         Server Actions (mutações)
services/        acesso ao Supabase, um arquivo por função
components/      componentes usados em mais de uma rota
contexts/ hooks/ lib/
supabase/        migrations e cron
```

Cada rota tem `_components`, `__tests__`, `loading.tsx` e `error.tsx`.
