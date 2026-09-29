// Checkout page. PAYMENT IS MOCKED: the card form and the Google Pay, Apple Pay and PayPal buttons are UI only.
// No payment provider is called and no card details leave the browser (they are never stored either). The order
// itself is still recorded through POST /api/orders, which prices every line on the server, so it appears in the
// admin dashboard as "Pending". To take real payments, replace mockAuthorise() with a provider integration
// (e.g. Stripe Payment Element, Paystack or Flutterwave) and confirm the payment on the server before saving.
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Lock, CreditCard, CheckCircle2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import IllustrativeBadge from '../components/IllustrativeBadge';
import { useCart, type CartItem } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useLocalStorage } from '../lib/useLocalStorage';
import { responsiveImage } from '../lib/catalogue';

type Method = 'card' | 'googlepay' | 'applepay' | 'paypal';

const METHOD_LABEL: Record<Method, string> = {
  card: 'Card',
  googlepay: 'Google Pay',
  applepay: 'Apple Pay',
  paypal: 'PayPal',
};

interface Details {
  name: string;
  email: string;
  address: string;
  city: string;
  country: string;
  delivery: 'standard' | 'express';
}

const EMPTY_DETAILS: Details = { name: '', email: '', address: '', city: '', country: 'Nigeria', delivery: 'standard' };
const EXPRESS_FEE_USD = 15;

// Stand-in for a payment provider: waits briefly, then "approves".
const mockAuthorise = () => new Promise<void>((resolve) => setTimeout(resolve, 900));

const formatCardNumber = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

