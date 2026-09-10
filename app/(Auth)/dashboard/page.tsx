import DataTable from "@/components/DataTable";
import Statistics from "@/components/Statistics";
import Toolbar from "@/components/Toolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Debt } from "@/types";

export default async function Account() {
  const supabase = await createClient();

  const { data: user } = await supabase.auth.getUser();
  const { data: dataItems, error: debtsError } = await supabase
    .from("debts")
    .select("*")
    .eq("user_id", user?.user?.id)
    .order("created_at", { ascending: false });

  if (debtsError) {
    console.error("Error fetching debts in page:", debtsError);
  }

  const items = dataItems as Debt[];

  return (
    <section className="container mx-auto px-4 py-12">
      <h1 className="font-bold text-2xl">Kasbon</h1>
      <p className="mt-4">Email: {user?.user?.email}</p>

      <Statistics initialDebts={items} />
      <Toolbar />
      <Card>
        <CardHeader>
          <CardTitle className="sr-only">Kasbon</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable initialDebt={items} />
        </CardContent>
      </Card>
    </section>
  );
}
