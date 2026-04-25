import { createClient } from "@/lib/integrations/supabase/server";
import { SiteHeaderClient } from "@/components/layout/site-header-client";

export async function SiteHeader() {
  let email: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    email = data.user?.email ?? null;
  } catch {
    /* build sin env o cliente sin Supabase */
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <SiteHeaderClient initialEmail={email} />
    </header>
  );
}
