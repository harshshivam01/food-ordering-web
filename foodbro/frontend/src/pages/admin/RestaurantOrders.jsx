import { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';

const RestaurantOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await orderService.getRestaurantOrders();
      setOrders(response);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      loadOrders(); // Reload orders to show updated status
    } catch (error) {
      console.error('Error updating order status:', error);
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

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Restaurant Orders</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left">Order ID</th>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Items</th>
              <th className="px-6 py-3 text-left">Total</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b">
                <td className="px-6 py-4">#{order._id.slice(-6)}</td>
                <td className="px-6 py-4">{order.user.fullname}</td>
                <td className="px-6 py-4">
                  {order.items.map((item) => (
                    <div key={item._id}>
                      {item.product.name} x {item.quantity}
                    </div>
                  ))}
                </td>
                <td className="px-6 py-4">₹{order.totalAmount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-sm
                    ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                    className="border rounded px-2 py-1"
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
    </div>
  );
};

export default RestaurantOrders; 