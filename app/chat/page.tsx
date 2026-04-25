import { unstable_noStore as noStore } from "next/cache";
import { SiteHeader } from "@/components/layout/site-header";
import { MediChat } from "@/components/features/chat/medichat";
import { ChatLoginRequired } from "@/components/features/chat/chat-login-required";
import { ChatGuidanceSidebar } from "@/components/features/chat/chat-guidance-sidebar";
import { createClient } from "@/lib/integrations/supabase/server";
import { cn } from "@/lib/utils";

/** Evita RSC en caché de visitas anónimas (link prefetch) con usuario ya logueado. */
export const dynamic = "force-dynamic";

export default async function ChatPage() {
  noStore();
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
          "min-h-[calc(100dvh-3.75rem)] w-full",
          "bg-gradient-to-b from-background via-primary/[0.04] to-muted/25",
          "dark:via-primary/[0.06] dark:to-background",
        )}
      >
        <div
          className={cn(
            "mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 py-5 sm:px-5 sm:py-6",
            "lg:grid lg:min-h-[calc(100dvh-3.75rem-1.5rem)] lg:max-w-6xl lg:grid-cols-[minmax(0,300px)_1fr] lg:items-stretch lg:gap-8 lg:px-6 lg:py-7",
          )}
        >
          <ChatGuidanceSidebar />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <MediChat />
          </div>
        </div>
      </main>
    </>
  );
}
