-- Shin Orne store schema (replaces the former SQLite database).
--
-- Security model: every table has row level security enabled and no policies, and every function is
-- executable only by service_role. The anon/authenticated keys therefore cannot read or write anything;
-- only the Express server (holding SUPABASE_SERVICE_ROLE_KEY) can, through the functions below.

create table if not exists products (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 120),
  price numeric(10, 2) not null check (price > 0 and price <= 1000000),
  image text not null check (image ~* '^https?://'),
  category text not null check (char_length(category) between 1 and 60),
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id bigint generated always as identity primary key,
  customer_name text not null check (char_length(customer_name) between 1 and 120),
  customer_email text not null check (char_length(customer_email) <= 254),
  total numeric(12, 2) not null check (total >= 0),
  status text not null default 'Pending' check (status in ('Pending', 'Shipped', 'Delivered')),
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists subscribers (
  id bigint generated always as identity primary key,
  email text not null unique check (char_length(email) <= 254),
  created_at timestamptz not null default now()
);

create table if not exists settings (
  key text primary key,
  value text not null
);

create table if not exists login_failures (
  ip text primary key,
  count integer not null default 0,
  reset_at timestamptz not null
);

alter table products enable row level security;
alter table orders enable row level security;
alter table subscribers enable row level security;
alter table settings enable row level security;
alter table login_failures enable row level security;

revoke all on products, orders, subscribers, settings, login_failures from anon, authenticated;

