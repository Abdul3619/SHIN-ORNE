// Checkout page. PAYMENT IS MOCKED: the card form and the Google Pay, Apple Pay and PayPal buttons are UI only.
// No payment provider is called and no card details leave the browser (they are never stored either). The order
// itself is still recorded through POST /api/orders, which prices every line on the server, so it appears in the
// admin dashboard as "Pending". To take real payments, replace mockAuthorise() with a provider integration
// (e.g. Stripe Payment Element, Paystack or Flutterwave) and confirm the payment on the server before saving.
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CreditCard, Lock, PackageCheck, Mail, Gem, Truck, Sparkles } from 'lucide-react';
import Shell from '../components/luxe/Shell';
import { useCart, type CartItem } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useLocalStorage } from '../lib/useLocalStorage';
import { EXPRESS_FEE_USD, FREE_EXPRESS_FROM_USD, responsiveImage } from '../lib/catalogue';

type Method = 'card' | 'googlepay' | 'applepay' | 'paypal';
type Step = 'details' | 'delivery' | 'payment';

const METHOD_LABEL: Record<Method, string> = { card: 'Card', googlepay: 'Google Pay', applepay: 'Apple Pay', paypal: 'PayPal' };
const STEPS: { key: Step; label: string }[] = [
  { key: 'details', label: 'Details' },
  { key: 'delivery', label: 'Delivery' },
  { key: 'payment', label: 'Payment' },
];

interface Details {
  name: string;
  email: string;
  address: string;
  city: string;
  country: string;
  delivery: 'standard' | 'express';
}

const EMPTY_DETAILS: Details = { name: '', email: '', address: '', city: '', country: 'Nigeria', delivery: 'standard' };

// Stand-in for a payment provider: waits briefly, then "approves".
const mockAuthorise = () => new Promise<void>((resolve) => setTimeout(resolve, 900));

const formatCardNumber = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

function Journey({ current, onJump }: { current: Step; onJump: (s: Step) => void }) {
  const idx = STEPS.findIndex((s) => s.key === current);
  return (
    <ol className="lx-journey" aria-label="Checkout progress" style={{ padding: 0 }}>
      <li className="done">
        <span className="lx-dot"><Check size={14} aria-hidden="true" /></span><span>Bag</span>
      </li>
      {STEPS.map((s, i) => (
        <li key={s.key} className={i < idx ? 'done' : i === idx ? 'cur' : ''} aria-current={i === idx ? 'step' : undefined}>
          {i < idx ? (
            <button type="button" className="lx-dot" onClick={() => onJump(s.key)} aria-label={`Back to ${s.label}`}><Check size={14} aria-hidden="true" /></button>
          ) : (
            <span className="lx-dot">{i + 1}</span>
          )}
          <span>{s.label}</span>
        </li>
      ))}
    </ol>
  );
}

function GiftBox() {
  return (
    <div className="lx-box" aria-hidden="true">
      <svg viewBox="0 0 150 150">
        <defs>
          <linearGradient id="gb-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffe4eb" /><stop offset="50%" stopColor="#eda0b5" /><stop offset="100%" stopColor="#a8566e" /></linearGradient>
        </defs>
        <g className="ring">
          <circle cx="75" cy="60" r="16" fill="none" stroke="url(#gb-gold)" strokeWidth="5" />
          <path d="M67 46 L75 34 L83 46 Z" fill="#e8f1ff" stroke="#fff" strokeWidth="1" />
        </g>
        <rect x="22" y="70" width="106" height="64" rx="6" fill="#1d0f1f" stroke="url(#gb-gold)" strokeWidth="2" />
        <rect x="68" y="70" width="14" height="64" fill="url(#gb-gold)" />
        <g className="lid">
          <rect x="16" y="52" width="118" height="22" rx="5" fill="#2a1430" stroke="url(#gb-gold)" strokeWidth="2" />
          <rect x="68" y="52" width="14" height="22" fill="url(#gb-gold)" />
        </g>
        <g className="spark" stroke="#fff0f5" strokeWidth="2" strokeLinecap="round"><path d="M110 24 v14 M103 31 h14" /></g>
        <g className="spark" stroke="#fff0f5" strokeWidth="2" strokeLinecap="round" style={{ animationDelay: '2s' }}><path d="M36 30 v10 M31 35 h10" /></g>
      </svg>
    </div>
  );
}

