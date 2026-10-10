import type { Gem } from '../../lib/catalogue';

// A faceted gem drawn in SVG (no photography needed): a radial-gradient body, facet lines and a highlight.
// Each gem key has its own cut so the row reads as six different stones, not one recoloured icon.
const SHAPES: Record<string, { body: string; facets: string[]; shine: string }> = {
  diamond: {
    body: 'M18 40 L38 14 L82 14 L102 40 L60 106 Z',
    facets: ['M18 40 H102', 'M38 14 L48 40 L60 14 L72 40 L82 14', 'M48 40 L60 106 L72 40'],
    shine: 'M42 18 L56 18 L50 36 Z',
  },
  sapphire: {
    body: 'M60 12 C92 12 108 36 108 62 C108 88 90 108 60 108 C30 108 12 88 12 62 C12 36 28 12 60 12 Z',
    facets: ['M60 12 L60 108', 'M12 62 H108', 'M26 26 L94 98', 'M94 26 L26 98'],
    shine: 'M30 30 C38 20 52 16 60 16 L44 48 Z',
  },
  emerald: {
    body: 'M30 12 H90 L108 30 V90 L90 108 H30 L12 90 V30 Z',
    facets: ['M30 28 H90 L96 36 V84 L90 92 H30 L24 84 V36 Z', 'M42 44 H78 V76 H42 Z', 'M12 30 L24 36', 'M108 30 L96 36', 'M12 90 L24 84', 'M108 90 L96 84'],
    shine: 'M30 12 H56 L40 28 H30 Z',
  },
  ruby: {
    body: 'M60 108 C20 80 8 52 22 30 C36 10 56 20 60 36 C64 20 84 10 98 30 C112 52 100 80 60 108 Z',
    facets: ['M60 36 L60 108', 'M22 30 L60 60 L98 30', 'M14 60 L60 60 L106 60'],
    shine: 'M26 32 C32 22 44 20 52 28 L40 48 Z',
  },
  morganite: {
    body: 'M60 8 C84 40 100 62 100 80 C100 98 82 110 60 110 C38 110 20 98 20 80 C20 62 36 40 60 8 Z',
    facets: ['M60 8 L60 110', 'M20 80 H100', 'M60 40 L30 90', 'M60 40 L90 90'],
    shine: 'M56 16 L50 52 L36 74 Z',
  },
  tanzanite: {
    body: 'M60 10 L108 94 Q60 112 12 94 Z',
    facets: ['M60 10 L60 102', 'M36 52 L84 52', 'M24 74 L96 74', 'M12 94 L60 62 L108 94'],
    shine: 'M58 16 L42 46 L56 46 Z',
  },
};

export default function GemIcon({ gem, size = 74 }: { gem: Gem; size?: number }) {
  const shape = SHAPES[gem.key];
  const id = `gem-${gem.key}`;
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true" style={{ ['--gem-glow' as string]: gem.glow }}>
      <defs>
        <radialGradient id={id} cx="35%" cy="28%" r="85%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="26%" stopColor={gem.color} />
          <stop offset="100%" stopColor={gem.color2} />
        </radialGradient>
      </defs>
      <path d={shape.body} fill={`url(#${id})`} stroke="rgba(255,255,255,0.55)" strokeWidth="1" strokeLinejoin="round" />
      {shape.facets.map((d) => (
        <path key={d} d={d} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.9" strokeLinejoin="round" />
      ))}
      <path d={shape.shine} fill="rgba(255,255,255,0.55)" />
    </svg>
  );
}
