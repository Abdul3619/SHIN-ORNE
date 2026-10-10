-- Adds pieces for the Rings and Bridal & Engagement collections (already applied to the shin-orne project).
-- Photos are Unsplash stock images used as placeholders; replace them from the admin dashboard.
insert into products (name, price, image, category)
select seed.name, seed.price, seed.image, seed.category from (values
  ('Eternal Hands Duo Set', 560.00, 'https://images.unsplash.com/photo-1769038931426-dba74f079ccd?auto=format&fit=crop&q=80&w=900', 'Bridal'),
  ('Vow Classic Gold Band', 310.00, 'https://images.unsplash.com/photo-1674275552496-5327af426de2?auto=format&fit=crop&q=80&w=900', 'Bridal'),
  ('Promise Gold Stack Pair', 275.00, 'https://images.unsplash.com/photo-1750891892189-cae53172de09?auto=format&fit=crop&q=80&w=900', 'Bridal'),
  ('Ember Pair Wedding Bands', 420.00, 'https://images.unsplash.com/photo-1782988112531-a189b256440e?auto=format&fit=crop&q=80&w=900', 'Bridal'),
  ('Midnight Sapphire Solitaire', 690.00, 'https://images.unsplash.com/photo-1735480165036-3d1d2f41460f?auto=format&fit=crop&q=80&w=900', 'Bridal'),
  ('Aurora Halo Engagement Ring', 890.00, 'https://images.unsplash.com/photo-1788495545073-51161449ca9e?auto=format&fit=crop&q=80&w=900', 'Bridal'),
  ('Silver Twin Band Set', 120.00, 'https://images.unsplash.com/photo-1550368566-f9cc32d7392d?auto=format&fit=crop&q=80&w=900', 'Rings'),
  ('Twisted Gold Band', 95.00, 'https://images.unsplash.com/photo-1608734022710-538043c7ec3f?auto=format&fit=crop&q=80&w=900', 'Rings'),
  ('Solstice Diamond Ring', 245.00, 'https://images.unsplash.com/photo-1546956923-f6ba9089ccde?auto=format&fit=crop&q=80&w=900', 'Rings')
) as seed(name, price, image, category)
where not exists (select 1 from products p where p.name = seed.name);
