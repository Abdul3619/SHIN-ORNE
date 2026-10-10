import { Heart, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useShop } from '../../context/ShopContext';
import { hasRingOptions, responsiveImage } from '../../lib/catalogue';
import type { Product } from '../../types';

export default function ProductCard({ product, tag, priority = false }: { product: Product; tag?: string; priority?: boolean }) {
  const { wishlist, toggleWishlist } = useCart();
  const { formatPrice } = useCurrency();
  const { quickAdd } = useShop();
  const saved = wishlist.includes(product.id);
  const ring = hasRingOptions(product);

  return (
    <article className="lx-card">
      <div className="lx-card-img">
        <img {...responsiveImage(product.image, [360, 560, 800])} sizes="(min-width: 1180px) 22vw, (min-width: 900px) 30vw, 48vw" alt={product.name} loading={priority ? 'eager' : 'lazy'} decoding="async" referrerPolicy="no-referrer" />
        {tag && <span className="lx-tag">{tag}</span>}
        <button
          type="button"
          className={`lx-heart${saved ? ' is-on' : ''}`}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          onClick={() => toggleWishlist(product.id)}
        >
          <Heart size={17} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      </div>
      <div className="lx-card-body">
        <small>{product.category}</small>
        <h3>{product.name}</h3>
        <span className="lx-price">{formatPrice(product.price)}</span>
        <button
          type="button"
          className="lx-btn lx-btn--sm"
          onClick={() => quickAdd(product)}
          aria-label={ring ? `Choose size for ${product.name}` : `Add ${product.name} to bag`}
        >
          <Plus size={14} aria-hidden="true" />
          {ring ? 'Choose size' : 'Add to bag'}
        </button>
      </div>
    </article>
  );
}
