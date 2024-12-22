import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { menuService } from "../../services/authproduct";
import { cartService } from "../../services/cartService";
import { useCart } from "../../context/cartContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authService } from "../../services/authuser";

const RestaurantMenu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [restaurant, setRestaurant] = useState(null);
    const { restaurantId } = useParams();
    const {updateCartDetails}=useCart();

    const notifySuccess = (message) =>
        toast.success(message, {
          className: "bg-green-500 text-white rounded shadow-md",
        });
      const notifyError = (message) =>
        toast.error(message, {
          className: "bg-red-500 text-white rounded shadow-md",
        });


    useEffect(() => {
        const fetchRestaurantDetails = async () => {
            try {
                const response = await authService.getRestaurantById(restaurantId);
                setRestaurant(response.restaurant);
            } catch (error) {
                console.error("Error fetching restaurant details:", error);
            }
        };

        fetchRestaurantDetails();
        loadMenuItems();
    }, [restaurantId]);

    const loadMenuItems = async () => {
        try {
            const response = await menuService.getMenuItems(restaurantId);
            if (!response || !response.food) {
                throw new Error('Invalid response format');
            }
            setMenuItems(response.food);
            setLoading(false);
        } catch (error) {
            console.error("Error loading menu items:", error);
            setError(error.message || "Failed to load menu items");
            setLoading(false);
        }
    };
   const handleAddToCart = async(item) => {
    try {
        const userId=authService.getUserId();
        // Get current cart items first
        const cartResponse = await cartService.getCartItems(userId);
        if (cartResponse && cartResponse.length > 0 && cartResponse[0].items.length > 0) {
            const currentRestaurantId = cartResponse[0].items[0].products.resId;
            
            if (currentRestaurantId !== restaurantId) {
                // Show confirmation dialog
                if (window.confirm('Your cart has items from another restaurant. Would you like to clear your cart and add this item?')) {
                    await cartService.clearCart();
                    await cartService.addToCart(item._id);
                    notifySuccess(`Cart cleared and ${item.name} added to cart`);
                    updateCartDetails();
                } else {
                    return; // User chose not to clear cart
                }
            } else {
                // Same restaurant, proceed normally
                await cartService.addToCart(item._id);
                notifySuccess(`${item.name} added to cart`);
                updateCartDetails();
            }
        } else {
            // Empty cart, proceed normally
            await cartService.addToCart(item._id);
            notifySuccess(`${item.name} added to cart`);
            updateCartDetails();
        }
    } catch (error) {
        notifyError("Failed to add item to cart");
        console.error("Error adding item to cart:", error);
    }
};

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto px-4 py-4 sm:py-6">
            <ToastContainer autoClose={2000} position="top-right" />
            <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                    {restaurant?.fullname || 'Restaurant'} Menu
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                    {restaurant?.cuisines?.join(', ')}
                </p>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-4">
                {menuItems.map((item) => (
                    <div
                        key={item._id}
                        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-row-reverse overflow-hidden"
                    >
                        <div className="relative w-1/4 flex-shrink-0">
                            <img
                                src={item.image || "https://via.placeholder.com/200x150"}
                                alt={item.name}
                                className="w-full h-44 object-cover"
                            />
                            <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs ${
                                item.isveg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {item.isveg ? 'Veg' : 'Non-Veg'}
                            </span>
                            <button 
                                onClick={() => handleAddToCart(item)}
                                className="absolute bottom-2 right-2 bg-purple-600 text-white px-4 py-1.5 rounded-full hover:bg-purple-700 transition-colors text-sm font-medium shadow-lg"
                            >
                                Add
                            </button>
                        </div>
                        <div className="w-2/3 p-4 sm:p-6 flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl font-medium text-gray-800">
                                    {item.name}
                                </h2>
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                    {item.description}
                                </p>
                                <div className="mt-4">
                                    <span className="text-lg font-bold text-purple-600">
                                        ₹{item.price}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RestaurantMenu;