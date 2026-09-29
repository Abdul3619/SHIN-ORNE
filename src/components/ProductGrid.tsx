import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Heart } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useInitialProducts } from '../context/ProductsContext';
import { COLLECTIONS, hasRingOptions, inCollection, responsiveImage, type CollectionSlug } from '../lib/catalogue';
import IllustrativeBadge from './IllustrativeBadge';
import RingOptionsDialog from './RingOptionsDialog';
import type { Product } from '../types';

// Collection links (/#rings, /#necklaces, ...) filter the grid; #shop-all shows everything.
const SLUGS = COLLECTIONS.map((c) => c.slug) as readonly string[];

function ProductImage({ product }: { product: Product }) {
  const [loaded, setLoaded] = useState(false);
  const image = responsiveImage(product.image);
  return (
    <div className={`absolute inset-0 ${loaded ? '' : 'skeleton'}`} style={{ borderRadius: 0 }}>
      <img
        {...image}
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        alt={product.name}
        loading="lazy"
        decoding="async"
        ref={(el) => { if (el?.complete && el.naturalWidth > 0 && !loaded) setLoaded(true); }}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i}>
          <div className="skeleton aspect-[4/5] mb-4" style={{ borderRadius: 0 }} />
          <div className="skeleton h-3 w-20 mx-auto mb-2" />
          <div className="skeleton h-5 w-40 mx-auto mb-2" />
          <div className="skeleton h-4 w-16 mx-auto" />
        </div>
      ))}
    </div>
  );
}

export default function ProductGrid() {
  const initialProducts = useInitialProducts();
  const [products, setProducts] = useState<Product[]>(initialProducts ?? []);
  const [loading, setLoading] = useState(initialProducts === null);
  const [error, setError] = useState('');
  const [active, setActive] = useState<CollectionSlug | null>(null);
  const [optionsFor, setOptionsFor] = useState<Product | null>(null);
  const { formatPrice } = useCurrency();
  const { addToCart, wishlist, toggleWishlist } = useCart();

  useEffect(() => {
    let cancelled = false;
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (!Array.isArray(data)) throw new Error('Unexpected response');
        setProducts(data);
        setError('');
      })
      .catch(() => {
        // Keep the server-rendered products if a refresh fails.
        if (!cancelled && initialProducts === null) {
          setError('Our collection could not be loaded right now. Please refresh the page or try again shortly.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const applyHash = (scroll: boolean) => {
      const hash = window.location.hash.slice(1).toLowerCase();
      if (SLUGS.includes(hash) || hash === 'shop-all') {
        setActive(hash === 'shop-all' ? null : (hash as CollectionSlug));
        if (scroll) document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
      }
    };
    applyHash(true);
    const onHashChange = () => applyHash(true);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleAdd = (product: Product) => {
    if (hasRingOptions(product)) setOptionsFor(product);
    else addToCart(product);
  };

  const visibleProducts = active ? products.filter((p) => inCollection(p, active)) : products;
  const activeName = active ? COLLECTIONS.find((c) => c.slug === active)!.name : null;

  return (
    <section id="shop" aria-labelledby="shop-heading" className="py-24 bg-[#F9F7F2] scroll-mt-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div className="max-w-xl">
            <span className="text-sm font-medium text-gray-600 uppercase tracking-widest mb-2 block">{activeName ?? 'Curated Selection'}</span>
            <h2 id="shop-heading" className="text-4xl md:text-5xl font-serif font-medium text-gray-900 mb-4">
              Featured Treasures
            </h2>
            <p className="text-gray-700 font-light leading-relaxed">
              Explore our most coveted pieces, each handcrafted with precision and imbued with the unique charm of Shin Orne.
            </p>
          </div>
        </div>

        {/* Collection filter */}
        <nav aria-label="Filter by collection" className="flex flex-wrap gap-2 mb-12">
          {[{ slug: 'shop-all', name: 'All' }, ...COLLECTIONS].map((c) => {
            const selected = (c.slug === 'shop-all' && !active) || c.slug === active;
            return (
              <a
                key={c.slug}
                href={`#${c.slug}`}
                aria-current={selected ? 'true' : undefined}
                className={`press px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${selected ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-800 hover:border-gray-900'}`}
              >
                {c.name}
              </a>
            );
          })}
        </nav>

        {loading ? (
          <>
            <p className="sr-only" role="status">Loading products…</p>
            <SkeletonGrid />
          </>
        ) : error ? (
          <p role="alert" className="py-12 text-center text-gray-800">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {visibleProducts.length === 0 && (
              <p className="col-span-full py-12 text-center text-gray-700">
                No pieces in this collection yet. <a href="#shop-all" className="underline">Browse all products</a> instead.
              </p>
            )}
            {visibleProducts.map((product, index) => {
              const saved = wishlist.includes(product.id);
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: Math.min(index, 8) * 0.05, type: 'spring', stiffness: 100, damping: 15 }}
                  className="group flex flex-col"
                >
                  <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden mb-4">
                    <ProductImage product={product} />
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      aria-pressed={saved}
                      aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
                      className="press absolute top-3 right-3 p-2 rounded-full bg-white/90 text-gray-900 hover:bg-white shadow-sm"
                    >
                      <Heart size={18} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
                    </button>
                    {index < 2 && !active && (
                      <span className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-gray-900">
                        Best Seller
                      </span>
                    )}
                  </div>

                  <div className="text-center flex-1 flex flex-col">
                    <span className="text-xs text-gray-600 uppercase tracking-wider mb-1 block">{product.category}</span>
                    <h3 className="text-lg font-serif font-medium text-gray-900 mb-1">{product.name}</h3>
                    <span className="text-sm font-medium text-gray-900 mb-4">{formatPrice(product.price)}</span>
                    <button
                      type="button"
                      onClick={() => handleAdd(product)}
                      className="press mt-auto inline-flex items-center justify-center gap-2 border border-gray-900 text-gray-900 px-4 py-2 text-xs uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-colors"
                      aria-label={hasRingOptions(product) ? `Choose size for ${product.name}` : `Add ${product.name} to cart`}
                    >
                      <ShoppingBag size={14} aria-hidden="true" />
                      {hasRingOptions(product) ? 'Choose size' : 'Add to cart'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        {!loading && !error && products.length > 1 && (
          <p className="mt-10 text-center text-gray-700">
            <IllustrativeBadge label="Best Seller tags are illustrative" />
          </p>
        )}
      </div>

      {optionsFor && (
        <RingOptionsDialog
          product={optionsFor}
          onClose={() => setOptionsFor(null)}
          onAdd={(options) => {
            addToCart(optionsFor, options);
            setOptionsFor(null);
          }}
        />
      )}
    </section>
  );
}
