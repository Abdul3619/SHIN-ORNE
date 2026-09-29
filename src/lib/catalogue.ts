import type { Product } from '../types';

// Collections shown on the storefront. `match` lists the product categories (as entered in the admin
// dashboard) that belong to each collection.
export const COLLECTIONS = [
  { slug: 'rings', name: 'Rings', match: ['rings'], image: 'photo-1599643477877-530eb83abc8e' },
  { slug: 'necklaces', name: 'Necklaces', match: ['necklaces', 'sets'], image: 'photo-1515562141207-7a88fb7ce338' },
  { slug: 'earrings', name: 'Earrings', match: ['earrings'], image: 'photo-1535632066927-ab7c9ab60908' },
  { slug: 'bracelets', name: 'Bracelets', match: ['bracelets'], image: 'photo-1611591437281-460bfbe1220a' },
  { slug: 'bridal', name: 'Bridal & Engagement', match: ['bridal', 'bridal & engagement', 'engagement'], image: 'photo-1611085583191-a3b181a88401' },
] as const;

export type CollectionSlug = (typeof COLLECTIONS)[number]['slug'];

export function inCollection(product: Product, slug: CollectionSlug) {
  const collection = COLLECTIONS.find((c) => c.slug === slug)!;
  return (collection.match as readonly string[]).includes(product.category.trim().toLowerCase());
}

// Rings and bridal pieces offer ring sizing and engraving. These options are UI only: they are shown in the
// cart and at checkout but are not yet sent to the server or stored with the order.
export function hasRingOptions(product: Product) {
  return inCollection(product, 'rings') || inCollection(product, 'bridal');
}

export const RING_SIZES = ['H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
export const ENGRAVING_MAX = 20;

// Unsplash photos can be resized on request (and served as AVIF/WebP with auto=format), so product images
// hosted there get a responsive srcset. Other image URLs are used as they are.
export function unsplashUrl(id: string, width: number) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&q=75&w=${width}`;
}

export function responsiveImage(src: string, widths = [400, 640, 960, 1280]) {
  try {
    const url = new URL(src);
    if (url.hostname !== 'images.unsplash.com') return { src };
    const srcSet = widths
      .map((w) => {
        url.searchParams.set('w', String(w));
        url.searchParams.set('auto', 'format');
        return `${url.toString()} ${w}w`;
      })
      .join(', ');
    return { src, srcSet };
  } catch {
    return { src };
  }
}
