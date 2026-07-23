import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Menu, X, User, Minus, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currency, setCurrency, formatPrice, convertPrice } = useCurrency();
  const { cart, cartCount, cartTotal, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckoutLoading(true);
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: 'Guest User',
          customer_email: 'guest@example.com',
          total: convertPrice(cartTotal)
        })
      });
      alert('Order placed successfully! Check the Admin Dashboard.');
      clearCart();
      setIsCartOpen(false);
    } catch (error) {
      alert('Error placing order');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

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
          <button 
            className="text-gray-700 hover:text-primary transition-colors relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[55]"
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white z-[60] flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                <h2 className="text-xl font-serif font-bold text-gray-900">Your Cart ({cartCount})</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                  <X size={24} strokeWidth={1.5} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                    <ShoppingBag size={48} strokeWidth={1} className="opacity-20" />
                    <p>Your cart is empty.</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="mt-4 px-6 py-2 border border-gray-900 text-gray-900 rounded-md hover:bg-gray-900 hover:text-white transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex gap-4 items-center">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-20 h-24 object-cover bg-gray-50 rounded" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">{item.product.name}</h3>
                          <p className="text-sm text-gray-500 mb-2">{formatPrice(item.product.price)}</p>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-gray-200 rounded px-2 py-1">
                              <button 
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="text-gray-400 hover:text-gray-900"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="px-3 text-sm">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="text-gray-400 hover:text-gray-900"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button 
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors ml-auto"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="font-serif text-xl font-bold text-gray-900">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    disabled={isCheckoutLoading}
                    className="w-full bg-gray-900 text-white py-4 rounded font-medium hover:bg-gray-800 transition-colors tracking-wide disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isCheckoutLoading ? (
                      <span className="animate-pulse">Processing...</span>
                    ) : (
                      'Proceed to Checkout'
                    )}
                  </button>
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
