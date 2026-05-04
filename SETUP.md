# Website of the Week — Setup Guide

## Prerequisites
- Node.js 18+
- Supabase project
- Upstash Redis account
- Vercel account

## 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase project settings (keep secret)
- `UPSTASH_REDIS_REST_URL` — from Upstash console
- `UPSTASH_REDIS_REST_TOKEN` — from Upstash console
- `CRON_SECRET` — generate with: `openssl rand -hex 32`

## 2. Database Setup

Run these SQL files **in order** in the Supabase SQL Editor:

1. `schema.sql` — core tables (users, websites, categories)
2. `migration_voting.sql` — voting engine
3. `migration_trust.sql` — ownership claims + spam tracking
4. `migration_comments.sql` — comment system

## 3. Supabase Auth Setup

In Supabase Dashboard → Authentication → Providers:
- Enable **Email** (magic link)
- Enable **Google** OAuth (add Client ID + Secret)
- Add redirect URL: `https://your-domain.com/auth/callback`

## 4. Enable Realtime

In Supabase Dashboard → Database → Replication:
- Enable realtime for the `votes` table

## 5. Initialize First Voting Week

After deploying, call this once to start week 1:

```bash
curl -X POST https://your-domain.com/api/weekly-reset \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 6. Vercel Deployment

1. Push this repo to GitHub
2. Import into Vercel
3. Add all environment variables from `.env.example`
4. Deploy
5. Add a Vercel Cron job in `vercel.json` (already configured)

## 7. Add Seed Categories

In Supabase SQL Editor:
```sql
INSERT INTO categories (name, slug) VALUES
  ('Developer Tools', 'developer-tools'),
  ('Design', 'design'),
  ('AI & Machine Learning', 'ai-ml'),
  ('Productivity', 'productivity'),
  ('Entertainment', 'entertainment'),
  ('News & Media', 'news-media'),
  ('E-commerce', 'ecommerce'),
  ('Education', 'education');
```
