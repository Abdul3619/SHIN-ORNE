import { useEffect, useRef } from 'react';

/**
 * Soft silk ribbons drawn on one small canvas, so they cost very little to animate.
 *
 *  - The canvas is drawn at a fraction of the screen's pixel count and stretched by the browser, which
 *    keeps the ribbons soft and keeps every frame cheap. No SVG filters, no CSS blur.
 *  - The page version is fixed to the viewport. Its position follows the scroll through a damped value
 *    (it eases toward the real scroll instead of copying it), so a fast fling or swipe only makes the
 *    ribbons glide a little faster and never jump.
 *  - Only the visible screen is drawn. It pauses when the tab is hidden or the hero is off-screen, draws
 *    about 25 frames a second (plenty for slow silk) and draws a single still frame when the visitor has
 *    asked for reduced motion.
 *
 * Colours come from --lx-silk-1/2/3/hi in luxe.css, so each theme gets its own palette.
 */
interface Ribbon { cx: number; amp: number; len: number; phase: number; width: number; twist: number; strands: number; tint: number; speed: number }

const PAGE: Ribbon[] = [
  { cx: 0.8, amp: 0.2, len: 620, phase: 0.2, width: 0.34, twist: 760, strands: 26, tint: 0, speed: 1 },
  { cx: 0.24, amp: 0.18, len: 760, phase: 3.1, width: 0.27, twist: 920, strands: 20, tint: 1, speed: 0.8 },
  { cx: 0.55, amp: 0.26, len: 980, phase: 1.7, width: 0.2, twist: 1180, strands: 16, tint: 2, speed: 0.6 },
];
const HERO: Ribbon[] = [
  { cx: 0.8, amp: 0.15, len: 300, phase: 0.4, width: 0.3, twist: 380, strands: 28, tint: 0, speed: 1 },
  { cx: 0.62, amp: 0.17, len: 420, phase: 2.6, width: 0.2, twist: 520, strands: 20, tint: 1, speed: 0.8 },
];

