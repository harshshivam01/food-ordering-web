import axios from 'axios';

const AXIOS_BASE_URL = 'http://localhost:3020/api/orders';

const axiosInstance = axios.create({
  baseURL: AXIOS_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const orderService = {
  createOrder: async (orderData) => {
    try {
      const response = await axiosInstance.post('/create', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUserOrders: async () => {
    try {
      const response = await axiosInstance.get('/user-orders');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getRestaurantOrders: async () => {
    try {
      const response = await axiosInstance.get('/restaurant-orders');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await axiosInstance.patch(`/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}; 