import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../context/CurrencyContext';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <a href="/" className={`text-2xl font-serif font-bold tracking-wider ${isScrolled ? 'text-gray-900' : 'text-gray-900'}`}>
            SHIN ORNE
            <span className="block text-[10px] font-sans tracking-[0.2em] text-gray-500 uppercase">by Charm Aura</span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {['Home', 'Shop', 'Collections', 'About', 'Contact'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium text-gray-700 hover:text-primary transition-colors uppercase tracking-wide"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-6">
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value as 'NGN' | 'USD')}
            className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer border border-gray-200 rounded px-2 py-1 hover:border-gray-300 transition-colors"
          >
            <option value="NGN">NGN ₦</option>
            <option value="USD">USD $</option>
          </select>
          <button className="text-gray-700 hover:text-primary transition-colors">
            <Search size={20} strokeWidth={1.5} />
          </button>
          <button className="text-gray-700 hover:text-primary transition-colors hidden sm:block">
            <User size={20} strokeWidth={1.5} />
          </button>
          <button className="text-gray-700 hover:text-primary transition-colors relative">
            <ShoppingBag size={20} strokeWidth={1.5} />
            <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
              0
            </span>
          </button>
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 bg-white z-50 flex flex-col p-8 md:hidden"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="text-xl font-serif font-bold">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>
            <nav className="flex flex-col gap-6">
              {['Home', 'Shop', 'Collections', 'About', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-2xl font-serif text-gray-900 hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
