import { ArrowUpRight } from 'lucide-react';
import { unsplashUrl } from '../../lib/catalogue';

const LOOKS = [
  { image: 'photo-1769038931632-d249b6d7ebfe', title: 'Hands, held', href: '/#bridal' },
  { image: 'photo-1750891892189-cae53172de09', title: 'Stacked in gold', href: '/#rings' },
  { image: 'photo-1620656798579-1984d9e87df7', title: 'Everyday radiance', href: '/#necklaces' },
  { image: 'photo-1788495545073-51161449ca9e', title: 'For the aisle', href: '/#bridal' },
  { image: 'photo-1701777892740-88419a701472', title: 'Statement earrings', href: '/#earrings' },
  { image: 'photo-1573446238824-c28afa0cd312', title: 'Beads, layered', href: '/#bracelets' },
];

export default function Stories() {
  return (
    <section id="stories" className="lx-section" aria-labelledby="stories-h">
      <div className="lx-wrap">
        <div className="lx-head lx-split" style={{ alignItems: 'end' }}>
          <div>
            <span className="lx-eyebrow">Styled inspiration</span>
            <h2 id="stories-h" className="lx-h2">Real moments, <em>worn well</em></h2>
          </div>
          <p className="lx-lede" style={{ margin: 0 }}>Ideas for how to wear and give Shin Orne. Tap any story to shop the collection behind it.</p>
        </div>
        <div className="lx-mosaic">
          {LOOKS.map((l) => (
            <a key={l.title} href={l.href} aria-label={`${l.title}: shop this look`}>
              <img src={unsplashUrl(l.image, 700)} srcSet={[400, 700, 1000].map((w) => `${unsplashUrl(l.image, w)} ${w}w`).join(', ')} sizes="(min-width: 900px) 25vw, 50vw" alt="" loading="lazy" referrerPolicy="no-referrer" />
              <span>{l.title}<ArrowUpRight size={18} aria-hidden="true" /></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
