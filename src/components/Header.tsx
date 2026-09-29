import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X, Minus, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { responsiveImage } from '../lib/catalogue';

const NAV = [
  { label: 'Home', href: '/#home' },
  { label: 'Shop', href: '/#shop' },
  { label: 'Collections', href: '/#collections' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
];

export default function Header({ solid = false }: { solid?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currency, setCurrency, formatPrice } = useCurrency();
  const { cart, cartCount, cartTotal, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, hydrated } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isCartOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsCartOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isCartOpen, setIsCartOpen]);

  const opaque = solid || isScrolled;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${opaque ? 'bg-white/95 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <a href="/" className="text-2xl font-serif font-bold tracking-wider text-gray-900">
          SHIN ORNE
          <span className="block text-[10px] font-sans tracking-[0.2em] text-gray-700 uppercase">by Charm Aura</span>
        </a>

        <nav aria-label="Main" className="hidden md:flex items-center gap-8">
          {NAV.map((item) => (
            <a key={item.label} href={item.href} className="text-sm font-medium text-gray-800 hover:text-gray-500 transition-colors uppercase tracking-wide">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <select
            aria-label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as 'NGN' | 'USD')}
            className="bg-white/70 text-sm font-medium text-gray-800 cursor-pointer border border-gray-300 rounded px-2 py-1 hover:border-gray-500 transition-colors"
          >
            <option value="NGN">NGN ₦</option>
            <option value="USD">USD $</option>
          </select>
          <button
            type="button"
            aria-label={`Open cart (${hydrated ? cartCount : 0} items)`}
            className="press text-gray-800 hover:text-gray-500 transition-colors relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingBag size={22} strokeWidth={1.5} aria-hidden="true" />
            {hydrated && cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full" aria-hidden="true">
                {cartCount}
              </span>
            )}
          </button>
          <button type="button" aria-label="Open menu" aria-expanded={isMobileMenuOpen} className="md:hidden text-gray-800" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-[55]" onClick={() => setIsCartOpen(false)} aria-hidden="true" />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="cart-title"
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white z-[60] flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                <h2 id="cart-title" className="text-xl font-serif font-bold text-gray-900">Your Cart ({cartCount})</h2>
                <button type="button" aria-label="Close cart" autoFocus onClick={() => setIsCartOpen(false)} className="text-gray-600 hover:text-gray-900 transition-colors">
                  <X size={24} strokeWidth={1.5} aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-4">
                    <ShoppingBag size={48} strokeWidth={1} className="opacity-20" aria-hidden="true" />
                    <p>Your cart is empty.</p>
                    <button onClick={() => setIsCartOpen(false)} className="press mt-4 px-6 py-2 border border-gray-900 text-gray-900 rounded-md hover:bg-gray-900 hover:text-white transition-colors">
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-6">
                    {cart.map((item) => (
                      <li key={item.key} className="flex gap-4 items-center">
                        <img {...responsiveImage(item.product.image, [160, 320])} sizes="80px" alt="" className="w-20 h-24 object-cover bg-gray-50 rounded" referrerPolicy="no-referrer" />
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">{item.product.name}</h3>
                          {item.options?.ringSize && <p className="text-xs text-gray-600">Size {item.options.ringSize}</p>}
                          {item.options?.engraving && <p className="text-xs text-gray-600">Engraving: “{item.options.engraving}”</p>}
                          <p className="text-sm text-gray-700 mb-2">{formatPrice(item.product.price)}</p>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-gray-300 rounded px-2 py-1">
                              <button type="button" aria-label={`Decrease quantity of ${item.product.name}`} onClick={() => updateQuantity(item.key, item.quantity - 1)} className="text-gray-600 hover:text-gray-900">
                                <Minus size={14} aria-hidden="true" />
                              </button>
                              <span className="px-3 text-sm" aria-label={`Quantity ${item.quantity}`}>{item.quantity}</span>
                              <button type="button" aria-label={`Increase quantity of ${item.product.name}`} onClick={() => updateQuantity(item.key, item.quantity + 1)} className="text-gray-600 hover:text-gray-900">
                                <Plus size={14} aria-hidden="true" />
                              </button>
                            </div>
                            <button type="button" aria-label={`Remove ${item.product.name} from cart`} onClick={() => removeFromCart(item.key)} className="text-gray-600 hover:text-red-600 transition-colors ml-auto">
                              <Trash2 size={16} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">Subtotal</span>
                    <span className="font-serif text-xl font-bold text-gray-900">{formatPrice(cartTotal)}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-4">Your cart is saved on this device.</p>
                  <Link
                    to="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="press block text-center w-full bg-gray-900 text-white py-4 rounded font-medium hover:bg-gray-800 transition-colors tracking-wide"
                  >
                    Checkout
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 bg-white z-50 flex flex-col p-8 md:hidden"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="text-xl font-serif font-bold">Menu</span>
              <button type="button" aria-label="Close menu" autoFocus onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Mobile" className="flex flex-col gap-6">
              {NAV.map((item) => (
                <a key={item.label} href={item.href} className="text-2xl font-serif text-gray-900 hover:text-gray-500 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  {item.label}
                </a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
