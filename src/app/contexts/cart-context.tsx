import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { cartApi } from '../services/api';
import { useAuth } from './auth-context';

export type Resolution = 'HD' | 'Full HD' | '4K';

export interface CartItem {
  productId: string;
  title: string;
  previewImage: string;
  resolution: Resolution;
  price: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (productId: string, resolution: Resolution) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => number;
  getItemCount: () => number;
  loading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load cart when user is authenticated
  const refreshCart = async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    try {
      setLoading(true);
      const response: any = await cartApi.get();
      if (response.success && response.data) {
        setItems(response.data.items);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated]);

  const addToCart = async (item: CartItem) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to cart');
    }

    try {
      setLoading(true);
      const response: any = await cartApi.add({
        productId: item.productId,
        resolution: item.resolution,
      });
      
      if (response.success && response.data) {
        setItems(response.data.items);
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string, resolution: Resolution) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response: any = await cartApi.remove(productId, resolution);
      
      if (response.success && response.data) {
        setItems(response.data.items);
      }
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      await cartApi.clear();
      setItems([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getTotal = () => {
    return items.reduce((sum, item) => sum + item.price, 0);
  };

  const getItemCount = () => {
    return items.length;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        getTotal,
        getItemCount,
        loading,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}