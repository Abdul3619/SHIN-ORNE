import { useState, type FormEvent } from 'react';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';

const EXPLORE_LINKS = [
  { label: 'All Products', href: '/#shop-all' },
  { label: 'Rings', href: '/#rings' },
  { label: 'Necklaces', href: '/#necklaces' },
  { label: 'Earrings', href: '/#earrings' },
  { label: 'Bracelets', href: '/#bracelets' },
  { label: 'Bridal & Engagement', href: '/#bridal' },
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
    setStatus({ type: 'success', text: 'Thank you for subscribing!' });
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
    <footer id="contact" className="bg-[#1a1a1a] text-white pt-24 pb-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand */}
          <div className="space-y-6">
            <a href="/" className="block">
              <span className="text-3xl font-serif font-bold tracking-wider text-white">
                SHIN ORNE
              </span>
              <span className="block text-[10px] font-sans tracking-[0.2em] text-gray-400 uppercase mt-1">
                by Charm Aura
              </span>
            </a>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs font-light">
              Crafting timeless elegance through exquisite beads and jewelry. Each piece tells a story of radiant sophistication.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-serif font-medium mb-8">Explore</h4>
            <ul className="space-y-4">
              {EXPLORE_LINKS.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-gray-300 hover:text-white text-sm transition-colors font-light tracking-wide">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-lg font-serif font-medium mb-8">Customer Care</h4>
            <ul className="space-y-4">
              {CARE_LINKS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-gray-300 hover:text-white text-sm transition-colors font-light tracking-wide">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-serif font-medium mb-8">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-6 font-light">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form className="space-y-4" onSubmit={handleSubscribe} noValidate>
              <div className="relative">
                <input
                  type="email"
                  autoComplete="email"
                  aria-label="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-white/40 transition-colors placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  disabled={submitting}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <Mail size={18} />
                </button>
              </div>
              <div className="flex items-start gap-2">
                <input type="checkbox" id="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 accent-white" />
                <label htmlFor="consent" className="text-xs text-gray-300 font-light">
                  I agree to the <Link to="/privacy" className="underline">privacy policy</Link> and <Link to="/terms" className="underline">terms</Link>.
                </label>
              </div>
              {status && (
                <p role={status.type === 'error' ? 'alert' : 'status'} className={`text-xs ${status.type === 'error' ? 'text-red-400' : 'text-gray-300'}`}>
                  {status.text}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400 font-light">
            &copy; {new Date().getFullYear()} Shin Orne by Charm Aura. All rights reserved. Reviews shown are sample content.
            <a href="/admin" className="ml-4 underline hover:text-white transition-colors">Admin Portal</a>
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <span className="text-xs text-gray-400 font-light">
              Built by Abdulwahab Abdullahi ·{' '}
              <a href="mailto:abdulwahababdullahi3619@gmail.com" className="hover:text-white transition-colors underline">Contact the developer</a>
            </span>
            <span className="text-xs text-gray-400 font-light">Currency: {currency}</span>
            <span className="text-xs text-gray-400 font-light">Language: English</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
