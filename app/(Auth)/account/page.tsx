import { createClient } from '@/lib/supabase/server'

export default async function Account() {
  const supabase = await createClient()

  const { data: claimsData } = await supabase.auth.getClaims()

  return <section>
    {claimsData?.claims.email}
  </section>
}