import { ArrowRight } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useShop } from '../../context/ShopContext';
import { unsplashUrl } from '../../lib/catalogue';

const BUDGETS = [
  { label: 'Under', amount: 100, min: null, max: 100, text: 'Beaded bracelets and everyday studs' },
  { label: 'Up to', amount: 250, min: 100, max: 250, text: 'Pendants, pearls and statement rings' },
  { label: 'Over', amount: 250, min: 250, max: null, text: 'Heirloom-minded pieces and sets' },
] as const;
const IMG = 'photo-1780744871777-fec13139d281';

export default function Gifting() {
  const { formatPrice } = useCurrency();
  const { browse } = useShop();
  return (
    <section id="gifting" className="lx-section" aria-labelledby="gift-h">
      <div className="lx-wrap">
        <div className="lx-gift">
          <img src={unsplashUrl(IMG, 1600)} srcSet={[800, 1200, 1800].map((w) => `${unsplashUrl(IMG, w)} ${w}w`).join(', ')} sizes="100vw" alt="" loading="lazy" referrerPolicy="no-referrer" />
          <div>
            <span className="lx-eyebrow">Gifting</span>
            <h2 id="gift-h" className="lx-h2">Give a piece <em style={{ color: '#ff9fba' }}>worth keeping</em></h2>
            <p className="lx-lede">Every order arrives in a signature gift box, ready to hand over just as it comes. Start with what you would like to spend.</p>
            <a href="/size-guide" className="lx-link" style={{ color: '#fff0f5', borderColor: '#ff9fba' }}>Not sure of the size? Read the size guide</a>
          </div>
          <div className="lx-budget">
            {BUDGETS.map((b) => (
              <button key={b.text} type="button" onClick={() => browse({ min: b.min, max: b.max, sort: 'low' })} aria-label={`${b.label} ${formatPrice(b.amount)}: ${b.text}`}>
                <span><b>{b.label} {formatPrice(b.amount)}</b><small>{b.text}</small></span>
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