-- Initial catalogue (same products the SQLite version seeded)
insert into products (name, price, image, category)
select * from (values
  ('Golden Aura Necklace', 129.00, 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&q=80&w=800', 'Necklaces'),
  ('Emerald Bead Bracelet', 89.00, 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800', 'Bracelets'),
  ('Pearl Drop Earrings', 149.00, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800', 'Earrings'),
  ('Sapphire Charm Set', 199.00, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800', 'Sets'),
  ('Ruby Pendant', 210.00, 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=800', 'Necklaces'),
  ('Silver Bead Chain', 75.00, 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&q=80&w=801', 'Bracelets'),
  ('Crystal Studs', 59.00, 'https://images.unsplash.com/photo-1629224316810-9d8805b95e76?auto=format&fit=crop&q=80&w=800', 'Earrings'),
  ('Amethyst Ring', 115.00, 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=800', 'Rings')
) as seed(name, price, image, category)
where not exists (select 1 from products);

-- ---------- Products ----------
create or replace function shop_list_products()
returns table (id bigint, name text, price double precision, image text, category text)
language sql stable security definer set search_path = public
as $$ select id, name, price::double precision, image, category from products order by id $$;

create or replace function shop_create_product(p_name text, p_price numeric, p_image text, p_category text)
returns table (id bigint, name text, price double precision, image text, category text)
language sql security definer set search_path = public
as $$
  insert into products (name, price, image, category) values (p_name, round(p_price, 2), p_image, p_category)
  returning id, name, price::double precision, image, category
$$;

create or replace function shop_update_product(p_id bigint, p_name text, p_price numeric, p_image text, p_category text)
returns boolean
language plpgsql security definer set search_path = public
as $$
begin
  update products set name = p_name, price = round(p_price, 2), image = p_image, category = p_category where id = p_id;
  return found;
end $$;

create or replace function shop_delete_product(p_id bigint)
returns boolean
language plpgsql security definer set search_path = public
as $$
begin
  delete from products where id = p_id;
  return found;
end $$;

-- ---------- Orders ----------
-- Prices always come from the products table; the browser only sends product ids and quantities.
-- Raises 'invalid_item' for malformed lines and 'unavailable_item' when a product no longer exists.
create or replace function shop_create_order(p_customer_name text, p_customer_email text, p_items jsonb)
returns table (id bigint, total double precision)
language plpgsql security definer set search_path = public
as $$
declare
  v_lines jsonb := '[]'::jsonb;
  v_total numeric := 0;
  v_item jsonb;
  v_product products%rowtype;
  v_qty integer;
  v_id bigint;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 50 then
    raise exception 'invalid_item';
  end if;
  for v_item in select * from jsonb_array_elements(p_items) loop
    if jsonb_typeof(v_item->'id') <> 'number' or jsonb_typeof(v_item->'quantity') <> 'number'
       or (v_item->>'quantity')::numeric <> trunc((v_item->>'quantity')::numeric)
       or (v_item->>'id')::numeric <> trunc((v_item->>'id')::numeric) then
      raise exception 'invalid_item';
    end if;
    v_qty := (v_item->>'quantity')::integer;
    if v_qty < 1 or v_qty > 99 then
      raise exception 'invalid_item';
    end if;
    select * into v_product from products where products.id = (v_item->>'id')::bigint;
    if not found then
      raise exception 'unavailable_item';
    end if;
    v_total := v_total + v_product.price * v_qty;
    v_lines := v_lines || jsonb_build_object('id', v_product.id, 'name', v_product.name, 'price', v_product.price::double precision, 'quantity', v_qty);
  end loop;

  insert into orders (customer_name, customer_email, total, items)
  values (p_customer_name, p_customer_email, round(v_total, 2), v_lines)
  returning orders.id into v_id;

  return query select v_id, round(v_total, 2)::double precision;
end $$;

create or replace function shop_list_orders()
returns table (id bigint, customer_name text, customer_email text, total double precision, status text, items jsonb, created_at timestamptz)
language sql stable security definer set search_path = public
as $$
  select id, customer_name, customer_email, total::double precision, status, items, created_at
  from orders order by created_at desc, id desc
$$;

create or replace function shop_update_order_status(p_id bigint, p_status text)
returns boolean
language plpgsql security definer set search_path = public
as $$
begin
  update orders set status = p_status where id = p_id;
  return found;
end $$;

-- ---------- Newsletter ----------
create or replace function shop_subscribe(p_email text)
returns void
language sql security definer set search_path = public
as $$ insert into subscribers (email) values (lower(p_email)) on conflict (email) do nothing $$;

create or replace function shop_list_subscribers()
returns table (email text, created_at timestamptz)
language sql stable security definer set search_path = public
as $$ select email, created_at from subscribers order by created_at desc $$;

-- ---------- Admin auth ----------
-- The admin password is stored only as a scrypt hash computed by the server.
create or replace function shop_get_admin_auth()
returns table (password_hash text, session_version text)
language sql stable security definer set search_path = public
as $$
  select (select value from settings where key = 'admin_password'),
         coalesce((select value from settings where key = 'session_version'), '0')
$$;

-- First-run seeding from ADMIN_PASSWORD; never overwrites an existing password.
create or replace function shop_seed_admin_password(p_hash text)
returns void
language sql security definer set search_path = public
as $$ insert into settings (key, value) values ('admin_password', p_hash) on conflict (key) do nothing $$;

-- Changing the password rotates the session version, which signs out every existing session.
create or replace function shop_set_admin_password(p_hash text, p_session_version text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  insert into settings (key, value) values ('admin_password', p_hash)
    on conflict (key) do update set value = excluded.value;
  insert into settings (key, value) values ('session_version', p_session_version)
    on conflict (key) do update set value = excluded.value;
end $$;

-- Failed-login rate limiting (shared across serverless instances)
create or replace function shop_login_blocked(p_ip text, p_max integer)
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from login_failures where ip = p_ip and reset_at > now() and count >= p_max) $$;

create or replace function shop_record_login_failure(p_ip text, p_window_seconds integer)
returns void
language sql security definer set search_path = public
as $$
  insert into login_failures (ip, count, reset_at) values (p_ip, 1, now() + make_interval(secs => p_window_seconds))
  on conflict (ip) do update set
    count = case when login_failures.reset_at <= now() then 1 else login_failures.count + 1 end,
    reset_at = case when login_failures.reset_at <= now() then excluded.reset_at else login_failures.reset_at end
$$;

create or replace function shop_clear_login_failures(p_ip text)
returns void
language sql security definer set search_path = public
as $$ delete from login_failures where ip = p_ip $$;

-- Only the server (service_role) may call these functions.
do $$
declare f record;
begin
  for f in
    select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname like 'shop\_%'
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;
