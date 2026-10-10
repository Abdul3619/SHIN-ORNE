import type { Product } from '../types';

// Collections shown on the storefront. `match` lists the product categories (as entered in the admin
// dashboard) that belong to each collection.
export const COLLECTIONS = [
  { slug: 'rings', name: 'Rings', match: ['rings'], image: 'photo-1546956923-f6ba9089ccde' },
  { slug: 'necklaces', name: 'Necklaces', match: ['necklaces', 'sets'], image: 'photo-1620656798579-1984d9e87df7' },
  { slug: 'earrings', name: 'Earrings', match: ['earrings'], image: 'photo-1701777892740-88419a701472' },
  { slug: 'bracelets', name: 'Bracelets', match: ['bracelets'], image: 'photo-1573446238824-c28afa0cd312' },
  { slug: 'bridal', name: 'Bridal & Engagement', match: ['bridal', 'bridal & engagement', 'engagement'], image: 'photo-1788495545073-51161449ca9e' },
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

// UK ring sizes with approximate inside diameter and circumference (mm), and US equivalents.
export const RING_TABLE: Record<string, [number, number, string]> = {
  H: [15.2, 47.8, '4'], I: [15.6, 49.0, '4½'], J: [16.0, 50.3, '5'], K: [16.4, 51.5, '5½'], L: [16.8, 52.8, '6'],
  M: [17.2, 54.0, '6½'], N: [17.6, 55.3, '7'], O: [18.0, 56.6, '7½'], P: [18.4, 57.8, '8'], Q: [18.8, 59.1, '8½'],
  R: [19.2, 60.3, '9'], S: [19.6, 61.6, '9½'], T: [20.0, 62.8, '10'],
};

// Closest size to a measured finger circumference (mm); between sizes, the larger one.
export function sizeForCircumference(mm: number) {
  for (const s of RING_SIZES) if (RING_TABLE[s][1] >= mm - 0.05) return s;
  return RING_SIZES[RING_SIZES.length - 1];
}

// Delivery. Standard is always free; express costs $15 unless the bag reaches the threshold (all in USD).
export const EXPRESS_FEE_USD = 15;
export const FREE_EXPRESS_FROM_USD = 300;

export const CATEGORY_BLURB: Record<string, string> = {
  rings: 'Stackable, sized and engraved for you',
  necklaces: 'Pendants and chains that catch the light',
  earrings: 'Drops and studs, light on the ear',
  bracelets: 'Beaded and chain bracelets for every wrist',
  bridal: 'Engagement rings and wedding bands',
};

export const GEMS = [
  { key: 'diamond', name: 'Diamond', mood: 'Timeless', color: '#e8f1ff', color2: '#9fb6d6', glow: 'rgba(210,228,255,.55)', words: ['diamond', 'solstice', 'aurora', 'halo', 'crystal'], story: 'The hardest natural stone, chosen for engagements because it is built to outlast the promise.', facts: ['Mohs 10', 'April', 'Engagement classic'] },
  { key: 'sapphire', name: 'Sapphire', mood: 'Wisdom', color: '#3d63e0', color2: '#16286e', glow: 'rgba(80,120,255,.55)', words: ['sapphire'], story: 'Deep blue and quietly regal, a favourite for those who want colour without losing elegance.', facts: ['Mohs 9', 'September', 'Royal blue'] },
  { key: 'emerald', name: 'Emerald', mood: 'Renewal', color: '#27b887', color2: '#0b5a40', glow: 'rgba(40,200,140,.5)', words: ['emerald'], story: 'A green that reads as spring, prized for its depth and the soft inclusions that make each stone its own.', facts: ['Mohs 7.5–8', 'May', 'Garden green'] },
  { key: 'ruby', name: 'Ruby', mood: 'Passion', color: '#e0334f', color2: '#6f0a22', glow: 'rgba(240,60,90,.55)', words: ['ruby'], story: 'The colour of devotion. A ruby is a statement piece that warms everything it sits against.', facts: ['Mohs 9', 'July', 'Pigeon blood'] },
  { key: 'morganite', name: 'Morganite', mood: 'Love', color: '#f5b4a8', color2: '#c4776a', glow: 'rgba(255,170,150,.5)', words: ['pearl', 'rose'], story: 'A blush pink stone for romantics. We pair it with soft gold for a gentle, modern engagement look.', facts: ['Mohs 7.5–8', 'Rose blush', 'Soft gold pairing'], similar: true },
  { key: 'tanzanite', name: 'Tanzanite', mood: 'Transformation', color: '#8a62e8', color2: '#35208a', glow: 'rgba(140,100,255,.55)', words: ['amethyst'], story: 'Violet shifting to blue as the light moves. Our nearest piece in the collection is the Amethyst Ring.', facts: ['Mohs 6.5', 'December', 'Violet-blue'], similar: true },
] as const;
export type Gem = (typeof GEMS)[number];

export const STYLES = [
  { key: 'classic', label: 'Classic & Timeless', words: ['solitaire', 'classic', 'vow', 'pearl', 'golden', 'band', 'halo'], reply: 'Clean lines and gold that never dates. These are the pieces people pass down.' },
  { key: 'bold', label: 'Modern & Bold', words: ['ruby', 'sapphire', 'emerald', 'amethyst', 'stack', 'eternal', 'charm'], reply: 'Colour and presence. Pieces meant to be noticed from across the room.' },
  { key: 'romantic', label: 'Romantic & Soft', words: ['pearl', 'rose', 'aurora', 'drop', 'ember', 'crystal'], reply: 'Soft light and delicate shapes, made for slow evenings and big days.' },
  { key: 'minimal', label: 'Minimal & Chic', words: ['silver', 'twin', 'twisted', 'stud', 'chain', 'bead'], reply: 'Quiet, wearable, easy to stack. Style that does not shout.' },
] as const;

export function matchByWords(products: Product[], words: readonly string[], limit = 3) {
  const lc = words.map((w) => w.toLowerCase());
  const scored = products
    .map((p) => ({ p, score: lc.filter((w) => p.name.toLowerCase().includes(w) || p.category.toLowerCase().includes(w)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.p.price - b.p.price);
  return scored.slice(0, limit).map((x) => x.p);
}

export const slugOf = (category: string): CollectionSlug | null => {
  const c = category.trim().toLowerCase();
  const hit = COLLECTIONS.find((col) => (col.match as readonly string[]).includes(c));
  return hit ? hit.slug : null;
};
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
