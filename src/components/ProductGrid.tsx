import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Heart } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useInitialProducts } from '../context/ProductsContext';
import type { Product } from '../types';

// Collection links (#necklaces, ...) filter the grid; #shop-all shows everything.
const CATEGORY_HASHES: Record<string, string> = {
  '#necklaces': 'Necklaces',
  '#bracelets': 'Bracelets',
  '#earrings': 'Earrings',
  '#beads': 'Sets',
  '#rings': 'Rings',
};

export default function ProductGrid() {
  const initialProducts = useInitialProducts();
  const [products, setProducts] = useState<Product[]>(initialProducts ?? []);
  const [loading, setLoading] = useState(initialProducts === null);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();

  useEffect(() => {
    let cancelled = false;
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then(data => {
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
      const hash = window.location.hash.toLowerCase();
      if (hash in CATEGORY_HASHES || hash === '#shop-all') {
        setActiveCategory(CATEGORY_HASHES[hash] ?? null);
        if (scroll) document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
      }
    };
    applyHash(true);
    const onHashChange = () => applyHash(true);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleBuy = (product: Product) => {
    addToCart(product);
  };

  const visibleProducts = activeCategory
    ? products.filter(product => product.category.toLowerCase() === activeCategory.toLowerCase())
    : products;

  if (loading) return <div id="shop" className="py-24 text-center">Loading products...</div>;
  if (error) return <div id="shop" role="alert" className="py-24 text-center">{error}</div>;

  return (
    <section id="shop" className="py-24 bg-[#F9F7F2] scroll-mt-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-2 block">
              {activeCategory ?? 'Curated Selection'}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-medium text-gray-900 mb-4">
              Featured Treasures
            </h2>
            <p className="text-gray-600 font-light leading-relaxed">
              Explore our most coveted pieces, each handcrafted with precision and imbued with the unique charm of Shin Orne.
            </p>
          </div>
          <a
            href="#shop-all"
            className="text-sm font-medium uppercase tracking-widest border-b border-gray-900 pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors"
          >
            View All Products
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {visibleProducts.length === 0 && (
            <p className="col-span-full py-12 text-center text-gray-500">
              No pieces in this collection yet. Browse all products instead.
            </p>
          )}
          {visibleProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.05,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              className="group"
            >
              <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Overlay Actions */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center gap-2 bg-white/90 backdrop-blur-sm">
                  <button type="button" onClick={() => handleBuy(product)} className="p-2 rounded-full bg-gray-900 text-white hover:bg-gray-700 transition-colors" aria-label={`Add ${product.name} to cart`}>
                    <ShoppingBag size={18} />
                  </button>
                  <button type="button" className="p-2 rounded-full bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 transition-colors" aria-label="Add to wishlist">
                    <Heart size={18} />
                  </button>
                </div>
                
                {/* Badge */}
                {products.indexOf(product) < 2 && (
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 text-[10px] font-medium uppercase tracking-widest">
                    Best Seller
                  </span>
                )}
              </div>

              <div className="text-center">
                <span className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">
                  {product.category}
                </span>
                <h3 className="text-lg font-serif font-medium text-gray-900 mb-1 group-hover:text-gray-600 transition-colors cursor-pointer">
                  {product.name}
                </h3>
                <span className="text-sm font-medium text-gray-900">
                  {formatPrice(product.price)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
