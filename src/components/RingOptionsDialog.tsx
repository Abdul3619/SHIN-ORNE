import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Product } from '../types';
import type { CartOptions } from '../context/CartContext';
import { ENGRAVING_MAX, RING_SIZES } from '../lib/catalogue';
import { useCurrency } from '../context/CurrencyContext';
import RingPreview from './luxe/RingPreview';

// Ring size and engraving picker shown before a ring or bridal piece goes in the bag.
// Both choices are sent with the order and shown to the shop in the admin dashboard.
export default function RingOptionsDialog({
  product,
  onClose,
  onAdd,
}: {
  product: Product;
  onClose: () => void;
  onAdd: (options: CartOptions) => void;
}) {
  const { formatPrice } = useCurrency();
  const [ringSize, setRingSize] = useState('');
  const [engraving, setEngraving] = useState('');
  const [error, setError] = useState('');
  const firstSize = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<Element | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // Focus the size picker on open, close on Escape, and return focus to the button that opened the dialog.
  useEffect(() => {
    previousFocus.current = document.activeElement;
    firstSize.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      (previousFocus.current as HTMLElement | null)?.focus?.();
    };
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!ringSize) {
      setError('Please choose a ring size.');
      firstSize.current?.focus();
      return;
    }
    onAdd({ ringSize, engraving: engraving.trim() || undefined });
  };

  return (
    <div className="lx-modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="ring-options-title" className="lx-glass lx-modal-box">
        <button type="button" onClick={onClose} aria-label="Close" className="lx-close"><X size={18} aria-hidden="true" /></button>
        <span className="lx-eyebrow">Made for you</span>
        <h2 id="ring-options-title">{product.name}</h2>
        <p className="lx-hint" style={{ marginTop: 0, marginBottom: 6 }}>{formatPrice(product.price)}</p>
        <div style={{ width: 170, margin: '0 auto 8px' }}><RingPreview engraving={engraving} /></div>
        <form onSubmit={submit} noValidate>
          <div className="lx-field">
            <span className="lx-label" id="size-label">Ring size (UK)</span>
            <div className="lx-sizes" role="radiogroup" aria-labelledby="size-label">
              {RING_SIZES.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={ringSize === s}
                  ref={i === 0 ? firstSize : undefined}
                  className={`lx-size${ringSize === s ? ' is-on' : ''}`}
                  onClick={() => { setRingSize(s); setError(''); }}
                >
                  {s}
                </button>
              ))}
            </div>
            {error ? <p role="alert" className="lx-err">{error}</p> : <p className="lx-hint">Not sure? Try the <a href="/#craft" onClick={onClose} style={{ textDecoration: 'underline' }}>ring sizer</a> or see the <a href="/size-guide" style={{ textDecoration: 'underline' }}>size guide</a>.</p>}
          </div>
          <div className="lx-field">
            <label htmlFor="engraving">Engraving (optional)</label>
            <input id="engraving" value={engraving} maxLength={ENGRAVING_MAX} onChange={(e) => setEngraving(e.target.value)} placeholder="e.g. Forever · 12.06.26" aria-describedby="engraving-count" />
            <p id="engraving-count" className="lx-hint">{engraving.length}/{ENGRAVING_MAX} characters · engraved inside the band</p>
          </div>
          <button type="submit" className="lx-btn lx-btn--solid lx-btn--block">Add to bag</button>
        </form>
      </div>
    </div>
  );
}
