import { useEffect, useRef, useState } from 'react';
import { cutout } from '../../lib/cutout';
import { gemSource, type Gem } from '../../lib/catalogue';

/**
 * A real photograph of the stone with its backdrop removed in the browser (see lib/cutout.ts), so it
 * sits on the page as a transparent cutout and picks up the page's own glow and shadow. The cutout is
 * only worked out when the stone is about to scroll into view. If the photo cannot be cut out it is
 * shown as an ordinary photo; while it loads, a quiet shimmer holds the space.
 */
export default function GemPhoto({ gem, className = '', eager = false, alt }: { gem: Gem; className?: string; eager?: boolean; alt?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [near, setNear] = useState(eager);
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const url = gemSource(gem.photo);

  useEffect(() => {
    if (near) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setNear(true); return; }
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { setNear(true); io.disconnect(); } }, { rootMargin: '600px' });
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  useEffect(() => {
    if (!near) return;
    let live = true;
    cutout(url, { tolerance: gem.tol }).then((out) => {
      if (!live) return;
      if (out) setSrc(out); else setFailed(true);
    });
    return () => { live = false; };
  }, [near, url, gem.tol]);

  return (
    <span ref={ref} className={`lx-gemphoto${src ? ' is-ready' : ''}${failed ? ' is-plain' : ''} ${className}`} style={{ ['--gem-glow' as string]: gem.glow }}>
      {src && <img src={src} alt={alt ?? `${gem.name} gemstone`} decoding="async" draggable={false} />}
      {failed && <img src={url} alt={alt ?? `${gem.name} gemstone`} loading="lazy" decoding="async" draggable={false} />}
    </span>
  );
}
