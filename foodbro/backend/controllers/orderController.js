const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Menu = require('../models/menu');

const createOrder = async (req, res) => {
  try {
    const { deliveryAddress } = req.body;
    const userId = req.user.id;

    // Get user's cart and populate the products
    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: 'items.products',
        model: 'Menu'
      });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate order details
    const TAX_RATE = 0.05; // 5% tax
    const DELIVERY_FEE = 50; // Fixed delivery fee
    
    const subtotal = cart.totalPrice;
    const tax = subtotal * TAX_RATE;
    const totalAmount = subtotal + tax + DELIVERY_FEE;

    // Get restaurant ID from the first item
    const restaurantId = cart.items[0].products.resId;

    // Verify all items are from the same restaurant
    const allSameRestaurant = cart.items.every(item => 
      item.products.resId.toString() === restaurantId.toString()
    );

    if (!allSameRestaurant) {
      return res.status(400).json({ 
        message: "All items must be from the same restaurant" 
      });
    }

    // Create order
    const order = new Order({
      user: userId,
      restaurant: restaurantId,
      items: cart.items.map(item => ({
        product: item.products._id,
        quantity: item.quantity,
        price: item.products.price * item.quantity // Calculate actual item total
      })),
      subtotal,
      tax,
      deliveryFee: DELIVERY_FEE,
      totalAmount,
      deliveryAddress,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await order.save();

    // Clear the cart
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json({
      message: "Order placed successfully",
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('restaurant', 'restaurantName')
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

const getRestaurantOrders = async (req, res) => {
  try {
    const orders = await Order.find({ restaurant: req.user.id })
      .populate('user', 'fullname')
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch restaurant orders", error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to update order status", error: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getRestaurantOrders,
  updateOrderStatus
}; 