export default function Checkout() {
  const { cart, cartTotal, clearCart, hydrated } = useCart();
  const { formatPrice } = useCurrency();
  // Contact and delivery details are remembered on this device; card details never are.
  const [details, setDetails, clearDetails] = useLocalStorage<Details>('shinorne:checkout', EMPTY_DETAILS);
  const [step, setStep] = useState<Step>('details');
  const [method, setMethod] = useState<Method>('card');
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' });
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<Method | null>(null);
  const [placed, setPlaced] = useState<{ id: number; items: CartItem[]; total: number; shipping: number; method: Method; email: string; delivery: Details['delivery'] } | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    document.title = placed ? 'Order confirmed | Shin Orne' : 'Checkout | Shin Orne';
    if (placed) headingRef.current?.focus();
  }, [placed]);

  const set = (field: keyof Details) => (e: { target: { value: string } }) => setDetails((d) => ({ ...d, [field]: e.target.value }));
  const expressFree = cartTotal >= FREE_EXPRESS_FROM_USD;
  const shipping = details.delivery === 'express' && !expressFree ? EXPRESS_FEE_USD : 0;
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

  const next = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (step === 'details') {
      const problem = validateDetails();
      if (problem) return fail(problem);
      setStep('delivery');
    } else if (step === 'delivery') {
      setStep('payment');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pay = async (via: Method) => {
    setError('');
    const detailsError = validateDetails();
    if (detailsError) { setStep('details'); return fail(detailsError); }
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
          items: cart.map((item) => ({ id: item.product.id, quantity: item.quantity, ringSize: item.options?.ringSize, engraving: item.options?.engraving })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return fail(data.error || 'We could not place your order. Please try again.');
      setPlaced({ id: data.id, items: cart, total, shipping, method: via, email: details.email.trim(), delivery: details.delivery });
      setCard({ number: '', expiry: '', cvc: '' });
      clearCart();
      clearDetails();
      window.scrollTo({ top: 0 });
    } catch {
      fail('We could not reach the store. Please check your connection and try again.');
    } finally {
      setProcessing(null);
    }
  };

  const alert = error && (<p ref={errorRef} tabIndex={-1} role="alert" className="lx-alert">{error}</p>);

  return (
    <Shell solidHeader>
      <div className="lx-page">
        <div className="lx-wrap">
          <p className="lx-banner">
            <span className="lx-ill">Demo checkout</span>
            No payment is taken. Card, Google Pay, Apple Pay and PayPal are shown for demonstration only.
          </p>

          {placed ? (
            <section aria-labelledby="done-h" className="lx-glass lx-done">
              <GiftBox />
              <span className="lx-eyebrow">Order #{placed.id}</span>
              <h1 id="done-h" ref={headingRef} tabIndex={-1}>Thank you. Your order is in.</h1>
              <p className="lx-lede" style={{ margin: '0 auto' }}>Paid with {METHOD_LABEL[placed.method]} (demo). We will follow up at <strong style={{ color: 'var(--lx-fg)', fontWeight: 500 }}>{placed.email}</strong>.</p>
              <ol className="lx-timeline">
                <li className="now"><span className="dot"><Check size={15} aria-hidden="true" /></span><div><b>Order received</b><span>Your pieces are reserved.</span></div></li>
                <li><span className="dot"><Mail size={15} aria-hidden="true" /></span><div><b>We get in touch</b><span>The shop confirms details and any engraving by email.</span></div></li>
                <li><span className="dot"><Gem size={15} aria-hidden="true" /></span><div><b>Crafted and checked</b><span>Sized, engraved and inspected by hand.</span></div></li>
                <li><span className="dot"><Truck size={15} aria-hidden="true" /></span><div><b>On its way</b><span>{placed.delivery === 'express' ? 'Express delivery: 1–2 working days.' : 'Standard delivery: 5–7 working days.'}</span></div></li>
              </ol>
              <div className="lx-receipt">
                <ul className="lx-sumlist">
                  {placed.items.map((item) => (
                    <li key={item.key}>
                      <span className="im"><img {...responsiveImage(item.product.image, [124, 248])} sizes="62px" alt="" referrerPolicy="no-referrer" /><span className="q">{item.quantity}</span></span>
                      <span><b>{item.product.name}</b>
                        {item.options?.ringSize && <small>Size {item.options.ringSize}</small>}
                        {item.options?.engraving && <small>“{item.options.engraving}”</small>}
                      </span>
                      <span>{formatPrice(item.product.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="lx-dl">
                  <div><dt>Delivery</dt><dd>{placed.shipping ? formatPrice(placed.shipping) : 'Free'}</dd></div>
                  <div className="grand"><dt>Total</dt><dd>{formatPrice(placed.total)}</dd></div>
                </dl>
              </div>
              <div className="lx-nav-row" style={{ justifyContent: 'center' }}>
                <Link to="/" className="lx-btn lx-btn--solid">Continue shopping</Link>
              </div>
            </section>
          ) : !hydrated ? (
            <div className="lx-co" aria-hidden="true">
              <div className="lx-skel" style={{ height: 520, borderRadius: 22 }} />
              <div className="lx-skel" style={{ height: 320, borderRadius: 22 }} />
            </div>
          ) : cart.length === 0 ? (
            <section className="lx-glass lx-done" aria-labelledby="empty-h">
              <Sparkles size={44} strokeWidth={1.2} style={{ color: 'var(--lx-gold)', margin: '0 auto 18px' }} aria-hidden="true" />
              <h1 id="empty-h">Your bag is empty</h1>
              <p className="lx-lede" style={{ margin: '0 auto 26px' }}>Add a piece or two, then come back to check out.</p>
              <Link to="/#shop" className="lx-btn lx-btn--solid">Browse the collection</Link>
            </section>
          ) : (
            <div className="lx-co">
              <div>
                <h1>Checkout</h1>
                <p className="lx-lede" style={{ margin: 0 }}>Three quick steps to make it yours.</p>
                <Journey current={step} onJump={(s) => { setError(''); setStep(s); }} />
                {alert}

                {step === 'details' && (
                  <form onSubmit={next} noValidate className="lx-glass lx-form" aria-labelledby="co-details">
                    <h2 id="co-details">Where should we send it?</h2>
                    <div className="lx-two">
                      <div className="lx-field"><label htmlFor="co-name">Full name</label><input id="co-name" autoComplete="name" required value={details.name} onChange={set('name')} /></div>
                      <div className="lx-field"><label htmlFor="co-email">Email</label><input id="co-email" type="email" autoComplete="email" required value={details.email} onChange={set('email')} /></div>
                    </div>
                    <div className="lx-field"><label htmlFor="co-address">Address</label><input id="co-address" autoComplete="street-address" required value={details.address} onChange={set('address')} /></div>
                    <div className="lx-two">
                      <div className="lx-field"><label htmlFor="co-city">City</label><input id="co-city" autoComplete="address-level2" required value={details.city} onChange={set('city')} /></div>
                      <div className="lx-field"><label htmlFor="co-country">Country</label>
                        <select id="co-country" autoComplete="country-name" value={details.country} onChange={set('country')}>
                          {['Nigeria', 'Ghana', 'United Kingdom', 'United States', 'Other'].map((c) => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="lx-nav-row">
                      <Link to="/#shop" className="lx-mini"><ArrowLeft size={13} aria-hidden="true" /> Keep shopping</Link>
                      <button type="submit" className="lx-btn lx-btn--solid">Continue to delivery <ArrowRight size={15} aria-hidden="true" /></button>
                    </div>
                  </form>
                )}

                {step === 'delivery' && (
                  <form onSubmit={next} className="lx-glass lx-form" aria-labelledby="co-delivery">
                    <h2 id="co-delivery">How fast do you need it?</h2>
                    <div role="radiogroup" aria-label="Delivery speed" className="lx-radio-grid">
                      {([
                        ['standard', 'Standard delivery', '5–7 working days', 'Free'],
                        ['express', 'Express delivery', '1–2 working days', expressFree ? 'Free on your bag' : formatPrice(EXPRESS_FEE_USD)],
                      ] as const).map(([value, name, time, price]) => (
                        <label key={value} className={`lx-radio${details.delivery === value ? ' is-on' : ''}`}>
                          <input type="radio" name="delivery" value={value} checked={details.delivery === value} onChange={set('delivery')} />
                          <span><b>{name}</b><small>{time}</small></span>
                          <span>{price}</span>
                        </label>
                      ))}
                    </div>
                    {!expressFree && <p className="lx-hint">Add {formatPrice(FREE_EXPRESS_FROM_USD - cartTotal)} more to your bag for free express delivery.</p>}
                    <p className="lx-hint">Delivering to {details.address || 'your address'}, {details.city || 'your city'}, {details.country}.</p>
                    <div className="lx-nav-row">
                      <button type="button" className="lx-mini" onClick={() => setStep('details')}><ArrowLeft size={13} aria-hidden="true" /> Details</button>
                      <button type="submit" className="lx-btn lx-btn--solid">Continue to payment <ArrowRight size={15} aria-hidden="true" /></button>
                    </div>
                  </form>
                )}

                {step === 'payment' && (
                  <form onSubmit={(e) => { e.preventDefault(); pay(method); }} noValidate className="lx-glass lx-form" aria-labelledby="co-pay">
                    <h2 id="co-pay">Payment</h2>
                    <div className="lx-wallet">
                      <button type="button" className="apple" disabled={!!processing} onClick={() => pay('applepay')} aria-label="Pay with Apple Pay (demo)"> Pay</button>
                      <button type="button" className="google" disabled={!!processing} onClick={() => pay('googlepay')} aria-label="Pay with Google Pay (demo)"><span style={{ color: '#4285F4' }}>G</span> Pay</button>
                      <button type="button" className="paypal" disabled={!!processing} onClick={() => pay('paypal')} aria-label="Pay with PayPal (demo)">PayPal</button>
                    </div>
                    <div className="lx-or">or pay by card</div>
                    <div role="radiogroup" aria-label="Payment method" className="lx-pay-grid">
                      {(Object.keys(METHOD_LABEL) as Method[]).map((m) => (
                        <label key={m} className={`lx-pay${method === m ? ' is-on' : ''}`}>
                          <input type="radio" name="method" value={m} checked={method === m} onChange={() => setMethod(m)} />
                          {METHOD_LABEL[m]}
                        </label>
                      ))}
                    </div>
                    {method === 'card' ? (
                      <>
                        <div className="lx-field">
                          <label htmlFor="cc-number">Card number</label>
                          <div style={{ position: 'relative' }}>
                            <input id="cc-number" inputMode="numeric" autoComplete="off" placeholder="4242 4242 4242 4242" value={card.number} onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })} style={{ paddingRight: 44 }} />
                            <CreditCard size={18} aria-hidden="true" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--lx-muted)' }} />
                          </div>
                        </div>
                        <div className="lx-two">
                          <div className="lx-field"><label htmlFor="cc-exp">Expiry (MM/YY)</label><input id="cc-exp" inputMode="numeric" autoComplete="off" placeholder="12/28" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })} /></div>
                          <div className="lx-field"><label htmlFor="cc-cvc">Security code</label><input id="cc-cvc" inputMode="numeric" autoComplete="off" placeholder="123" maxLength={4} value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '') })} /></div>
                        </div>
                        <p className="lx-hint">Demo only: any 16 digits work, and nothing is charged or saved.</p>
                      </>
                    ) : (
                      <p className="lx-hint">You will confirm the payment with {METHOD_LABEL[method]} (demo, no redirect).</p>
                    )}
                    <div className="lx-nav-row">
                      <button type="button" className="lx-mini" onClick={() => setStep('delivery')}><ArrowLeft size={13} aria-hidden="true" /> Delivery</button>
                      <button type="submit" disabled={!!processing} className="lx-btn lx-btn--solid">
                        <Lock size={14} aria-hidden="true" />
                        {processing ? <span role="status">Processing {METHOD_LABEL[processing]}…</span> : `Pay ${formatPrice(total)}`}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <aside className="lx-glass lx-sumcard" aria-labelledby="summary-h">
                <h2 id="summary-h">Your selection</h2>
                <ul className="lx-sumlist">
                  {cart.map((item) => (
                    <li key={item.key}>
                      <span className="im"><img {...responsiveImage(item.product.image, [124, 248])} sizes="62px" alt="" referrerPolicy="no-referrer" /><span className="q">{item.quantity}</span></span>
                      <span><b>{item.product.name}</b>
                        {item.options?.ringSize && <small>Size {item.options.ringSize}</small>}
                        {item.options?.engraving && <small>“{item.options.engraving}”</small>}
                      </span>
                      <span>{formatPrice(item.product.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="lx-dl">
                  <div><dt>Subtotal</dt><dd>{formatPrice(cartTotal)}</dd></div>
                  <div><dt>Delivery</dt><dd>{shipping ? formatPrice(shipping) : 'Free'}</dd></div>
                  <div className="grand"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
                </dl>
                <p className="lx-secure"><PackageCheck size={15} aria-hidden="true" /> Gift-ready packaging · 30-day returns on unworn pieces</p>
              </aside>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
