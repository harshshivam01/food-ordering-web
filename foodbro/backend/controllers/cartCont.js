const mongoose = require('mongoose');
const Cart = require("../models/cartmodel"); // Fixed casing to match actual filename
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
  console.log(req.body);
  console.log(req.user);
  console.log(req.user.id);

  const { productId, quantity } = req.body;

  if (!productId || !quantity || isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ error: "Invalid product ID or quantity" });
  }

  try {
    const userId = req.user.id;

    // Find the cart for the user
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // If cart doesn't exist, create a new one
      cart = new Cart({ user: userId, items: [], totalPrice: 0 });
    }

    // Check if the item already exists in the cart
    const existingItem = cart.items.find(
      (item) => item.products.toString() === productId
    );

    let itemPrice = await calculatePrice(productId, quantity);

    if (existingItem) {
      // Update quantity and price for the existing item
      existingItem.quantity += Number(quantity);
      const newPrice = await calculatePrice(productId, existingItem.quantity);
      cart.totalPrice += newPrice - (existingItem.quantity - quantity) * itemPrice;
    } else {
      // If it's a new item, add it to the cart
      cart.items.push({  products: productId, quantity });
      cart.totalPrice += itemPrice;
    }

    // Save the updated cart
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error in addToCart:", error.message);
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
