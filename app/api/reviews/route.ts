import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { slug, sentiment, body } = await req.json();

    if (!slug || !['pro', 'con'].includes(sentiment) || !body?.trim()) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    if (body.trim().length > 500) {
      return NextResponse.json({ error: 'Review too long.' }, { status: 400 });
    }

    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'You must be signed in to leave a review.' }, { status: 401 });
    }

    // Lookup website by slug
    const { data: site, error: siteError } = await supabase
      .from('websites')
      .select('id')
      .eq('slug', slug)
      .single();

    if (siteError || !site) {
      return NextResponse.json({ error: 'Website not found.' }, { status: 404 });
    }

    // Insert review
    const { error: insertError } = await supabase
      .from('website_reviews')
      .insert({
        website_id: site.id,
        user_id: user.id,
        sentiment,
        body: body.trim(),
      });

    if (insertError) {
      console.error('Review insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save review.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Reviews API error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
