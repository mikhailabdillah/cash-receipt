import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import Signout from "@/components/Signout";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar userData={claimsData?.claims.email} />
      <main className="flex w-full flex-col bg-neutral-100 p-4 shadow-md md:p-6">
        <div className="flex justify-between">
          <SidebarTrigger />
          <Signout />
        </div>

        {children}
      </main>
    </SidebarProvider>
  );
}
