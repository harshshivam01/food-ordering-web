import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Ensure Link is imported
import { menuService } from "../services/authproduct";
import { authService } from "../services/authuser";
import { Plus, Edit, Trash } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AllProductsPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const notifySuccess = (message) => toast.success(message);
  const notifyError = (message) => toast.error(message);

  useEffect(() => {
    loadMenuItems();
    checkAdminStatus();
  }, []);

  const loadMenuItems = async () => {
    try {
      const user = authService.getUser();
      const response = await menuService.getMenuItems(user.id);
      setMenuItems(response.food || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (itemId) => {
    navigate(`/dashboard/edit-item/${itemId}`);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await menuService.deleteMenuItem(itemId);
        notifySuccess('Item deleted successfully');
        // Refresh the menu items list
        loadMenuItems();
      } catch (error) {
        notifyError('Failed to delete item');
        console.error('Error deleting item:', error);
      }
    }
  };

  const checkAdminStatus = () => {
    const user = authService.getUser();
    if (user && user.role === "admin") {
      setIsAdmin(true);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-6">
      <ToastContainer autoClose={3000} position="top-right" />
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            Manage Menu Items
          </h1>
          <Link
            to="/dashboard/additem"
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-all text-sm"
          >
            <Plus size={16} />
            <span>Add Item</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {menuItems.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="relative">
                <img
                  src={item.image || "https://via.placeholder.com/200x150"}
                  alt={item.name}
                  className="w-full h-36 object-cover rounded-t-lg"
                />
                <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs ${
                  item.isveg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {item.isveg ? 'Veg' : 'Non-Veg'}
                </span>
              </div>
              
              <div className="p-3">
                <h2 className="text-lg font-medium text-gray-800 line-clamp-1">{item.name}</h2>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                
                <div className="flex justify-between items-center mt-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-purple-600">₹{item.price}</span>
                    {item.discountPercentage > 0 && (
                      <span className="text-xs text-green-600 font-medium">
                        {item.discountPercentage}% OFF
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(item._id)}
                    className="flex-1 flex items-center justify-center space-x-1 bg-purple-100 text-purple-600 px-2 py-1 rounded-full hover:bg-purple-200 transition-colors text-sm"
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="flex-1 flex items-center justify-center space-x-1 bg-red-100 text-red-600 px-2 py-1 rounded-full hover:bg-red-200 transition-colors text-sm"
                  >
                    <Trash size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllProductsPage;
