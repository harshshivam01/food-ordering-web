import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Clock, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  ChefHat, 
  ListOrdered,
  Bell
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { menuService } from '../services/authproduct';
import { authService } from '../services/authUser';

const RestaurantDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderTrendsData, setOrderTrendsData] = useState([]);
  const [activeSection, setActiveSection] = useState('overview');
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    uniqueCustomers: 0,
    activeMenuItems: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user ID from auth service
      const userId = authService.getUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Load orders first
      const ordersResponse = await orderService.getRestaurantOrders();
      console.log('Orders loaded:', ordersResponse);
      setOrders(ordersResponse || []);

      // Then load menu items using the userId
      const menuResponse = await menuService.getMenuItems(userId);
      console.log('Menu items loaded:', menuResponse);
      setMenuItems(menuResponse?.food || []);

      // Calculate metrics and trends with null checks
      if (ordersResponse && menuResponse?.food) {
        calculateMetrics(ordersResponse, menuResponse.food);
        generateOrderTrendsData(ordersResponse);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
      toast.error(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (orders, menuItems) => {
    try {
      const uniqueCustomers = new Set(orders.map(order => order.user?._id)).size;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      setMetrics({
        totalOrders: orders.length,
        totalRevenue: totalRevenue,
        uniqueCustomers: uniqueCustomers,
        activeMenuItems: menuItems.length
      });
    } catch (error) {
      console.error('Error calculating metrics:', error);
    }
  };

  const generateOrderTrendsData = (orders) => {
    try {
      const monthlyData = {};
      
      orders.forEach(order => {
        const date = new Date(order.createdAt);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            date: monthKey,
            orders: 0,
            revenue: 0
          };
        }
        
        monthlyData[monthKey].orders += 1;
        monthlyData[monthKey].revenue += order.totalAmount;
      });

      setOrderTrendsData(Object.values(monthlyData));
    } catch (error) {
      console.error('Error generating trends data:', error);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      loadDashboardData(); // Reload orders to show updated status
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderOrderHistory = () => (
    <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-purple-800 flex items-center">
          <ListOrdered className="mr-2 text-purple-600" /> Order History
        </h2>
      </div>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-purple-100">
                <th className="p-3 text-left text-purple-800">Order ID</th>
                <th className="p-3 text-left text-purple-800">Customer</th>
                <th className="p-3 text-left text-purple-800">Items</th>
                <th className="p-3 text-left text-purple-800">Total</th>
                <th className="p-3 text-left text-purple-800">Status</th>
                <th className="p-3 text-left text-purple-800">Date</th>
                <th className="p-3 text-left text-purple-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} className="border-b hover:bg-purple-50 transition-colors">
                  <td className="p-3 text-gray-700">#{order._id.slice(-6)}</td>
                  <td className="p-3 text-gray-700">{order.user.fullname}</td>
                  <td className="p-3 text-gray-700">
                    {order.items.map(item => (
                      <div key={item._id}>
                        {item.product.name} x {item.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="p-3 text-gray-700">₹{order.totalAmount}</td>
                  <td className="p-3">
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-semibold
                      ${order.status === 'delivered' ? 'bg-green-200 text-green-800' : 
                        order.status === 'cancelled' ? 'bg-red-200 text-red-800' : 
                        'bg-yellow-200 text-yellow-800'}
                    `}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-3 text-gray-700">{formatDate(order.createdAt)}</td>
                  <td className="p-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // Render Overview Section
  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            icon: ShoppingCart, 
            label: 'Total Orders',
            value: metrics.totalOrders,
            color: 'text-purple-600'
          },
          { 
            icon: DollarSign,
            label: 'Total Revenue',
            value: `₹${metrics.totalRevenue.toFixed(2)}`,
            color: 'text-green-600'
          },
          { 
            icon: Users,
            label: 'Unique Customers',
            value: metrics.uniqueCustomers,
            color: 'text-blue-600'
          },
          { 
            icon: ChefHat,
            label: 'Menu Items',
            value: metrics.activeMenuItems,
            color: 'text-orange-600'
          }
        ].map(({ icon: Icon, label, value, color }, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl shadow-md p-6 flex items-center"
          >
            <Icon className={`${color} mr-4`} size={48} />
            <div>
              <p className="text-gray-600 text-sm">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {orderTrendsData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Monthly Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={orderTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="orders" 
                name="Orders"
                stroke="#8884d8" 
                strokeWidth={2}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="revenue" 
                name="Revenue (₹)"
                stroke="#82ca9d" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );

  // Navigation tabs
  const renderTabs = () => (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'orders'].map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeSection === section
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <ToastContainer />
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Restaurant Dashboard</h1>
      </header>
      
      {renderTabs()}
      
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          {activeSection === 'overview' ? renderOverview() : renderOrderHistory()}
        </>
      )}
    </div>
  );
};

export default RestaurantDashboard;