import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Product } from '../types';
import type { CartOptions } from '../context/CartContext';
import { ENGRAVING_MAX, RING_SIZES } from '../lib/catalogue';
import { useCurrency } from '../context/CurrencyContext';

// Ring size and engraving picker shown before a ring or bridal piece goes in the cart.
// UI only: the choices appear in the cart and at checkout but are not stored with the order yet.
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
  const selectRef = useRef<HTMLSelectElement>(null);
  const previousFocus = useRef<Element | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // Focus the size picker on open, close on Escape, and return focus to the button that opened the dialog.
  useEffect(() => {
    previousFocus.current = document.activeElement;
    selectRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      (previousFocus.current as HTMLElement | null)?.focus?.();
    };
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!ringSize) {
      setError('Please choose a ring size.');
      selectRef.current?.focus();
      return;
    }
    onAdd({ ringSize, engraving: engraving.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby="ring-options-title" className="relative bg-white w-full sm:max-w-md p-8 shadow-2xl">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-gray-500 hover:text-gray-900">
          <X size={22} aria-hidden="true" />
        </button>
        <h2 id="ring-options-title" className="text-2xl font-serif text-gray-900 mb-1">
          {product.name}
        </h2>
        <p className="text-gray-700 mb-6">{formatPrice(product.price)}</p>
        <form onSubmit={submit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="ring-size" className="block text-sm font-medium text-gray-900 mb-1">
              Ring size (UK)
            </label>
            <select
              id="ring-size"
              ref={selectRef}
              value={ringSize}
              onChange={(e) => { setRingSize(e.target.value); setError(''); }}
              aria-invalid={!!error}
              aria-describedby={error ? 'ring-size-error' : 'ring-size-help'}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:border-gray-900"
            >
              <option value="">Choose a size</option>
              {RING_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {error ? (
              <p id="ring-size-error" role="alert" className="text-sm text-red-700 mt-1">{error}</p>
            ) : (
              <p id="ring-size-help" className="text-xs text-gray-600 mt-1">
                Not sure? See our <a href="/size-guide" className="underline">size guide</a>.
              </p>
            )}
          </div>
          <div>
            <label htmlFor="engraving" className="block text-sm font-medium text-gray-900 mb-1">
              Engraving (optional)
            </label>
            <input
              id="engraving"
              value={engraving}
              maxLength={ENGRAVING_MAX}
              onChange={(e) => setEngraving(e.target.value)}
              placeholder="e.g. Forever · 12.06.26"
              aria-describedby="engraving-count"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gray-900"
            />
            <p id="engraving-count" className="text-xs text-gray-600 mt-1">
              {engraving.length}/{ENGRAVING_MAX} characters · engraved inside the band
            </p>
          </div>
          <button type="submit" className="press w-full bg-gray-900 text-white py-3 font-medium tracking-wide hover:bg-gray-800 transition-colors">
            Add to cart
          </button>
        </form>
      </div>
    </div>
  );
}
