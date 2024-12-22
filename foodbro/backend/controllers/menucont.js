const Menu = require("../models/menu");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const fs = require('fs').promises;

const addItem = async (req, res) => {
  const { resId } = req.params;
  
  if (!resId) {
    return res.status(400).json({ message: "Restaurant ID is required" });
  }
  
  try {
    let imageUrl;
    if (req.file) {
      const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
      if (cloudinaryResponse) {
        imageUrl = cloudinaryResponse.url;
        // Only delete the file after successful upload to cloudinary
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error("Error deleting temporary file:", unlinkError);
          // Continue execution even if file deletion fails
        }
      }
    }

    const menuData = {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      category: req.body.category,
      availableQty: parseInt(req.body.availableQty),
      discountPercentage: parseFloat(req.body.discountPercentage),
      isveg: req.body.isveg === 'true',
      resId: resId,
      image: imageUrl
    };

    const item = await Menu.create(menuData);
    
    res.status(201).json({ 
      status: "success",
      message: "Item added successfully", 
      item 
    });
  } catch (err) {
    console.error("Error adding item:", err);
    // If there's a file and an error occurred, try to clean up
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting temporary file after error:", unlinkError);
      }
    }
    res.status(500).json({ 
      message: "Failed to add item", 
      error: err.message 
    });
  }
};

const foodFilteration = (Menu, payload = {}) => {
  const { searchStr = "", maxPrice = Infinity, rating = 0, discount = 0, vegOnly = false } = payload;
  const search = searchStr.toLowerCase();

  return Menu.filter((food) =>
    (food.name.toLowerCase().includes(search) ||
      food.description.toLowerCase().includes(search) ||
      food.category.toLowerCase().includes(search)) &&
    food.price <= parseFloat(maxPrice) &&
    food.rating >= parseFloat(rating) &&
    food.discountPercentage >= parseFloat(discount) &&
    (!vegOnly || food.isveg)
  );
};

const getAllItems = async (req, res) => {
  const { resId } = req.params;
  console.log('Received resId:', resId);
  
  try {
    const menu = await Menu.find({ resId: resId });
    console.log('Found menu items:', menu);
    
    const data = foodFilteration(menu, {
      searchStr: req.query.searchStr || "",
      maxPrice: req.query.maxPrice || Infinity,
      rating: req.query.rating || 0,
      discount: req.query.discount || 0,
      vegOnly: req.query.vegOnly === "true"
    });
    
    res.status(200).json({ status: "success", food: data });
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ 
      message: "Failed to fetch items", 
      error: err.message 
    });
  }
};

const mongoose = require('mongoose');

const getItemById = async (req, res) => {
  const { id } = req.params;
  console.log(`Received request for item ID: ${id}`);

  // Validate the ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`Invalid ID format: ${id}`);
      return res.status(400).json({ message: "Invalid ID format" });
  }

  try {
      // Check database connection
      if (!mongoose.connection.readyState) {
          console.error("Database not connected.");
          return res.status(500).json({ message: "Database connection issue" });
      }

      // Fetch the item from the database
      const item = await Menu.findById(id);
      if (!item) {
          console.log(`Item with ID ${id} not found`);
          return res.status(404).json({ message: "Item not found" });
      }

      console.log("Item found:", item);

      // Respond with the item
      res.status(200).json(item);
  } catch (err) {
      console.error("Error fetching item:", err);

      // Send error details for debugging purposes
      res.status(500).json({ message: "Failed to fetch item", error: err.message });
  }
};

const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, isveg, discountPercentage } = req.body;
    
    const menuItem = await Menu.findById(id);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Check if this item belongs to the current restaurant admin
    if (menuItem.resId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this item" });
    }

    // Handle image upload if new image is provided
    let imageUrl = menuItem.image; // Keep existing image by default
    if (req.file) {
      const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
      if (cloudinaryResponse) {
        imageUrl = cloudinaryResponse.url;
      }
      // Clean up the temporary file
      await fs.unlink(req.file.path);
    }

    // Update the menu item
    const updatedItem = await Menu.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
        isveg,
        discountPercentage,
        image: imageUrl
      },
      { new: true }
    );

    res.json({
      status: "success",
      message: "Menu item updated successfully",
      data: updatedItem
    });
  } catch (error) {
    console.error("Error updating menu item:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update menu item",
      error: error.message
    });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the menu item
    const menuItem = await Menu.findById(id);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Check if this item belongs to the current restaurant admin
    if (menuItem.resId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this item" });
    }

    // Delete the menu item
    await Menu.findByIdAndDelete(id);

    res.json({
      status: "success",
      message: "Menu item deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete menu item",
      error: error.message
    });
  }
};


module.exports = { addItem, getAllItems, updateItem, deleteItem ,getItemById};
