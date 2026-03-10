import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from('email_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('unsubscribed', false);

    if (error) {
      console.error('subscriber-count error:', error.code, error.message);
      return Response.json({ count: 0 });
    }

    return Response.json({ count: count || 0 });
  } catch (err) {
    console.error('subscriber-count route error:', err);
    return Response.json({ count: 0 });
  }
}
