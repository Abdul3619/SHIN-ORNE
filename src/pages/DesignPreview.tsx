import { motion } from 'motion/react';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import FlowRibbon from '../components/FlowRibbon';
import GlassPanel from '../components/GlassPanel';
import { unsplashUrl } from '../lib/catalogue';
import { Gem, Ruler, Sparkles, ArrowRight } from 'lucide-react';

/**
 * Standalone proof of the visual direction from docs/design-reference/lumiere-visual-reference.{png,md}:
 * a continuous flowing gold ribbon behind the whole page, frosted glassmorphism panels with a
 * drifting internal sheen, and a light/dark theme toggle -- all built generically (ThemeContext,
 * FlowRibbon, GlassPanel) so they can be reused once a direction is picked, not just demo-only code.
 *
 * Deliberately NOT wired into the real storefront yet (same "prove it first" pattern as the rest
 * of this project) -- reachable at /design-preview, noindex'd, browser-rendered only (see server.ts).
 */
export default function DesignPreview() {
  return (
    <ThemeProvider defaultTheme="dark">
      <DesignPreviewContent />
    </ThemeProvider>
  );
}

function DesignPreviewContent() {
  const { theme } = useTheme();

  return (
    <div
      className="relative min-h-screen overflow-hidden font-sans transition-colors duration-500"
      style={{ backgroundColor: 'var(--page-bg)', color: 'var(--page-fg)' }}
    >
      <FlowRibbon />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
        <span className="font-serif text-xl tracking-[0.15em] uppercase">Shin Orne</span>
        <div className="flex items-center gap-4">
          <span className="hidden text-xs uppercase tracking-widest opacity-70 md:inline">
            {theme === 'dark' ? 'Dark theme' : 'Light theme'}
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex min-h-[80vh] flex-col items-start justify-center px-6 md:px-12">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] opacity-75"
        >
          <Sparkles size={14} strokeWidth={1.5} /> Visual direction proof
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-2xl font-serif text-5xl font-medium leading-tight md:text-7xl"
        >
          More Than Jewelry
          <br />
          <span className="italic font-light" style={{ color: 'var(--ribbon-stop-1)' }}>
            It's Your Story
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 max-w-md text-base opacity-80 md:text-lg"
        >
          The same flowing ribbon, glass panels, and theme toggle shown here are reusable
          components -- not a one-off page -- ready to carry into the real storefront.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex gap-4"
        >
          <a
            href="#configurator"
            className="press inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium uppercase tracking-widest"
            style={{ backgroundColor: 'var(--ribbon-stop-1)', color: '#1a1406' }}
          >
            See the glass panels <ArrowRight size={16} />
          </a>
        </motion.div>
      </section>

      {/* Configurator-style glass panel */}
      <section id="configurator" className="relative z-10 px-6 py-24 md:px-12">
        <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="aspect-[4/5] overflow-hidden rounded-2xl"
          >
            <img
              src={unsplashUrl('photo-1626122780071-c09d403b8e32', 800)}
              srcSet={[480, 800, 1200].map((w) => `${unsplashUrl('photo-1626122780071-c09d403b8e32', w)} ${w}w`).join(', ')}
              sizes="(min-width: 768px) 40vw, 100vw"
              alt="Gold rings"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}>
            <GlassPanel className="p-8">
              <span className="relative z-10 mb-2 flex items-center gap-2 text-xs uppercase tracking-widest opacity-70">
                <Gem size={14} strokeWidth={1.5} /> Design Yours
              </span>
              <h2 className="relative z-10 mb-4 font-serif text-3xl font-medium">Build a Ring As Unique As You</h2>
              <p className="relative z-10 mb-6 text-sm opacity-80">
                Metal, gemstone, size and engraving in one panel -- the frosted glass and
                drifting sheen are CSS, not an image, so this reads correctly over any
                background behind it.
              </p>
              <div className="relative z-10 mb-6 flex gap-3">
                {['#D4AF37', '#E6D2B5', '#C0C0C0', '#B76E79'].map((c) => (
                  <span key={c} className="h-8 w-8 rounded-full border border-white/30" style={{ backgroundColor: c }} />
                ))}
              </div>
              <button
                type="button"
                className="press relative z-10 w-full rounded-full py-3.5 text-sm font-medium uppercase tracking-widest"
                style={{ backgroundColor: 'var(--ribbon-stop-1)', color: '#1a1406' }}
              >
                Start Customization
              </button>
            </GlassPanel>
          </motion.div>
        </div>
      </section>

      {/* Size guide glass panel */}
      <section className="relative z-10 px-6 pb-32 md:px-12">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="mx-auto max-w-xl">
          <GlassPanel className="p-8 text-center">
            <span className="relative z-10 mb-2 flex items-center justify-center gap-2 text-xs uppercase tracking-widest opacity-70">
              <Ruler size={14} strokeWidth={1.5} /> Find Your Fit
            </span>
            <h2 className="relative z-10 mb-3 font-serif text-2xl font-medium">Size Guide</h2>
            <p className="relative z-10 mb-6 text-sm opacity-80">
              A second panel further down the page, over the same continuous ribbon --
              proof the background stays coherent across sections rather than resetting.
            </p>
            <span className="relative z-10 inline-block rounded-full border px-6 py-2 text-sm" style={{ borderColor: 'var(--glass-border)' }}>
              Your size is 6.5
            </span>
          </GlassPanel>
        </motion.div>
      </section>

      <footer className="relative z-10 px-6 pb-10 text-center text-xs uppercase tracking-widest opacity-50">
        Design-direction proof -- not wired into the live storefront yet
      </footer>
    </div>
  );
}
