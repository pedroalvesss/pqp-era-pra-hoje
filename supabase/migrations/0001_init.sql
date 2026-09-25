-- pqp, era pra hoje? — schema inicial

create type demand_status as enum ('todo', 'doing', 'waiting', 'done');
create type demand_prio as enum ('baixa', 'media', 'alta', 'urgente');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default '',
  push_enabled boolean not null default true,
  lead text not null default '1h' check (lead in ('15m', '1h', '1d')),
  workday_end time not null default '18:00',
  timezone text not null default 'America/Sao_Paulo'
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  color text not null,
  created_at timestamptz not null default now()
);

create table demands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null check (char_length(title) between 1 and 300),
  due timestamptz not null,
  prio demand_prio not null default 'media',
  requester text not null default '',
  project_id uuid references projects on delete set null,
  company text check (company in ('Deskcorp', 'ITSS', 'Corebanx', 'Neobiz')),
  dept text check (dept in ('arquitetura', 'QA', 'plataforma e integração', 'governança', 'gestão', 'pessoal')),
  status demand_status not null default 'todo',
  prev_status demand_status,
  notes text not null default '',
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  done_at timestamptz
);
create index demands_user_due on demands (user_id, due);
-- o cron só olha abertas ainda não avisadas
create index demands_pending_push on demands (due) where status <> 'done' and notified_at is null;

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  demand_id uuid references demands on delete set null,
  text text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index notifications_user_created on notifications (user_id, created_at desc);

-- uma por aparelho (PC + celular)
create table push_subscriptions (
  endpoint text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table projects enable row level security;
alter table demands enable row level security;
alter table notifications enable row level security;
alter table push_subscriptions enable row level security;

create policy "own profile" on profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "own projects" on projects for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own demands" on demands for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own notifications" on notifications for select using (user_id = auth.uid());
create policy "mark own notifications" on notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own subscriptions" on push_subscriptions for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- project_id precisa ser do mesmo dono da demanda
create or replace function check_demand_project() returns trigger language plpgsql as $$
begin
  if new.project_id is not null and not exists (
    select 1 from projects where id = new.project_id and user_id = new.user_id
  ) then
    raise exception 'project not found';
  end if;
  return new;
end $$;
create trigger demands_project_owner before insert or update of project_id on demands
  for each row execute function check_demand_project();

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, name, timezone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'timezone', 'America/Sao_Paulo')
  );
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();
