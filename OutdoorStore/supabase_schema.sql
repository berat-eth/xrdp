-- Enable UUID extension for user IDs
create extension if not exists "uuid-ossp";

-- Create products table
create table if not exists public.products (
  id bigserial primary key,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  category text not null,
  image text,
  stock integer default 0 check (stock >= 0),
  brand text,
  rating numeric(3,2) default 0 check (rating >= 0 and rating <= 5),
  review_count integer default 0 check (review_count >= 0),
  created_at timestamptz default now()
);

-- Create users table (Note: Supabase uses auth.users for authentication)
-- This table is for additional user profile data
create table if not exists public.users (
  id uuid references auth.users(id) primary key,
  name text not null,
  email text unique not null,
  phone text,
  address text,
  created_at timestamptz default now()
);

-- Create cart table
create table if not exists public.cart (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

-- Create orders table
create table if not exists public.orders (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  total_amount numeric(10,2) not null check (total_amount >= 0),
  status text default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address text not null,
  payment_method text not null,
  created_at timestamptz default now()
);

-- Create order_items table
create table if not exists public.order_items (
  id bigserial primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  product_id bigint not null references public.products(id),
  quantity integer not null check (quantity > 0),
  price numeric(10,2) not null check (price >= 0),
  created_at timestamptz default now()
);

-- Create indexes for better performance
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_brand on public.products(brand);
create index if not exists idx_cart_user_id on public.cart(user_id);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_order_items_order_id on public.order_items(order_id);

-- Enable Row Level Security (RLS)
alter table public.products enable row level security;
alter table public.users enable row level security;
alter table public.cart enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- RLS Policies

-- Products: Everyone can read, only authenticated users can modify
create policy "Products are viewable by everyone" on public.products
  for select using (true);

create policy "Authenticated users can insert products" on public.products
  for insert with check (auth.uid() is not null);

create policy "Authenticated users can update products" on public.products
  for update using (auth.uid() is not null);

-- Users: Users can only access their own data
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.users
  for insert with check (auth.uid() = id);

-- Cart: Users can only access their own cart
create policy "Users can view own cart" on public.cart
  for select using (auth.uid() = user_id);

create policy "Users can insert to own cart" on public.cart
  for insert with check (auth.uid() = user_id);

create policy "Users can update own cart" on public.cart
  for update using (auth.uid() = user_id);

create policy "Users can delete from own cart" on public.cart
  for delete using (auth.uid() = user_id);

-- Orders: Users can only access their own orders
create policy "Users can view own orders" on public.orders
  for select using (auth.uid() = user_id);

create policy "Users can create own orders" on public.orders
  for insert with check (auth.uid() = user_id);

-- Order items: Users can view items from their own orders
create policy "Users can view own order items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

-- Function to automatically create user profile after signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create user profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Insert sample products
insert into public.products (name, description, price, category, image, stock, brand, rating, review_count) values
  ('Gore-Tex Pro Ceket', 'Profesyonel dağcılar için tasarlanmış, tamamen su geçirmez ve nefes alabilen ceket', 3499.90, 'Ceketler', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35', 15, 'The North Face', 4.8, 234),
  ('Trekking Pantolonu', 'Dayanıklı ve esnek kumaştan üretilmiş, çok cepli outdoor pantolon', 899.90, 'Pantolonlar', 'https://images.unsplash.com/photo-1594938291221-94f18cbb5660', 25, 'Columbia', 4.5, 156),
  ('Vibram Trekking Botu', 'Vibram taban, Gore-Tex membran, ayak bileği destekli profesyonel trekking botu', 2299.90, 'Ayakkabılar', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', 20, 'Salomon', 4.9, 412),
  ('65L Sırt Çantası', 'Uzun parkurlar için ideal, ergonomik sırt sistemi ile donatılmış büyük boy sırt çantası', 1899.90, 'Sırt Çantaları', 'https://images.unsplash.com/photo-1622260614153-03223fb72052', 12, 'Deuter', 4.7, 89),
  ('4 Mevsim Çadır', 'Extreme hava koşullarına dayanıklı, 3 kişilik profesyonel dağ çadırı', 4999.90, 'Çadırlar', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4', 8, 'MSR', 4.6, 67),
  ('-15°C Uyku Tulumu', 'Kaz tüyü dolgulu, -15 dereceye kadar konfor sağlayan premium uyku tulumu', 1599.90, 'Uyku Tulumları', 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7', 18, 'Marmot', 4.4, 143);