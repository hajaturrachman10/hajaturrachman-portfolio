# Hajaturrachman Portfolio

Final publish candidate: personal story portfolio, project archive, achievement gallery, protected CV viewer, private vault, and testimonial section.

## Main Features

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- next-themes
- framer-motion
- lucide-react
- Supabase-ready testimonials
- Password-gated CV preview and download
- Password-gated private vault
- Project detail modal with carousel galleries
- Main gallery modal with multiple media placeholders
- Responsive layout for mobile, tablet, laptop, and desktop

## Run Locally

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Build

```bash
npm run build
npm run start
```

## Passwords

Edit passwords in:

```txt
data/site.ts
```

Default:

```txt
CV: cvhajat2026
Private Vault: hajatprivat2026
```

## Real CV

The current CV file is:

```txt
public/assets/Hajaturrachman-CV.pdf
```

## Supabase Setup for Testimonials

Testimonials work with localStorage if Supabase is not configured. For public persistence across visitors, use Supabase.

### 1. Create Supabase Project

Create a free Supabase project.

### 2. Create Table

Run this SQL in Supabase SQL Editor:

```sql
create table testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table testimonials enable row level security;

create policy "Public can read testimonials"
on testimonials for select
using (true);

create policy "Public can insert testimonials"
on testimonials for insert
with check (
  length(name) between 1 and 80
  and length(email) between 3 and 160
  and length(message) between 1 and 600
);
```

### 3. Environment Variables

Create `.env.local`:

```txt
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

On Vercel, add the same variables in:

```txt
Project Settings > Environment Variables
```

## Deploy to Vercel

1. Push project to GitHub.
2. Open Vercel.
3. Add New Project.
4. Import GitHub repo.
5. Add Supabase environment variables if testimonials should be public.
6. Deploy.

## Important Security Note

The current password gate is frontend UI protection. It is useful for presentation, but not suitable for highly sensitive data. True private content requires backend authentication and protected storage.
