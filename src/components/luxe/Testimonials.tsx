import { Star } from 'lucide-react';

// Sample content, labelled as such on the page. Replace with real customer reviews when available.
const QUOTES = [
  { name: 'Aisha O.', text: "The craftsmanship is simply breathtaking. I've never received so many compliments on a necklace before. It adds such an elegant touch." },
  { name: 'Khadija S.', text: 'Shin Orne changed my view of beaded jewelry. I wore the Emerald set for Eid and everyone asked where I got it.' },
  { name: 'Zainab M.', text: 'Beautiful packaging. Opening the box felt like receiving a gift from a dear friend. The bracelet feels durable for everyday wear.' },
];

export default function Testimonials() {
  return (
    <section id="reviews" className="lx-section" aria-labelledby="rev-h">
      <div className="lx-wrap">
        <div className="lx-head lx-center">
          <span className="lx-eyebrow">What our clients say</span>
          <h2 id="rev-h" className="lx-h2">Extraordinary is <em>a feeling</em></h2>
          <p style={{ margin: 0 }}><span className="lx-ill">Sample reviews</span></p>
        </div>
        <div className="lx-quotes">
          {QUOTES.map((q) => (
            <figure key={q.name} className="lx-glass lx-quote" style={{ margin: 0 }}>
              <div className="lx-stars" role="img" aria-label="5 out of 5 stars">{[0, 1, 2, 3, 4].map((i) => (<Star key={i} size={16} fill="currentColor" strokeWidth={0} />))}</div>
              <blockquote style={{ margin: 0 }}><p>&ldquo;{q.text}&rdquo;</p></blockquote>
              <footer>
                <span className="lx-avatar" aria-hidden="true">{q.name.charAt(0)}</span>
                <div><b style={{ fontFamily: 'var(--lx-display)', fontWeight: 500, fontSize: '1.15rem', display: 'block', lineHeight: 1.1 }}>{q.name}</b><small style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--lx-muted)' }}>Sample review</small></div>
              </footer>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
