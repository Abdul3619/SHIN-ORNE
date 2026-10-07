import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Product } from '../types';
import { useLocalStorage } from '../lib/useLocalStorage';

// Ring size and engraving, if set, travel with the order through to /api/orders and the admin
// dashboard (see Checkout.tsx and shop_create_order).
export interface CartOptions {
  ringSize?: string;
  engraving?: string;
}

export interface CartItem {
  key: string;
  product: Product;
  quantity: number;
  options?: CartOptions;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, options?: CartOptions) => void;
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  hydrated: boolean;
  wishlist: number[];
  toggleWishlist: (productId: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const lineKey = (productId: number, options?: CartOptions) =>
  [productId, options?.ringSize ?? '', (options?.engraving ?? '').trim()].join('|');

export function CartProvider({ children }: { children: ReactNode }) {
  // The cart and wishlist are kept in localStorage so they are still there on the next visit.
  const [cart, setCart, , hydrated] = useLocalStorage<CartItem[]>('shinorne:cart', []);
  const [wishlist, setWishlist] = useLocalStorage<number[]>('shinorne:wishlist', []);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Drop anything malformed from an older saved cart.
  useEffect(() => {
    if (hydrated && !Array.isArray(cart)) setCart([]);
  }, [hydrated, cart, setCart]);

  const addToCart = (product: Product, options?: CartOptions) => {
    const key = lineKey(product.id, options);
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.key === key);
      if (existing) {
        return prevCart.map((item) => (item.key === key ? { ...item, quantity: Math.min(item.quantity + 1, 99) } : item));
      }
      return [...prevCart, { key, product, quantity: 1, options }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (key: string) => setCart((prevCart) => prevCart.filter((item) => item.key !== key));

  const updateQuantity = (key: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(key);
    setCart((prevCart) => prevCart.map((item) => (item.key === key ? { ...item, quantity: Math.min(quantity, 99) } : item)));
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (productId: number) =>
    setWishlist((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]));

  const cartTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, isCartOpen, setIsCartOpen, hydrated, wishlist, toggleWishlist }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
