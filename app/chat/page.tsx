import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { MediChat } from "@/components/features/chat/medichat";
import { Badge } from "@/components/ui/badge";

export default function ChatPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                Chat
              </h1>
              <Badge variant="secondary">MVP</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Streaming (AI SDK), RAG en Supabase y etiquetas FDA vía openFDA.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Sin Gateway:{" "}
            <Link
              className="font-medium text-primary underline-offset-4 hover:underline"
              href="/"
            >
              una <code className="font-mono">OPENAI_API_KEY</code> para chat + embeddings
            </Link>
            .
          </p>
        </div>
        <MediChat />
      </main>
    </>
  );
}
