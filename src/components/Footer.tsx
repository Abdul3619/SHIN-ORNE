import { motion } from 'motion/react';
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white pt-24 pb-12">
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
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-serif font-medium mb-8">Explore</h4>
            <ul className="space-y-4">
              {['New Arrivals', 'Best Sellers', 'Necklaces', 'Bracelets', 'Earrings', 'Gift Sets'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors font-light tracking-wide">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-lg font-serif font-medium mb-8">Customer Care</h4>
            <ul className="space-y-4">
              {['Contact Us', 'Shipping & Returns', 'Size Guide', 'FAQ', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors font-light tracking-wide">
                    {item}
                  </a>
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
            <form className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-white/40 transition-colors placeholder:text-gray-600"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <Mail size={18} />
                </button>
              </div>
              <div className="flex items-start gap-2">
                <input type="checkbox" id="consent" className="mt-1 accent-white" />
                <label htmlFor="consent" className="text-xs text-gray-500 font-light">
                  I agree to the privacy policy and terms.
                </label>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 font-light">
            &copy; {new Date().getFullYear()} Shin Orne by Charm Aura. All rights reserved. 
            <a href="/admin" className="ml-4 hover:text-white transition-colors">Admin Portal</a>
          </p>
          <div className="flex gap-6">
            <span className="text-xs text-gray-500 font-light">Currency: USD</span>
            <span className="text-xs text-gray-500 font-light">Language: English</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
