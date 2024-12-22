const mongoose = require('mongoose');
const Cart = require("../models/cartmodel"); // Fixed casing
const Menu = require("../models/menu");



/**
 * Get the user's cart
 */
const getCart = async (req, res) => {
  try {
    const userId = req.params; // Assuming `req.user` contains authenticated user info
    console.log(userId);
    const cart = await Cart.find({ user: userId.userId });
    
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Add an item to the cart
 */
const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ error: "Invalid product ID or quantity" });
  }

  try {
    const userId = req.user.id;
    
    // Find the menu item first to get its price
    const menuItem = await Menu.findById(productId);
    if (!menuItem) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Use findOneAndUpdate instead of find and save
    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      {
        $setOnInsert: { user: userId, totalPrice: 0 }
      },
      { upsert: true, new: true }
    );

    // Find if item exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.products.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update existing item
      cart.items[existingItemIndex].quantity += Number(quantity);
    } else {
      // Add new item
      cart.items.push({ products: productId, quantity: Number(quantity) });
    }

    // Recalculate total price
    cart.totalPrice = await Promise.all(
      cart.items.map(async (item) => {
        const menuItem = await Menu.findById(item.products);
        return menuItem.price * item.quantity;
      })
    ).then(prices => prices.reduce((sum, price) => sum + price, 0));

    // Save with options
    const updatedCart = await cart.save({ new: true });
    res.status(200).json(updatedCart);

  } catch (error) {
    console.error("Error in addToCart:", error);
    res.status(500).json({ error: error.message });
  }
};

  
/**
 * Update an item's quantity in the cart
 */
const updateCartItem = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const userId = req.user.id;

  try {
    if (!productId || !quantity || isNaN(quantity) || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Product ID and valid quantity are required" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find((i) => i.products.toString() === productId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Update the item's quantity
    item.quantity = quantity;

    // Recalculate the total price for the cart
    const updatedTotalPrice = await Promise.all(
      cart.items.map(async (item) => {
        return await calculatePrice(item.products, item.quantity);
      })
    ).then((prices) => prices.reduce((sum, price) => sum + price, 0));

    cart.totalPrice = updatedTotalPrice;

    await cart.save();

    res.status(200).json({ message: "Cart item updated successfully", cart });
  } catch (err) {
    console.error("Error updating cart item:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Remove an item from the cart
 */
const removeCartItem = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.log("Invalid Product ID:", productId);
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      console.log("Cart not found for user:", userId);
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.products.toString() === productId
    );

    if (itemIndex === -1) {
      console.log("Item not found in cart:", productId);
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Remove the item
    cart.items.splice(itemIndex, 1);

    // Recalculate the total price for the cart
    const updatedTotalPrice = await Promise.all(
      cart.items.map(async (item) => {
        return await calculatePrice(item.products, item.quantity);
      })
    ).then((prices) => prices.reduce((sum, price) => sum + price, 0));

    cart.totalPrice = updatedTotalPrice;

    await cart.save();
    res.status(200).json({ message: "Item removed successfully", cart });
  } catch (error) {
    console.error("Error removing item from cart:", error.message);
    res.status(500).json({ error: "Failed to remove item from cart" });
  }
};


/**
 * Clear the cart
 */
const clearCart = async (req, res) => {
  try {
    const userId = req.params;
    console.log(userId);
    const cart = await Cart.findOne({ user: userId.userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    cart.totalPrice = 0;

    await cart.save();
    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Helper function to calculate the price of an item
 * Replace this with your actual pricing logic
 */

const calculatePrice = async (id, quantity) => {
  try {
    console.log(id, quantity);

    if (!id || !quantity || isNaN(quantity) || quantity <= 0) {
      throw new Error("Invalid product ID or quantity");
    }

    const menuItem = await Menu.findById(id);

    if (!menuItem || !menuItem.price) {
      throw new Error("Item not found or price is unavailable");
    }

    const price = menuItem.price;
    console.log("Price fetched:", price);

    return price * quantity; // Total price for this product
  } catch (error) {
    console.error("Error in calculatePrice:", error.message);
    throw error; // Propagate error for proper handling
  }
};




module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
