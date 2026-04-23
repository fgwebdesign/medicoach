import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ChatPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chat</h1>
          <p className="text-muted-foreground">
            Sustituí por <code className="font-mono">MediChat</code> +{" "}
            <code className="font-mono">useChat</code> apuntando a{" "}
            <code className="font-mono">/api/chat</code>.
          </p>
        </div>
        <Card className="min-h-[50vh]">
          <CardHeader>
            <CardTitle>Área del agente</CardTitle>
            <CardDescription>
              Exportá la UI desde v0 (prompts en MediCoach_UX_UI_Guide).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Streaming LangGraph + Vercel AI SDK va aquí.
          </CardContent>
        </Card>
      </main>
    </>
  );
}
