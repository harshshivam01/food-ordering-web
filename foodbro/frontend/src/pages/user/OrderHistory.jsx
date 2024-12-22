import { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await orderService.getUserOrders();
      setOrders(response);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
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
      <h1 className="text-2xl font-bold mb-6">Order History</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">Order #{order._id.slice(-6)}</h3>
                <p className="text-gray-600">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium
                ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item._id} className="flex justify-between">
                    <span>{item.product.name} x {item.quantity}</span>
                    <span>₹{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Subtotal:</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax:</span>
                  <span>₹{order.tax}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee:</span>
                  <span>₹{order.deliveryFee}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-2">
                  <span>Total:</span>
                  <span>₹{order.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory; 