-- Adds pieces for the Rings and Bridal & Engagement collections.
-- Photos reuse existing catalogue images as placeholders; replace them from the admin dashboard.
-- Not applied yet: the shin-orne Supabase project is paused. Run this after restoring it.
insert into products (name, price, image, category)
select seed.name, seed.price, seed.image, seed.category from (values
  ('Solitaire Promise Ring', 245.00, 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=800&crop=entropy', 'Rings'),
  ('Twisted Gold Band', 95.00, 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=800&crop=edges', 'Rings'),
  ('Halo Engagement Ring', 890.00, 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=801', 'Bridal'),
  ('Classic Wedding Band Pair', 420.00, 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=802', 'Bridal'),
  ('Bridal Pearl Set', 360.00, 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=801', 'Bridal')
) as seed(name, price, image, category)
where not exists (select 1 from products p where p.name = seed.name);