type RGB = [number, number, number];
const hex = (v: string): RGB => {
  const s = v.trim().replace('#', '');
  const f = s.length === 3 ? s.split('').map((c) => c + c).join('') : s;
  const n = parseInt(f, 16);
  return Number.isNaN(n) ? [255, 140, 180] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export default function SilkCanvas({ variant = 'page' }: { variant?: 'page' | 'hero' }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const hero = variant === 'hero';
    const ribbons = hero ? HERO : PAGE;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const SCALE = hero ? 0.42 : 0.32;
    let W = 0, H = 0;
    let pal: RGB[] = [[255, 127, 174], [180, 124, 240], [255, 156, 194], [255, 224, 234]];
    let dark = true;
    let scrollTarget = window.scrollY;
    let scrollSmooth = window.scrollY;
    let t = 0;
    let last = performance.now();
    let raf = 0;
    let visible = true;

    const readTheme = () => {
      const cs = getComputedStyle(document.documentElement);
      pal = ['--lx-silk-1', '--lx-silk-2', '--lx-silk-3', '--lx-silk-hi'].map((n) => hex(cs.getPropertyValue(n)));
      dark = document.documentElement.classList.contains('dark');
    };
    const resize = () => {
      const r = hero ? canvas.parentElement!.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
      W = Math.max(2, Math.round(r.width * SCALE));
      H = Math.max(2, Math.round(r.height * SCALE));
      canvas.width = W;
      canvas.height = H;
    };
    const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';
      const off = hero ? 0 : scrollSmooth * 0.28 * SCALE;
      const step = Math.max(8, Math.round(H / 34));
      const aStrand = dark ? 1 : 0.8;
      for (let ri = 0; ri < ribbons.length; ri++) {
        const r = ribbons[ri];
        const len = r.len * SCALE, twist = r.twist * SCALE;
        const tt = t * r.speed + (hero ? 0 : scrollSmooth * 0.0011);
        const cx = r.cx * W, amp = r.amp * W, wMax = r.width * W;
        const n = Math.ceil((H + 2 * step) / step) + 1;
        const centre = new Float32Array(n), spread = new Float32Array(n), ys = new Float32Array(n);
        for (let i = 0; i < n; i++) {
          const y = -step + i * step;
          const yy = y + off;
          ys[i] = y;
          centre[i] = cx + amp * Math.sin(yy / len + r.phase + tt * 0.00022) + amp * 0.38 * Math.sin(yy / (len * 0.43) + r.phase * 2.1 - tt * 0.00015);
          spread[i] = wMax * (0.16 + 0.84 * Math.abs(Math.sin(yy / twist + r.phase * 0.7 + tt * 0.00018)));
        }
        const c1 = pal[r.tint % 3], c2 = pal[(r.tint + 1) % 3], c3 = pal[(r.tint + 2) % 3];
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, rgba(c1, 1)); g.addColorStop(0.5, rgba(c2, 1)); g.addColorStop(1, rgba(c3, 1));

        // satin body, drawn a few times at different widths so the edge fades out softly
        const bodyAlpha = dark ? [0.035, 0.05, 0.07] : [0.03, 0.045, 0.06];
        const widen = [1.55, 1.25, 1];
        for (let k = 0; k < 3; k++) {
          ctx.beginPath();
          for (let i = 0; i < n; i++) ctx.lineTo(centre[i] - (spread[i] * widen[k]) / 2, ys[i]);
          for (let i = n - 1; i >= 0; i--) ctx.lineTo(centre[i] + (spread[i] * widen[k]) / 2, ys[i]);
          ctx.closePath();
          ctx.fillStyle = g;
          ctx.globalAlpha = bodyAlpha[k];
          ctx.fill();
        }

        // fine strands
        ctx.lineWidth = 1;
        ctx.strokeStyle = g;
        for (let s = 0; s < r.strands; s++) {
          const k = r.strands === 1 ? 0 : s / (r.strands - 1) - 0.5;
          ctx.globalAlpha = (0.1 + 0.28 * Math.abs(Math.sin(s * 0.9 + ri))) * aStrand;
          ctx.beginPath();
          for (let i = 0; i < n; i++) ctx.lineTo(centre[i] + k * spread[i], ys[i]);
          ctx.stroke();
        }

        // highlight along the edges where the satin catches the light
        ctx.strokeStyle = rgba(pal[3], 1);
        ctx.globalAlpha = dark ? 0.32 : 0.4;
        ctx.lineWidth = 1.2;
        for (const side of [-0.5, 0.5]) {
          ctx.beginPath();
          for (let i = 0; i < n; i++) ctx.lineTo(centre[i] + side * spread[i], ys[i]);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = now - last;
      if (dt < 40 || !visible || document.hidden) return;
      last = now;
      t += Math.min(dt, 100);
      // ease toward the real scroll position; the time constant makes fast flings glide
      scrollSmooth += (scrollTarget - scrollSmooth) * (1 - Math.exp(-dt / 420));
      draw();
    };

    const onScroll = () => { scrollTarget = window.scrollY; };
    const onResize = () => { resize(); draw(); };
    resize();
    readTheme();
    draw();
    const mo = new MutationObserver(() => { readTheme(); draw(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', onResize);
    let io: IntersectionObserver | undefined;
    if (hero && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver((e) => { visible = e[0].isIntersecting; });
      io.observe(canvas);
    }
    // The hero is opaque and has its own ribbons, so the page ribbons are not drawn while it fills the screen.
    let heroIo: IntersectionObserver | undefined;
    const heroEl = !hero ? document.querySelector('.lx-hero') : null;
    if (heroEl && typeof IntersectionObserver !== 'undefined') {
      heroIo = new IntersectionObserver((e) => { visible = e[0].intersectionRatio < 0.9; if (visible) draw(); }, { threshold: [0, 0.9, 1] });
      heroIo.observe(heroEl);
    }
    if (!reduced) {
      window.addEventListener('scroll', onScroll, { passive: true });
      raf = requestAnimationFrame(frame);
    }
    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      io?.disconnect();
      heroIo?.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
    };
  }, [variant]);

  return <canvas ref={ref} aria-hidden="true" className={`lx-silk-canvas lx-silk-canvas--${variant}`} />;
}
