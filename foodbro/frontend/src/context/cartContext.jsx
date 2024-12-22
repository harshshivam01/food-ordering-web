import { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartLength, setCartLength] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  const updateCartDetails = async () => {
    try {
      const length = await cartService.totalItem();
      const total = await cartService.getCartTotal();
      setCartLength(length);
      setCartTotal(total);
    } catch (error) {
      console.error('Error updating cart details:', error);
    }
  };

  useEffect(() => {
    updateCartDetails();
  }, []);

  return (
    <CartContext.Provider value={{ cartLength, cartTotal, updateCartDetails }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};



