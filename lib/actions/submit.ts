'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const CATEGORIES = ['design', 'developer-tools', 'productivity', 'fun', 'news', 'utility'];

export async function submitWebsite(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: 'You must be signed in to submit.' };

  const url = formData.get('url') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const categories = formData.getAll('categories') as string[];

  if (!url || !title || !description) return { success: false, error: 'All fields are required.' };
  if (categories.length === 0) return { success: false, error: 'Select at least one category.' };
  if (categories.length > 2) return { success: false, error: 'Maximum 2 categories allowed.' };
  const invalidCat = categories.find((c) => !CATEGORIES.includes(c));
  if (invalidCat) return { success: false, error: 'Invalid category.' };

  let domain = '';
  try {
    domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');
  } catch {
    return { success: false, error: 'Invalid URL format.' };
  }

  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  const { data: website, error: insertError } = await supabase
    .from('websites')
    .insert({
      url: normalizedUrl,
      domain,
      title,
      description,
      favicon_url: faviconUrl,
      submitter_id: user.id,
      status: 'pending',
    })
    .select('id')
    .single();

  if (insertError) {
    if (insertError.code === '23505') return { success: false, error: 'This website has already been submitted.' };
    return { success: false, error: insertError.message };
  }

  const categoryRows = categories.map((slug) => ({ website_id: website.id, category_slug: slug }));
  await supabase.from('website_categories').insert(categoryRows);

  revalidatePath('/');
  return { success: true, websiteId: website.id };
}
