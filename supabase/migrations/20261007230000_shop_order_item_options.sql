-- Ring size and engraving were already collected in the cart UI but silently dropped before the
-- order reached the database (see the former comment in src/context/CartContext.tsx). This widens
-- shop_create_order to accept and store them per line, inside the existing items jsonb column --
-- no new table/columns needed, just richer per-item objects.

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
  v_ring_size text;
  v_engraving text;
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

    -- Both are optional, free-text UI fields -- keep them, but cap length and drop blanks so a
    -- malicious or empty value can't bloat the stored order or render oddly in the admin table.
    v_ring_size := left(trim(coalesce(v_item->>'ringSize', '')), 20);
    v_engraving := left(trim(coalesce(v_item->>'engraving', '')), 60);
    if v_ring_size = '' then v_ring_size := null; end if;
    if v_engraving = '' then v_engraving := null; end if;

    v_total := v_total + v_product.price * v_qty;
    v_lines := v_lines || jsonb_build_object(
      'id', v_product.id,
      'name', v_product.name,
      'price', v_product.price::double precision,
      'quantity', v_qty,
      'ringSize', v_ring_size,
      'engraving', v_engraving
    );
  end loop;

  insert into orders (customer_name, customer_email, total, items)
  values (p_customer_name, p_customer_email, round(v_total, 2), v_lines)
  returning orders.id into v_id;

  return query select v_id, round(v_total, 2)::double precision;
end $$;
