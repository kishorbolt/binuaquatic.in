import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'binus_aquatic_cart_v2';
export const MIN_ORDER_VALUE = 1000;

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Validate items have valid positive quantities
          return parsed.filter(i => i && i.product && i.quantity > 0);
        }
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    if (!product || quantity <= 0) return;
    if (typeof product.price !== 'number' || product.price <= 0 || product.isEnquiryOnly) {
      return;
    }
    
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      }
      return [...prevItems, { product, quantity }];
    });

    setLastAddedItem(product.name);
    setTimeout(() => setLastAddedItem(null), 3000);
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity: Math.max(1, Math.floor(quantity)) } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const totalItems = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  // Subtotal calculated strictly using discounted selling price (item.product.price * quantity)
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const unitPrice = typeof item.product.price === 'number' ? item.product.price : 0;
      return acc + unitPrice * item.quantity;
    }, 0);
  }, [items]);

  const hasPriceOnRequest = useMemo(() => {
    return items.some((item) => item.product.price === null || item.product.price === undefined);
  }, [items]);

  // Minimum Order Value (₹1,000) Calculations
  const isMinOrderReached = subtotal >= MIN_ORDER_VALUE;
  const amountRemaining = Math.max(0, MIN_ORDER_VALUE - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / MIN_ORDER_VALUE) * 100));

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        totalItems,
        subtotal,
        hasPriceOnRequest,
        lastAddedItem,
        MIN_ORDER_VALUE,
        isMinOrderReached,
        amountRemaining,
        progressPercent
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
