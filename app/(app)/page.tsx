import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server"; // tu helper de createServerClient()

export default async function Home() {
  const supabase = supabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  const dest = session ? "/inicio" : "/login";
  redirect(dest);
}