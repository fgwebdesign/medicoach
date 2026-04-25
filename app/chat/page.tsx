import { SiteHeader } from "@/components/layout/site-header";
import { MediChat } from "@/components/features/chat/medichat";
import { ChatLoginRequired } from "@/components/features/chat/chat-login-required";
import { ChatGuidanceSidebar } from "@/components/features/chat/chat-guidance-sidebar";
import { createClient } from "@/lib/integrations/supabase/server";
import { cn } from "@/lib/utils";

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-3 pb-8 pt-4 sm:px-4 sm:pt-5">
          <ChatLoginRequired />
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main
        className={cn(
          "min-h-[calc(100dvh-3.5rem)] w-full",
          "bg-gradient-to-b from-background via-primary/[0.02] to-muted/20",
        )}
      >
        <div
          className={cn(
            "mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 py-5 sm:px-5 sm:py-6",
            "lg:grid lg:min-h-[calc(100dvh-3.5rem-2.5rem)] lg:max-w-6xl lg:grid-cols-[minmax(0,280px)_1fr] lg:items-start lg:gap-8 lg:px-6 lg:py-8",
          )}
        >
          <ChatGuidanceSidebar />
          <div className="min-w-0">
            <MediChat />
          </div>
        </div>
      </main>
    </>
  );
}
