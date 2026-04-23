-- MediCoach — esquema inicial (migración versionada).
-- Revisá políticas según tu modelo de auth antes de producción.

create extension if not exists "uuid-ossp";
create extension if not exists vector;

-- Perfil 1:1 con auth.users
create table public.patient_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  conditions text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.medications (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patient_profiles (id) on delete cascade,
  name text not null,
  rxcui text,
  dose text,
  frequency text,
  schedule jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.symptoms (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patient_profiles (id) on delete cascade,
  medication_id uuid references public.medications (id) on delete set null,
  symptom text not null,
  severity int not null check (severity between 1 and 10),
  note text,
  recorded_at timestamptz not null default now()
);

create table public.chat_sessions (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patient_profiles (id) on delete cascade,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.medical_knowledge (
  id bigserial primary key,
  source text not null,
  category text,
  content text not null,
  embedding vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Índice vectorial (tras la primera carga de datos podés recrear con HNSW si preferís)
create index medical_knowledge_embedding_ivfflat
  on public.medical_knowledge
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 10);

-- RLS
alter table public.patient_profiles enable row level security;
alter table public.medications enable row level security;
alter table public.symptoms enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.medical_knowledge enable row level security;

create policy "patient_profiles_select_own"
  on public.patient_profiles for select
  using (auth.uid() = id);

create policy "patient_profiles_insert_own"
  on public.patient_profiles for insert
  with check (auth.uid() = id);

create policy "patient_profiles_update_own"
  on public.patient_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "medications_crud_own"
  on public.medications for all
  using (patient_id = auth.uid())
  with check (patient_id = auth.uid());

create policy "symptoms_crud_own"
  on public.symptoms for all
  using (patient_id = auth.uid())
  with check (patient_id = auth.uid());

create policy "chat_sessions_crud_own"
  on public.chat_sessions for all
  using (patient_id = auth.uid())
  with check (patient_id = auth.uid());

-- medical_knowledge: sin políticas → solo service_role en API / scripts de ingesta.
-- Búsqueda semántica vía RPC (definer) para el usuario autenticado:
create or replace function public.search_medical_knowledge(
  query_embedding vector(1536),
  match_threshold float default 0.78,
  match_count int default 5
)
returns table (
  id bigint,
  content text,
  source text,
  metadata jsonb,
  similarity float
)
language sql
stable
security definer
set search_path = public
as $$
  select
    mk.id,
    mk.content,
    mk.source,
    mk.metadata,
    (1 - (mk.embedding <=> query_embedding))::float as similarity
  from public.medical_knowledge mk
  where mk.embedding is not null
    and (1 - (mk.embedding <=> query_embedding)) > match_threshold
  order by mk.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function public.search_medical_knowledge(vector, float, int) to authenticated;

-- Opcional: fila de perfil al registrarse (evita 404 en primera query)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.patient_profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
