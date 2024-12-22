import axios from "axios";
import { authService } from "./authuser";

const AXIOS_BASE_URL = "http://localhost:3020/api/cart";

const axiosInstance = axios.create({
  baseURL: AXIOS_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const addToCart = async (productId, quantity = 1) => {
  const userId = await authService.getUserId();
  if (!userId) {
    throw new Error("User ID is required");
  }
  try {
    const response = await axiosInstance.post("/create", {
      productId: productId,
      quantity: quantity,
    });
    if (response.data) {
      return response.data;
    }
    throw new Error("Failed to add item to cart");
  } catch (err) {
    console.error("Error adding to cart:", err);
    throw err; // Re-throw the error to be handled by the caller
  }
};

const getCartItems = async (userId = "") => {
  console.log(userId);
  if (!userId) {
    throw new Error("User ID is required");
  }
  try {
    const response = await axiosInstance.get(`/get/${userId}`);
    console.log("Cart get response:", response.data);
    return response.data;
  } catch (err) {
    console.error("Error getting cart items:", err);
  }
};

const removeFromCart = async (productId) => {
  console.log(productId);
  const userId = await authService.getUserId();
  if (!userId) {
    throw new Error("User ID is required");
  }
  try {
    const response = await axiosInstance.delete(`/delete/${productId}`);
    console.log("Cart remove response:", response.data);
    return response.data;
  } catch (err) {
    console.error("Error removing from cart:", err);
  }
};

const updateCartItemQuantity = async (productId, quantity) => {
  console.log(productId, quantity);
  const userId = await authService.getUserId();
  if (!userId) {
    throw new Error("User ID is required");
  }
  try {
    const response = await axiosInstance.patch(`/update/${productId}`, { quantity });
    console.log("Cart update response:", response.data);
    return response.data;
  } catch (err) {
    console.error("Error updating cart item quantity:", err);
  }
}

const clearCart = async() => {
  const userId = await authService.getUserId();
  console.log(userId);
  if (!userId) {
    throw new Error("User ID is required");
  }
  try{
    const response = axiosInstance.delete(`/clear/${userId}`);
    console.log("Cart clear response:", response.data);
    return response.data;
    } catch (err) {
    console.error("Error clearing cart:", err);
  
  }
};
const totalItem = async () => {
  try {
    const userId = await authService.getUserId();
    if (!userId) {
      return 0;
    }
    const cart = await getCartItems(userId);
    if (Array.isArray(cart) && cart.length > 0) {
      return cart[0]?.items?.length || 0;
    }
    return 0;
  } catch (error) {
    console.error("Error getting cart items:", error);
    return 0;
  }
};

export const cartService = {
    addToCart,
    getCartItems,
    removeFromCart,
    clearCart,
    updateCartItemQuantity,
    totalItem
}
