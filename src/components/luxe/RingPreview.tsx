// A gold ring with a faceted stone; any engraving is drawn along the inside of the band so the
// designer shows what will actually be engraved.
export default function RingPreview({ engraving }: { engraving: string }) {
  const text = engraving.trim() || 'Your words here';
  return (
    <svg viewBox="0 0 300 300" role="img" aria-label={engraving.trim() ? `Ring engraved with ${engraving.trim()}` : 'Ring preview'}>
      <defs>
        <linearGradient id="rp-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe4eb" />
          <stop offset="45%" stopColor="#eda0b5" />
          <stop offset="100%" stopColor="#a8566e" />
        </linearGradient>
        <radialGradient id="rp-stone" cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#dbe9ff" />
          <stop offset="100%" stopColor="#7d96bd" />
        </radialGradient>
        <path id="rp-arc" d="M 78 196 Q 150 262 222 196" fill="none" />
      </defs>
      {/* back of the band */}
      <ellipse cx="150" cy="188" rx="92" ry="78" fill="none" stroke="#5a2a3c" strokeWidth="14" opacity="0.55" />
      {/* engraved inner surface */}
      <ellipse cx="150" cy="190" rx="82" ry="68" fill="rgba(251,234,176,0.08)" />
      <text fontFamily="'Cormorant Garamond', Georgia, serif" fontStyle="italic" fontSize="17" fill="#ffd6e0" letterSpacing="3" textAnchor="middle">
        <textPath href="#rp-arc" startOffset="50%">{text.length > 22 ? text.slice(0, 22) : text}</textPath>
      </text>
      {/* front of the band */}
      <path d="M 58 188 A 92 78 0 0 0 242 188" fill="none" stroke="url(#rp-gold)" strokeWidth="15" strokeLinecap="round" />
      <path d="M 66 192 A 84 70 0 0 0 234 192" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      {/* prongs */}
      <path d="M128 112 L124 92 M172 112 L176 92 M150 114 L150 94" stroke="url(#rp-gold)" strokeWidth="5" strokeLinecap="round" />
      {/* stone */}
      <g transform="translate(150 78)">
        <path d="M-38 -4 L-24 -26 L24 -26 L38 -4 L0 40 Z" fill="url(#rp-stone)" stroke="rgba(255,255,255,0.8)" strokeWidth="1" strokeLinejoin="round" />
        <path d="M-38 -4 H38 M-24 -26 L-14 -4 L0 -26 L14 -4 L24 -26 M-14 -4 L0 40 L14 -4" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="0.9" />
        <path d="M-20 -22 L-4 -22 L-10 -6 Z" fill="rgba(255,255,255,0.8)" />
      </g>
      <g stroke="#fff0f5" strokeWidth="1.6" strokeLinecap="round" opacity="0.9">
        <path d="M205 40 v16 M197 48 h16" />
        <path d="M92 52 v10 M87 57 h10" />
      </g>
    </svg>
  );
}
