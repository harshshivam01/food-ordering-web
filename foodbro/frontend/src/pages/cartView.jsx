import { useEffect, useState } from "react";
import { cartService } from "../services/cartService";
import { authService } from "../services/authuser";
import { menuService } from "../services/authproduct";
import { Plus, Minus, Trash2 } from "lucide-react";
import  {useCart } from "../context/cartContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from 'react-router-dom';

const CartView = () => {
  const [cart, setCart] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { updateCartDetails} = useCart();
  const {  cartTotal } = useCart();
  const navigate = useNavigate();


  const userId = authService.getUserId();

  // Toast notifications
  const notifySuccess = (message) =>
    toast.success(message, {
      className: "bg-green-500 text-white rounded shadow-md",
    });
  const notifyError = (message) =>
    toast.error(message, {
      className: "bg-red-500 text-white rounded shadow-md",
    });

  // Remove an item from the cart
  const handleRemoveItem = async (productId,itemName) => {
    try {
      setLoading(true);
      await cartService.removeFromCart(productId);
      updateCartDetails();
      setRefreshTrigger((prev) => prev + 1);
      notifySuccess(itemName+" removed from cart!");
    } catch (error) {
      notifyError("Failed to remove item!");
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear the entire cart
  const handleClearCart = async () => {
    try {
      await cartService.clearCart();
      updateCartDetails();
      setCartItems([]);
      setCart({});
      notifySuccess("Cart cleared!");
    } catch (error) {
      notifyError("Failed to clear cart!");
      setError(error.message);
    }
  };

  // Load cart items
  const loadCartItems = async () => {
    try {
      const response = await cartService.getCartItems(userId);
      if (Array.isArray(response) && response.length > 0 && response[0]?.items) {
        setCart(response[0]);
        setCartItems(response[0].items);
      } else {
        setCartItems([]);
        setError("No items found in cart.");
      }
    } catch (err) {
      setError(err.message || "Failed to load cart items.");
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadCartItems();
    } else {
      setError("User is not logged in.");
      setLoading(false);
    }
  }, [userId, refreshTrigger]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen">
      <ToastContainer autoClose={2000} position="top-right" />

      {loading && (
        <div className="text-center text-lg text-gray-600">Loading...</div>
      )}
      {error && (
        <div className="text-center text-lg text-red-500">{error}</div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Your Cart
          </h2>
          <button
            className="w-full sm:w-auto py-2 px-4 text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition duration-200 shadow-md hover:shadow-lg"
            onClick={handleClearCart}
          >
            Empty Cart
          </button>
        </div>

        <div className="w-full lg:w-10/12 mx-auto">
          {cartItems.length === 0 && !loading && !error && (
            <div className="text-center py-8 text-lg text-gray-600 bg-white rounded-lg shadow-md">
              Your cart is empty.
            </div>
          )}
          <div className="space-y-4">
            {cartItems.map((item) => (
              <CartItemCard
                key={`${item._id}`}
                items={item}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
        </div>

        {cart.totalPrice > 0 && (
          <div className="w-full lg:w-10/12 mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-lg sm:text-xl text-gray-800">
                <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  Subtotal:
                </span>{" "}
                <span className="font-semibold">₹ {cartTotal}</span>
              </div>
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full sm:w-auto py-3 px-6 text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition duration-200 shadow-md hover:shadow-lg font-medium"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CartItemCard = ({ items, onRemove }) => {
  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState(items?.quantity || 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { updateCartDetails } = useCart();

  useEffect(() => {
    if (items?.products) {
      loadItems();
    }
    return () => {
      setItem(null);
      setLoading(true);
      setError(null);
    };
  }, [items?.products]);

  const loadItems = async () => {
    try {
      const response = await menuService.getItemById(items.products);
      if (!response) throw new Error("Invalid response from menuService");
      setItem(response);
    } catch (err) {
      setError(err.message || "Failed to fetch items.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (newQuantity) => {
    try {
      await cartService.updateCartItemQuantity(items.products, newQuantity);
      updateCartDetails();
      setQuantity(newQuantity);
    } catch (error) {
      setError(error.message);
    }
  };

  const calculateTotal = () => {
    return item?.price ? item.price * quantity : 0;
  };

  if (loading) return <div className="p-4 text-gray-600">Loading...</div>;
  if (error)
    return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!item) return <div className="p-4 text-red-500">Item not found.</div>;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col sm:flex-row p-4 gap-4">
        <div className="w-full sm:w-32 h-48 sm:h-32 flex-shrink-0 overflow-hidden rounded-lg">
          <img
            src={item.image || "/api/placeholder/128/128"}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
            <div className="w-full sm:w-auto">
              <h3 className="text-lg font-semibold text-gray-900 break-words">
                {item.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {item.description || "No description available."}
              </p>
            </div>
            <button
              className="self-end sm:self-start p-2 text-gray-400 hover:text-red-500 transition-colors"
              onClick={() => onRemove(items.products, item.name)}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center w-full sm:w-auto justify-center">
              <button
                className={`p-2 sm:p-1 rounded-l border ${
                  quantity <= 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="w-16 sm:w-12 text-center border-t border-b">
                <input
                  type="text"
                  className="w-full text-center py-2 sm:py-1 text-gray-700"
                  value={quantity}
                  readOnly
                />
              </div>
              <button
                className={`p-2 sm:p-1 rounded-r border ${
                  quantity >= item.availableQty
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= item.availableQty}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="text-center sm:text-right w-full sm:w-auto">
              <div className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                ₹ {calculateTotal().toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartView;