import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { count } = await supabase
    .from('email_subscribers')
    .select('*', { count: 'exact', head: true })
    .eq('unsubscribed', false);

  return Response.json({ count: count || 0 });
}
