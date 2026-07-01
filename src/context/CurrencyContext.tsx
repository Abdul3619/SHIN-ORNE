import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'NGN' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceInUSD: number) => string;
  convertPrice: (priceInUSD: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem('currency');
    return (saved as Currency) || 'NGN';
  });

  const exchangeRate = 1500; // 1 USD = 1500 NGN (approximate, for demonstration)

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const convertPrice = (priceInUSD: number) => {
    if (currency === 'NGN') {
      return priceInUSD * exchangeRate;
    }
    return priceInUSD;
  };

  const formatPrice = (priceInUSD: number) => {
    if (currency === 'NGN') {
      return `₦${(priceInUSD * exchangeRate).toLocaleString('en-NG')}`;
    }
    return `$${priceInUSD.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
}
