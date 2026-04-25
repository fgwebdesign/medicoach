-- Perfil: nombre, apellido, teléfono (1:1 con auth.users; no hace falta tabla public.users).
-- Tras aplicar: `supabase db push` o ejecutar en SQL Editor.

alter table public.patient_profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists phone text;

comment on column public.patient_profiles.first_name is 'Nombre; también enviado en user_metadata al registrarse';
comment on column public.patient_profiles.last_name is 'Apellido';
comment on column public.patient_profiles.phone is 'Teléfono de contacto';

-- Rellena al crear el usuario en auth (metadata desde signUp options.data)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fn text;
  ln text;
  ph text;
  full_display text;
begin
  fn := nullif(trim(coalesce(new.raw_user_meta_data->>'first_name', '')), '');
  ln := nullif(trim(coalesce(new.raw_user_meta_data->>'last_name', '')), '');
  ph := nullif(trim(coalesce(new.raw_user_meta_data->>'phone', '')), '');

  full_display := nullif(
    trim(concat_ws(' ', fn, ln)),
    ''
  );
  if full_display is null then
    full_display := nullif(
      trim(coalesce(new.raw_user_meta_data->>'full_name', '')),
      ''
    );
  end if;
  if full_display is null then
    full_display := split_part(new.email, '@', 1);
  end if;

  insert into public.patient_profiles (id, display_name, first_name, last_name, phone)
  values (new.id, full_display, fn, ln, ph)
  on conflict (id) do nothing;

  return new;
end;
$$;
