/**
 * A continuous flowing gold ribbon that runs the full height of whatever it's placed behind,
 * stretching to fill its container (preserveAspectRatio="none") so it works behind a page of
 * any length -- a short hero section or a long multi-section page alike. Three layers:
 * a wide blurred glow pass, a crisp thin line, and a bright "pulse" that travels continuously
 * along the same path (stroke-dasharray/offset animation) for the sense of light actually
 * flowing through it rather than a static gradient.
 *
 * Colors come from CSS custom properties (--ribbon-stop-1/2/3, --ribbon-pulse) defined in
 * index.css for both the light and dark theme, so this one component works in either.
 */
export default function FlowRibbon({ className = '' }: { className?: string }) {
  const path =
    'M 980 -120 C 650 260, 1060 620, 700 980 S 140 1580, 560 1980 S 1020 2540, 660 2940 S 140 3500, 560 3900 S 1000 4320, 700 4700 S 220 5300, 620 5700';

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <svg viewBox="0 0 1200 5800" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="ribbon-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--ribbon-stop-1)" />
            <stop offset="45%" stopColor="var(--ribbon-stop-2)" />
            <stop offset="100%" stopColor="var(--ribbon-stop-3)" />
          </linearGradient>
          <filter id="ribbon-blur" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="28" />
          </filter>
        </defs>

        {/* Soft wide glow */}
        <path d={path} fill="none" stroke="url(#ribbon-gold)" strokeWidth="160" strokeLinecap="round" opacity="0.28" filter="url(#ribbon-blur)" />

        {/* Crisp line */}
        <path d={path} fill="none" stroke="url(#ribbon-gold)" strokeWidth="2.5" opacity="0.55" />

        {/* Travelling light pulse */}
        <path
          d={path}
          fill="none"
          stroke="var(--ribbon-pulse)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="70 5500"
          className="ribbon-pulse"
          filter="url(#ribbon-blur)"
        />
        <path d={path} fill="none" stroke="var(--ribbon-pulse)" strokeWidth="3" strokeLinecap="round" strokeDasharray="70 5500" className="ribbon-pulse" />
      </svg>
    </div>
  );
}
