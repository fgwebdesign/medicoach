-- Permite que el cliente service_role (Route Handlers / scripts) ejecute la RPC de RAG.
grant execute on function public.search_medical_knowledge(vector, float, int) to service_role;
