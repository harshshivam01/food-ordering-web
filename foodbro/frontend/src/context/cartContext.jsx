import { useContext,createContext } from "react";
import { useEffect,useState } from "react";
import { cartService } from "../services/cartService";
import { authService } from "../services/authuser";

const cartContext=createContext(null);




export const CartProvider=({children})=>{
    const [cartLength, setCartLength] = useState(0);

    const fetchCartLength = async () => {
      try {
        if (authService.isLoggedIn()) {
          const length = await cartService.totalItem();
          setCartLength(length || 0);
        } else {
          setCartLength(0);
        }
      } catch (error) {
        console.error('Error fetching cart length:', error);
        setCartLength(0);
      }
    };
  
    useEffect(() => {
      fetchCartLength();
    }, []);
  
    const updateCartLength = async () => {
      await fetchCartLength();
    };
  

    return (
    <cartContext.Provider value={{ cartLength, updateCartLength }}>
        {children}
    </cartContext.Provider>
);
}

export const useCart= ()=>useContext(cartContext);



