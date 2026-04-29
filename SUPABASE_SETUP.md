# Supabase Migration Setup Guide

This project now uses Supabase for database and storage instead of Firebase.

## 1) Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and create a new project.
2. Wait for the project to finish provisioning.

## 2) Run the SQL schema

1. Open your Supabase dashboard.
2. Go to `SQL Editor`.
3. Open `server/supabase/schema.sql` from this repo.
4. Copy all SQL and run it in the SQL Editor.

This creates these tables:
- `users`
- `products`
- `carts`
- `orders`

## 3) Create a storage bucket for product images

1. In Supabase, go to `Storage`.
2. Create a bucket named `product-images` (or another name if you also update env vars).
3. Set the bucket to public if you want direct public URLs for product images.

## 4) Get project credentials

In Supabase dashboard:
1. Go to `Project Settings` -> `API`.
2. Copy:
   - `Project URL` -> `SUPABASE_URL`
   - `service_role key` -> `SUPABASE_SERVICE_ROLE_KEY`  
     (server-only secret; never expose to frontend)

## 5) Configure backend env

In `server/.env`:

```env
PORT=3000
NODE_ENV=development

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=product-images

ALLOWED_ORIGINS=http://localhost:4200
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

## 6) Install backend dependencies and run

From `server/`:

```bash
npm install
npm run dev
```

API should run at `http://localhost:3000`.

## 7) Connect frontend to backend

In the frontend environment file (already used by this project), set your API base URL:

- dev: `http://localhost:3000/api`
- production: your deployed API URL + `/api`

Then run frontend:

```bash
cd client
npm install
ng serve
```

## 8) Make your first admin account

1. Register a user from the website.
2. In Supabase -> `Table Editor` -> `users`, find that row.
3. Change `role` from `user` to `admin`.

## 9) Important security notes

- Never use `SUPABASE_SERVICE_ROLE_KEY` in client-side code.
- Keep all writes through your Node/Express server.
- If you plan to enable strict Row Level Security (RLS), add policies for your API behavior first.

## 10) Deployment checklist

- Add the same env vars on your server host (Render/Railway/VPS).
- Ensure CORS includes your frontend domain.
- Verify storage bucket name matches `SUPABASE_STORAGE_BUCKET`.
- Run `server/supabase/schema.sql` on production Supabase project before first deploy.






SUPABASE=schema.sql(code)

-- Bazaar E-Commerce Supabase schema
-- Run this in Supabase SQL Editor.

  create extension if not exists "pgcrypto";

  create table if not exists public.users (
    id text primary key,
    email text not null unique,
    name text not null,
    password text not null,
    role text not null default 'user' check (role in ('user', 'admin')),
    avatar text,
    phone text,
    address jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  create table if not exists public.products (
    id text primary key,
    name text not null,
    description text not null,
    price numeric(12,2) not null check (price >= 0),
    original_price numeric(12,2),
    category text not null,
    subcategory text,
    stock integer not null default 0 check (stock >= 0),
    image_url text not null default '',
    images jsonb not null default '[]'::jsonb,
    tags text[] not null default '{}',
    rating numeric(4,2) not null default 0 check (rating >= 0),
    review_count integer not null default 0 check (review_count >= 0),
    featured boolean not null default false,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  create table if not exists public.carts (
    id text primary key,
    user_id text not null references public.users(id) on delete cascade,
    items jsonb not null default '[]'::jsonb,
    updated_at timestamptz not null default now()
  );

  create table if not exists public.orders (
    id text primary key,
    user_id text not null references public.users(id),
    user_email text not null,
    user_name text not null,
    items jsonb not null default '[]'::jsonb,
    subtotal numeric(12,2) not null default 0,
    shipping numeric(12,2) not null default 0,
    tax numeric(12,2) not null default 0,
    total numeric(12,2) not null default 0,
    status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    shipping_address jsonb not null,
    payment_method text not null,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  create index if not exists idx_products_category on public.products(category);
  create index if not exists idx_products_featured on public.products(featured);
  create index if not exists idx_products_active on public.products(active);
  create index if not exists idx_orders_user_id on public.orders(user_id);
  create index if not exists idx_orders_status on public.orders(status);

  -- Optional: updated_at auto-maintenance trigger
  create or replace function public.set_updated_at()
  returns trigger
  language plpgsql
  as $$
  begin
    new.updated_at = now();
    return new;
  end;
  $$;

  drop trigger if exists users_set_updated_at on public.users;
  create trigger users_set_updated_at before update on public.users
  for each row execute function public.set_updated_at();

  drop trigger if exists products_set_updated_at on public.products;
  create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();

  drop trigger if exists orders_set_updated_at on public.orders;
  create trigger orders_set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();



New update sql supabase code 

-- Adds profile avatar upload support, product poster metadata, and product reviews/ratings.
-- Run this in Supabase SQL Editor after your base schema is created.

alter table public.products
  add column if not exists created_by text references public.users(id) on delete set null;

create index if not exists idx_products_created_by on public.products(created_by);

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  user_id text not null references public.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id, user_id)
);

create index if not exists idx_product_reviews_product_id on public.product_reviews(product_id);
create index if not exists idx_product_reviews_user_id on public.product_reviews(user_id);

drop trigger if exists product_reviews_set_updated_at on public.product_reviews;
create trigger product_reviews_set_updated_at
before update on public.product_reviews
for each row execute function public.set_updated_at();






## 11) Run new feature migration (profile + reviews)

After running your base schema, also run:

- `server/supabase/migrations/20260426_profile_and_reviews.sql`

This adds `products.created_by` and the `product_reviews` table used by product rating/review features.
