import { SiteHeader } from "@/components/layout/site-header";
import { createClient } from "@/lib/integrations/supabase/server";
import { ReportPageActions } from "./report-page-actions";

export default async function ReportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8">
        <ReportPageActions isLoggedIn={Boolean(user)} />
      </main>
    </>
  );
}
