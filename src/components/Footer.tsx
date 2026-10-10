import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';

const EXPLORE_LINKS = [
  { label: 'All pieces', href: '/#shop-all' },
  { label: 'Rings', href: '/#rings' },
  { label: 'Necklaces', href: '/#necklaces' },
  { label: 'Earrings', href: '/#earrings' },
  { label: 'Bracelets', href: '/#bracelets' },
  { label: 'Bridal & Engagement', href: '/#bridal' },
  { label: 'Ring atelier', href: '/#atelier' },
];

// Policy pages are generic templates pending legal review (see src/pages/InfoPage.tsx).
const CARE_LINKS = [
  { label: 'Shipping & Returns', to: '/shipping-returns' },
  { label: 'Size Guide', to: '/size-guide' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
];

export default function Footer() {
  const { currency } = useCurrency();
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    if (!consent) {
      setStatus({ type: 'error', text: 'Please agree to the privacy policy and terms.' });
      return;
    }
    // Optimistic: thank the visitor straight away; if the request fails, restore the address and show an error.
    const submitted = email.trim();
    setStatus({ type: 'success', text: 'Welcome to the world of Shin Orne. Thank you for subscribing.' });
    setEmail('');
    setConsent(false);
    setSubmitting(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: submitted }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'We could not subscribe you. Please try again.');
    } catch (error) {
      setEmail(submitted);
      setConsent(true);
      setStatus({ type: 'error', text: error instanceof Error && error.message !== 'Failed to fetch' ? error.message : 'We could not reach the store. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer id="contact" className="lx-footer">
      <div className="lx-wrap">
        <div className="lx-footer-top">
          <div>
            <Link to="/" className="lx-logo" style={{ marginBottom: 18 }} aria-label="Shin Orne by Charm Aura, home">
              <b>SHIN ORNE</b>
              <span>by Charm Aura</span>
            </Link>
            <p>Handcrafted beads and fine-finish jewelry, sized and engraved for the person who will wear it.</p>
            <span className="lx-tagline">A legacy of love, crafted forever</span>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              {EXPLORE_LINKS.map((item) => (<li key={item.label}><a href={item.href}>{item.label}</a></li>))}
            </ul>
          </div>
          <div>
            <h4>Customer care</h4>
            <ul>
              {CARE_LINKS.map((item) => (<li key={item.to}><Link to={item.to}>{item.label}</Link></li>))}
            </ul>
          </div>
          <div>
            <h4>Join our world</h4>
            <p>New collections and exclusive offers, delivered quietly. No spam.</p>
            <form onSubmit={handleSubscribe} noValidate>
              <div className="lx-news">
                <input type="email" autoComplete="email" aria-label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" />
                <button type="submit" aria-label="Subscribe" disabled={submitting}><ArrowRight size={18} aria-hidden="true" /></button>
              </div>
              <label className="lx-check" htmlFor="consent">
                <input type="checkbox" id="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>I agree to the <Link to="/privacy">privacy policy</Link> and <Link to="/terms">terms</Link>.</span>
              </label>
              {status && (<p role={status.type === 'error' ? 'alert' : 'status'} className={`lx-msg ${status.type === 'error' ? 'err' : 'ok'}`}>{status.text}</p>)}
            </form>
          </div>
        </div>
        <div className="lx-footer-bottom">
          <span>
            &copy; {new Date().getFullYear()} Shin Orne by Charm Aura. All rights reserved. Reviews shown are sample content.{' '}
            <a href="/admin">Admin portal</a>
          </span>
          <span>
            Built by Abdulwahab Abdullahi · <a href="mailto:abdulwahababdullahi3619@gmail.com">Contact the developer</a>
          </span>
          <span>Currency: {currency} · Language: English</span>
        </div>
      </div>
    </footer>
  );
}
