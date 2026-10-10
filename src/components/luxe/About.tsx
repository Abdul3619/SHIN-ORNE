import { Gift, Gem, PenLine, Ruler } from 'lucide-react';
import { unsplashUrl } from '../../lib/catalogue';

const IMG = 'photo-1786840320404-4c1c26980075';
const PROMISES = [
  { icon: Gem, title: 'Hand-selected', text: 'Beads and stones are chosen one by one, so no two pieces are exactly alike.' },
  { icon: Ruler, title: 'Sized for you', text: 'Rings are sized to the finger you choose, not pulled from a shelf.' },
  { icon: PenLine, title: 'Engraved with your words', text: 'Add a name, a date or a promise inside the band.' },
  { icon: Gift, title: 'Ready to give', text: 'Every order arrives in a signature gift box.' },
];

export default function About() {
  return (
    <section id="about" className="lx-section" aria-labelledby="about-h">
      <div className="lx-wrap lx-about">
        <div className="lx-about-img">
          <img src={unsplashUrl(IMG, 900)} srcSet={[500, 900, 1300].map((w) => `${unsplashUrl(IMG, w)} ${w}w`).join(', ')} sizes="(min-width: 1020px) 50vw, 100vw" alt="A jeweller shaping a piece at the bench" loading="lazy" referrerPolicy="no-referrer" />
        </div>
        <div>
          <span className="lx-eyebrow">Our story</span>
          <h2 id="about-h" className="lx-h2">Crafting radiant <em>auras</em></h2>
          <p className="lx-lede" style={{ maxWidth: '52ch' }}>
            At <strong style={{ fontWeight: 500, color: 'var(--lx-fg)' }}>Shin Orne</strong> we believe jewelry is more than an accessory. It is an extension of your inner light. Created by the team at <strong style={{ fontWeight: 500, color: 'var(--lx-fg)' }}>Charm Aura</strong>, every piece is made to resonate with the person who will wear it.
          </p>
          <ul className="lx-promises">
            {PROMISES.map((p) => (
              <li key={p.title}>
                <p.icon size={26} strokeWidth={1.3} aria-hidden="true" />
                <div><b>{p.title}</b><span>{p.text}</span></div>
              </li>
            ))}
          </ul>
          <a href="/#shop-all" className="lx-link">Shop the collection</a>
        </div>
      </div>
    </section>
  );
}
