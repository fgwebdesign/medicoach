import { MediChat } from "@/components/features/chat/medichat";
import { SiteHeader } from "@/components/layout/site-header";

export default function ChatPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chat</h1>
          <p className="text-muted-foreground">
            Agente con streaming (Vercel AI SDK), RAG en Supabase y herramienta
            openFDA.
          </p>
        </div>
        <MediChat />
      </main>
    </>
  );
}
