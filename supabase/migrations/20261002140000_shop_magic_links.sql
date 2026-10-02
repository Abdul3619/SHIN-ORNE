-- One-time magic-link sign-in for the admin dashboard, mirroring the pattern already used for Agbada Luxe: lets
-- the portfolio's AI assistant hand a visitor a working login to this demo's dashboard without ever exposing the
-- real admin password (there is no per-admin email here to key off, since this app has a single shared admin
-- password -- see server.ts -- so a link is just a one-time stand-in for that password).
--
-- The raw token is generated and hashed in the Express server with Node's crypto (crypto.randomBytes /
-- createHash), exactly like this app's existing session-version values -- this migration only ever sees and
-- stores the SHA-256 hash, never the raw token, and enforces single-use atomically via an
-- UPDATE ... WHERE used_at IS NULL (never a SELECT-then-DELETE, which a destructive-statement confirmation gate
-- elsewhere in this project has been seen to block even when safely scoped inside a function body).

create table if not exists magic_links (
  token_hash text primary key,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);

revoke all on magic_links from anon, authenticated;

-- Stores a pre-hashed, pre-generated one-time token. p_token_hash is the hex SHA-256 of the raw token the server
-- already generated and will return to its caller; this function never sees the raw value.
create or replace function shop_magic_link_create(p_token_hash text, p_expires_at timestamptz)
returns void
language sql security definer set search_path = public
as $$ insert into magic_links (token_hash, expires_at) values (p_token_hash, p_expires_at) $$;

-- Marks a token used, atomically, only if it exists, hasn't been used, and hasn't expired. Returns whether the
-- token was valid; the caller (server.ts) issues a real admin session JWT only when this returns true.
create or replace function shop_magic_link_consume(p_token_hash text)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  v_count integer;
begin
  update magic_links
     set used_at = now()
   where token_hash = p_token_hash and used_at is null and expires_at > now();
  get diagnostics v_count = row_count;
  return v_count > 0;
end $$;

-- Same lockdown as every other shop_* function (see 20260926000000_shop_schema.sql): only service_role, which
-- only this app's own Express server ever holds, may call these. Safe to rerun -- it re-applies to every
-- shop_* function, including ones already locked down.
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
