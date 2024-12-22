import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { useCart } from '../context/cartContext';
import { toast } from 'react-toastify';

const Checkout = () => {
  const navigate = useNavigate();
  const { updateCartLength } = useCart();
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await orderService.createOrder({ deliveryAddress: address });
      updateCartLength();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error(error.message || 'Failed to place order');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Street Address</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            value={address.street}
            onChange={(e) => setAddress({ ...address, street: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              value={address.zipCode}
              onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
        >
          Place Order
        </button>
      </form>
    </div>
  );
};

export default Checkout; 