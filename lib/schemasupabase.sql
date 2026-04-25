-- =============================================================================
-- MediCoach — referencia de esquema (contexto / diagramas)
-- =============================================================================
-- Este archivo NO está pensado para ejecutarse tal cual (orden de tablas,
-- volcados de dashboard, etc.). La fuente de verdad aplicable al proyecto es:
--   supabase/schema.sql  y  supabase/migrations/*.sql
--
-- Gestión de usuarios (Supabase Auth)
-- ------------------------------------
-- • Los logins viven en auth.users (panel: Authentication → Users).
-- • La app usa email/contraseña: signInWithPassword / signUp; callback /auth/callback.
-- • public.patient_profiles (id, display_name, first_name, last_name, phone, …) = 1:1 con auth.users.
--   Al registrarse, on_auth_user_created → handle_new_user() inserta la fila con metadata del signUp.
-- • medicaciones, síntomas y chat_sessions referencian patient_profiles
--   (patient_id / id según tabla), siempre bajo RLS con auth.uid().
--
-- Si en Authentication → Users ves lista vacía pero “Total users” distinto,
-- probá quitar filtros de búsqueda o refrescar; los usuarios creados por OTP
-- aparecen cuando confirman el enlace o según políticas de confirmación email.
-- =============================================================================

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.chat_sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  patient_id uuid NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT chat_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT chat_sessions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(id)
);
CREATE TABLE public.medical_knowledge (
  id bigint NOT NULL DEFAULT nextval('medical_knowledge_id_seq'::regclass),
  source text NOT NULL,
  category text,
  content text NOT NULL,
  embedding USER-DEFINED,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT medical_knowledge_pkey PRIMARY KEY (id)
);
CREATE TABLE public.medications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  patient_id uuid NOT NULL,
  name text NOT NULL,
  rxcui text,
  dose text,
  frequency text,
  schedule jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT medications_pkey PRIMARY KEY (id),
  CONSTRAINT medications_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(id)
);
CREATE TABLE public.patient_profiles (
  id uuid NOT NULL,
  display_name text,
  first_name text,
  last_name text,
  phone text,
  conditions text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT patient_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT patient_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.symptoms (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  patient_id uuid NOT NULL,
  medication_id uuid,
  symptom text NOT NULL,
  severity integer NOT NULL CHECK (severity >= 1 AND severity <= 10),
  note text,
  recorded_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT symptoms_pkey PRIMARY KEY (id),
  CONSTRAINT symptoms_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(id),
  CONSTRAINT symptoms_medication_id_fkey FOREIGN KEY (medication_id) REFERENCES public.medications(id)
);
