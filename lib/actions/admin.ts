'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateWebsiteStatus(websiteId: string, status: 'approved' | 'rejected') {
  const supabase = await createClient();

  const { error } = await supabase
    .from('websites')
    .update({ status })
    .eq('id', websiteId);

  if (error) throw new Error(error.message);

  revalidatePath('/admin');
  revalidatePath('/');
}
