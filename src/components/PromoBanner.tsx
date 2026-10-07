import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { unsplashUrl } from '../lib/catalogue';

interface PromoBannerProps {
  image: string;
  eyebrow: string;
  heading: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  /** 'light' puts dark text over a lighter image area; 'dark' (default) puts white text over a dark overlay. */
  theme?: 'light' | 'dark';
  align?: 'left' | 'center';
}

export default function PromoBanner({ image, eyebrow, heading, subtext, ctaLabel, ctaHref, theme = 'dark', align = 'left' }: PromoBannerProps) {
  const isInternal = ctaHref.startsWith('/') && !ctaHref.startsWith('/#');
  const textTone = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const subTone = theme === 'dark' ? 'text-white/85' : 'text-gray-700';
  const ctaTone =
    theme === 'dark'
      ? 'border-white text-white hover:bg-white hover:text-gray-900'
      : 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white';

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[70vh] min-h-[420px] max-h-[640px] w-full">
        <img
          src={unsplashUrl(image, 1600)}
          srcSet={[768, 1200, 1600, 2000].map((w) => `${unsplashUrl(image, w)} ${w}w`).join(', ')}
          sizes="100vw"
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-r from-black/60 via-black/30 to-transparent' : 'bg-gradient-to-r from-white/80 via-white/40 to-transparent'}`} />

        <div className={`relative z-10 h-full container mx-auto px-6 flex flex-col justify-center ${align === 'center' ? 'items-center text-center' : 'items-start'}`}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-lg"
          >
            <span className={`block text-sm font-medium tracking-[0.2em] uppercase mb-4 ${subTone}`}>{eyebrow}</span>
            <h2 className={`text-4xl md:text-6xl font-serif font-medium leading-tight mb-6 ${textTone}`}>{heading}</h2>
            <p className={`text-base md:text-lg mb-10 font-light leading-relaxed ${subTone}`}>{subtext}</p>
            {isInternal ? (
              <Link to={ctaHref} className={`press inline-block border px-8 py-4 text-sm font-medium uppercase tracking-widest transition-colors ${ctaTone}`}>
                {ctaLabel}
              </Link>
            ) : (
              <a href={ctaHref} className={`press inline-block border px-8 py-4 text-sm font-medium uppercase tracking-widest transition-colors ${ctaTone}`}>
                {ctaLabel}
              </a>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