function WalletButton({ method, onClick, disabled }: { method: Exclude<Method, 'card'>; onClick: () => void; disabled: boolean }) {
  const styles: Record<Exclude<Method, 'card'>, string> = {
    applepay: 'bg-black text-white hover:bg-gray-800',
    googlepay: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50',
    paypal: 'bg-[#FFC439] text-[#111] hover:brightness-95',
  };
  const text: Record<Exclude<Method, 'card'>, React.ReactNode> = {
    applepay: <> Pay</>,
    googlepay: <><span className="font-bold"><span className="text-[#4285F4]">G</span></span> Pay</>,
    paypal: <><span className="font-bold italic text-[#003087]">Pay</span><span className="font-bold italic text-[#0070E0]">Pal</span></>,
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Pay with ${METHOD_LABEL[method]} (demo)`}
      className={`press h-12 rounded-md text-lg font-medium flex items-center justify-center gap-1 transition-colors disabled:opacity-60 ${styles[method]}`}
    >
      {text[method]}
    </button>
  );
}

export default function Checkout() {
  const { cart, cartTotal, clearCart, hydrated } = useCart();
  const { formatPrice } = useCurrency();
  // Contact and delivery details are remembered on this device; card details never are.
  const [details, setDetails, clearDetails] = useLocalStorage<Details>('shinorne:checkout', EMPTY_DETAILS);
  const [method, setMethod] = useState<Method>('card');
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', nameOnCard: '' });
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<Method | null>(null);
  const [placed, setPlaced] = useState<{ id: number; items: CartItem[]; total: number; method: Method; email: string } | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    document.title = placed ? 'Order confirmed | Shin Orne' : 'Checkout | Shin Orne';
    if (placed) doneRef.current?.focus();
  }, [placed]);

  const set = (field: keyof Details) => (e: { target: { value: string } }) => setDetails((d) => ({ ...d, [field]: e.target.value }));
  const shipping = details.delivery === 'express' ? EXPRESS_FEE_USD : 0;
  const total = cartTotal + shipping;

  const fail = (message: string) => {
    setError(message);
    requestAnimationFrame(() => errorRef.current?.focus());
  };

  const validateDetails = () => {
    if (!details.name.trim()) return 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim())) return 'Please enter a valid email address.';
    if (!details.address.trim() || !details.city.trim()) return 'Please enter your delivery address and city.';
    return '';
  };

  const pay = async (via: Method) => {
    setError('');
    const detailsError = validateDetails();
    if (detailsError) return fail(detailsError);
    if (via === 'card') {
      if (card.number.replace(/\s/g, '').length < 16) return fail('Please enter the 16-digit card number.');
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) return fail('Please enter the expiry date as MM/YY.');
      if (!/^\d{3,4}$/.test(card.cvc)) return fail('Please enter the 3 or 4 digit security code.');
    }
    setProcessing(via);
    try {
      await mockAuthorise();
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: details.name.trim(),
          customer_email: details.email.trim(),
          items: cart.map((item) => ({ id: item.product.id, quantity: item.quantity })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return fail(data.error || 'We could not place your order. Please try again.');
      setPlaced({ id: data.id, items: cart, total, method: via, email: details.email.trim() });
      setCard({ number: '', expiry: '', cvc: '', nameOnCard: '' });
      clearCart();
      clearDetails();
    } catch {
      fail('We could not reach the store. Please check your connection and try again.');
    } finally {
      setProcessing(null);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    pay(method);
  };

  const field = 'w-full border border-gray-300 rounded px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-gray-900 focus-visible:ring-2 focus-visible:ring-gray-900/20';
  const label = 'block text-sm font-medium text-gray-900 mb-1';

  return (
    <div className="font-sans text-gray-900 antialiased bg-[#F9F7F2] min-h-screen">
      <Header solid />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <p className="mb-8 border border-amber-300 bg-amber-50 text-amber-950 px-4 py-3 text-sm flex flex-wrap items-center gap-2">
            <IllustrativeBadge label="Demo checkout" />
            No payment is taken. Card, Google Pay, Apple Pay and PayPal are shown for demonstration only.
          </p>

          {placed ? (
            <section aria-labelledby="done-heading" className="bg-white p-8 md:p-12 max-w-2xl mx-auto text-center shadow-sm">
              <CheckCircle2 size={48} className="mx-auto text-emerald-600 mb-4" aria-hidden="true" />
              <h1 id="done-heading" ref={doneRef} tabIndex={-1} className="text-3xl md:text-4xl font-serif mb-3 focus:outline-none">
                Thank you, your order is confirmed
              </h1>
              <p className="text-gray-700 mb-8">
                Order #{placed.id} · paid with {METHOD_LABEL[placed.method]} (demo) · confirmation to {placed.email}
              </p>
              <ul className="text-left divide-y divide-gray-100 mb-6">
                {placed.items.map((item) => (
                  <li key={item.key} className="py-3 flex justify-between gap-4 text-sm">
                    <span>
                      {item.quantity} × {item.product.name}
                      {item.options?.ringSize && <span className="text-gray-600"> · size {item.options.ringSize}</span>}
                      {item.options?.engraving && <span className="text-gray-600"> · “{item.options.engraving}”</span>}
                    </span>
                    <span>{formatPrice(item.product.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <p className="text-lg font-serif mb-8">Total {formatPrice(placed.total)}</p>
              <Link to="/" className="press inline-block bg-gray-900 text-white px-8 py-3 hover:bg-gray-800 transition-colors">
                Continue shopping
              </Link>
            </section>
          ) : !hydrated ? (
            <div aria-hidden="true" className="grid lg:grid-cols-[1fr_380px] gap-10">
              <div className="skeleton h-[520px]" />
              <div className="skeleton h-[320px]" />
            </div>
          ) : cart.length === 0 ? (
            <section className="bg-white p-12 text-center shadow-sm max-w-xl mx-auto">
              <h1 className="text-3xl font-serif mb-4">Your cart is empty</h1>
              <p className="text-gray-700 mb-8">Add a piece or two before checking out.</p>
              <Link to="/" className="press inline-block bg-gray-900 text-white px-8 py-3 hover:bg-gray-800 transition-colors">
                Browse the collection
              </Link>
            </section>
          ) : (
            <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
              <form onSubmit={onSubmit} noValidate className="bg-white p-6 md:p-10 shadow-sm space-y-10">
                <h1 className="text-3xl md:text-4xl font-serif">Checkout</h1>

                {error && (
                  <p ref={errorRef} tabIndex={-1} role="alert" className="border border-red-300 bg-red-50 text-red-800 px-4 py-3 text-sm focus:outline-none">
                    {error}
                  </p>
                )}

                <section aria-labelledby="express-heading">
                  <h2 id="express-heading" className="text-sm uppercase tracking-widest text-gray-700 mb-3">Express checkout</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(['applepay', 'googlepay', 'paypal'] as const).map((m) => (
                      <WalletButton key={m} method={m} onClick={() => pay(m)} disabled={!!processing} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Wallet buttons use the contact and delivery details below.</p>
                </section>

                <fieldset className="space-y-4">
                  <legend className="text-lg font-serif mb-2">Contact</legend>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="co-name" className={label}>Full name</label>
                      <input id="co-name" autoComplete="name" required value={details.name} onChange={set('name')} className={field} />
                    </div>
                    <div>
                      <label htmlFor="co-email" className={label}>Email</label>
                      <input id="co-email" type="email" autoComplete="email" required value={details.email} onChange={set('email')} className={field} />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="space-y-4">
                  <legend className="text-lg font-serif mb-2">Delivery</legend>
                  <div>
                    <label htmlFor="co-address" className={label}>Address</label>
                    <input id="co-address" autoComplete="street-address" required value={details.address} onChange={set('address')} className={field} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="co-city" className={label}>City</label>
                      <input id="co-city" autoComplete="address-level2" required value={details.city} onChange={set('city')} className={field} />
                    </div>
                    <div>
                      <label htmlFor="co-country" className={label}>Country</label>
                      <select id="co-country" autoComplete="country-name" value={details.country} onChange={set('country')} className={field}>
                        {['Nigeria', 'Ghana', 'United Kingdom', 'United States', 'Other'].map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div role="radiogroup" aria-label="Delivery speed" className="grid sm:grid-cols-2 gap-3">
                    {([['standard', 'Standard (5–7 days)', 'Free'], ['express', 'Express (1–2 days)', formatPrice(EXPRESS_FEE_USD)]] as const).map(([value, name, price]) => (
                      <label key={value} className={`flex items-center justify-between gap-3 border rounded px-4 py-3 cursor-pointer ${details.delivery === value ? 'border-gray-900 bg-gray-50' : 'border-gray-300'}`}>
                        <span className="flex items-center gap-3">
                          <input type="radio" name="delivery" value={value} checked={details.delivery === value} onChange={set('delivery')} className="accent-gray-900" />
                          <span className="text-sm">{name}</span>
                        </span>
                        <span className="text-sm text-gray-700">{price}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="space-y-4">
                  <legend className="text-lg font-serif mb-2">Payment</legend>
                  <div role="radiogroup" aria-label="Payment method" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(Object.keys(METHOD_LABEL) as Method[]).map((m) => (
                      <label key={m} className={`text-center border rounded px-3 py-2 text-sm cursor-pointer ${method === m ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 hover:border-gray-500'}`}>
                        <input type="radio" name="method" value={m} checked={method === m} onChange={() => setMethod(m)} className="sr-only" />
                        {METHOD_LABEL[m]}
                      </label>
                    ))}
                  </div>

                  {method === 'card' ? (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="cc-number" className={label}>Card number</label>
                        <div className="relative">
                          <input id="cc-number" inputMode="numeric" autoComplete="off" placeholder="4242 4242 4242 4242" value={card.number} onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })} className={`${field} pr-10`} />
                          <CreditCard size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="cc-exp" className={label}>Expiry (MM/YY)</label>
                          <input id="cc-exp" inputMode="numeric" autoComplete="off" placeholder="12/28" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })} className={field} />
                        </div>
                        <div>
                          <label htmlFor="cc-cvc" className={label}>Security code</label>
                          <input id="cc-cvc" inputMode="numeric" autoComplete="off" placeholder="123" maxLength={4} value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '') })} className={field} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">Demo only: any 16 digits work, and nothing is charged or saved.</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700">You will confirm the payment with {METHOD_LABEL[method]} (demo, no redirect).</p>
                  )}
                </fieldset>

                <button type="submit" disabled={!!processing} className="press w-full bg-gray-900 text-white py-4 rounded font-medium hover:bg-gray-800 transition-colors tracking-wide flex items-center justify-center gap-2 disabled:opacity-70">
                  <Lock size={16} aria-hidden="true" />
                  {processing ? <span role="status">Processing {METHOD_LABEL[processing]} payment…</span> : `Pay ${formatPrice(total)}`}
                </button>
              </form>

              <aside aria-labelledby="summary-heading" className="bg-white p-6 shadow-sm lg:sticky lg:top-28">
                <h2 id="summary-heading" className="text-xl font-serif mb-6">Order summary</h2>
                <ul className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <li key={item.key} className="flex gap-3 text-sm">
                      <img {...responsiveImage(item.product.image, [160, 320])} sizes="64px" alt="" className="w-16 h-20 object-cover rounded bg-gray-100" referrerPolicy="no-referrer" />
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-gray-600">Qty {item.quantity}{item.options?.ringSize ? ` · size ${item.options.ringSize}` : ''}</p>
                        {item.options?.engraving && <p className="text-gray-600">“{item.options.engraving}”</p>}
                      </div>
                      <span>{formatPrice(item.product.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="text-sm space-y-2 border-t border-gray-100 pt-4">
                  <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(cartTotal)}</dd></div>
                  <div className="flex justify-between"><dt>Delivery</dt><dd>{shipping ? formatPrice(shipping) : 'Free'}</dd></div>
                  <div className="flex justify-between text-base font-serif font-bold pt-2"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
                </dl>
                <p className="text-xs text-gray-600 mt-4">Ring sizes and engravings are shown for demonstration and are not yet saved with the order.</p>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
