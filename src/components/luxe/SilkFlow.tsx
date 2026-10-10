import { useEffect, useId, useMemo, useState } from 'react';

/**
 * Flowing silk ribbons drawn behind the page. Each ribbon is a bundle of thin strands that follow one
 * wavy centre line and fan out and pinch together as the ribbon "twists", which is what gives it the
 * look of satin catching the light. Layers per ribbon: a blurred glow, a translucent satin body, the
 * strands themselves, and a few bright strands with a light pulse travelling along them.
 *
 * The geometry is generated in the browser after mount, so it adds nothing to the server-rendered HTML.
 * Colours come from --lx-silk-1/2/3 in luxe.css, so light and dark themes each get their own palette.
 */
interface Ribbon {
  cx: number; // centre x (viewBox units) the ribbon swings around
  amp: number; // swing amplitude
  len: number; // wavelength of the swing, in y units
  phase: number;
  width: number; // widest the bundle gets
  twist: number; // wavelength of the pinch/fan cycle
  strands: number;
  tint: 0 | 1 | 2;
  drift: number; // seconds for one sway cycle
}

const num = (n: number) => Math.round(n * 10) / 10;

function build(r: Ribbon, H: number, step: number) {
  const ys: number[] = [];
  for (let y = -60; y <= H + 60; y += step) ys.push(y);
  const centre = (y: number) =>
    r.cx + r.amp * Math.sin(y / r.len + r.phase) + r.amp * 0.38 * Math.sin(y / (r.len * 0.43) + r.phase * 2.1);
  const spread = (y: number) => r.width * (0.16 + 0.84 * Math.abs(Math.sin(y / r.twist + r.phase * 0.7)));
  const edge = (side: 1 | -1) => ys.map((y, i) => `${i ? 'L' : 'M'}${num(centre(y) + (side * spread(y)) / 2)} ${y}`).join('');
  const strands: string[] = [];
  for (let s = 0; s < r.strands; s++) {
    const k = r.strands === 1 ? 0 : s / (r.strands - 1) - 0.5; // -0.5 .. 0.5 across the bundle
    strands.push(ys.map((y, i) => `${i ? 'L' : 'M'}${num(centre(y) + k * spread(y))} ${y}`).join(''));
  }
  const left = ys.map((y, i) => `${i ? 'L' : 'M'}${num(centre(y) - spread(y) / 2)} ${y}`).join('');
  const rightReversed = [...ys].reverse().map((y) => `L${num(centre(y) + spread(y) / 2)} ${y}`).join('');
  return { body: `${left}${rightReversed}Z`, strands, centre: ys.map((y, i) => `${i ? 'L' : 'M'}${num(centre(y))} ${y}`).join(''), edgeL: edge(-1), edgeR: edge(1) };
}

export default function SilkFlow({ variant = 'page', className = '' }: { variant?: 'page' | 'hero'; className?: string }) {
  const [ready, setReady] = useState(false);
  const uid = useId().replace(/:/g, '');
  useEffect(() => setReady(true), []);

  const hero = variant === 'hero';
  const H = hero ? 900 : 5800;
  const ribbons: Ribbon[] = useMemo(
    () =>
      hero
        ? [
            { cx: 980, amp: 190, len: 210, phase: 0.4, width: 340, twist: 260, strands: 30, tint: 0, drift: 22 },
            { cx: 790, amp: 200, len: 300, phase: 2.6, width: 230, twist: 340, strands: 22, tint: 1, drift: 28 },
          ]
        : [
            { cx: 880, amp: 250, len: 420, phase: 0.2, width: 420, twist: 520, strands: 34, tint: 0, drift: 26 },
            { cx: 330, amp: 230, len: 520, phase: 3.1, width: 330, twist: 640, strands: 26, tint: 1, drift: 32 },
            { cx: 620, amp: 330, len: 760, phase: 1.7, width: 250, twist: 880, strands: 20, tint: 2, drift: 38 },
          ],
    [hero],
  );
  const geo = useMemo(() => (ready ? ribbons.map((r) => build(r, H, hero ? 14 : 42)) : []), [ready, ribbons, H, hero]);
  if (!ready) return <div aria-hidden="true" className={`lx-silk ${className}`} />;

  const grad = (i: number) => `${uid}g${i}`;
  return (
    <div aria-hidden="true" className={`lx-silk lx-silk--${variant} ${className}`}>
      <svg viewBox={`0 0 1200 ${H}`} preserveAspectRatio="none" className="lx-silk-svg">
        <defs>
          {ribbons.map((r, i) => (
            <linearGradient key={i} id={grad(i)} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={`var(--lx-silk-${((r.tint + 0) % 3) + 1})`} />
              <stop offset="50%" stopColor={`var(--lx-silk-${((r.tint + 1) % 3) + 1})`} />
              <stop offset="100%" stopColor={`var(--lx-silk-${((r.tint + 2) % 3) + 1})`} />
            </linearGradient>
          ))}
          <filter id={`${uid}b1`} x="-40%" y="-10%" width="180%" height="120%"><feGaussianBlur stdDeviation={hero ? 26 : 38} /></filter>
          <filter id={`${uid}b2`} x="-40%" y="-10%" width="180%" height="120%"><feGaussianBlur stdDeviation={hero ? 4 : 7} /></filter>
        </defs>
        {geo.map((g, i) => {
          const r = ribbons[i];
          return (
            <g key={i} className="lx-silk-sway" style={{ animationDuration: `${r.drift}s`, animationDelay: `${-i * 7}s` }}>
              {/* soft glow underneath, then the translucent satin body */}
              <path d={g.centre} fill="none" stroke={`url(#${grad(i)})`} strokeWidth={r.width * 0.9} opacity="0.22" filter={`url(#${uid}b1)`} vectorEffect="non-scaling-stroke" style={{ strokeWidth: hero ? 120 : 150 }} />
              <path d={g.body} fill={`url(#${grad(i)})`} opacity="0.2" filter={`url(#${uid}b2)`} />
              <path d={g.body} fill={`url(#${grad(i)})`} opacity="0.1" />
              {/* the strands */}
              {g.strands.map((d, s) => (
                <path key={s} d={d} fill="none" stroke={`url(#${grad(i)})`} strokeWidth="1" vectorEffect="non-scaling-stroke" opacity={0.18 + 0.5 * Math.abs(Math.sin(s * 0.9 + i))} />
              ))}
              {/* bright edges, like light catching the folds */}
              <path d={g.edgeL} fill="none" stroke="var(--lx-silk-hi)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" opacity="0.55" />
              <path d={g.edgeR} fill="none" stroke="var(--lx-silk-hi)" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.35" />
              {/* a pulse of light travelling along an edge */}
              <path d={g.edgeL} fill="none" stroke="var(--lx-silk-hi)" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" pathLength={1000} strokeDasharray="38 962" className="lx-silk-pulse" style={{ animationDuration: `${r.drift * 0.5}s`, animationDelay: `${-i * 5}s` }} filter={hero ? `url(#${uid}b2)` : undefined} />
              <path d={g.edgeL} fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" pathLength={1000} strokeDasharray="22 978" className="lx-silk-pulse" style={{ animationDuration: `${r.drift * 0.5}s`, animationDelay: `${-i * 5}s` }} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
