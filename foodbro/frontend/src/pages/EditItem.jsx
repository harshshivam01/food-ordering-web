import { useState, useEffect } from "react";
import { menuService } from "../services/authproduct";
import { authService } from "../services/authuser";
import { useNavigate, useParams } from "react-router-dom";

import { ToastContainer, toast } from 'react-toastify';
import { Plus, Edit, Trash, Upload, Loader2 } from 'lucide-react';


const EditItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    isveg: true,
    image: null,
    discountPercentage: "0",
    availableQty: "1"
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    loadItemData();
  }, [id]);

  const loadItemData = async () => {
    try {
      const item = await menuService.getItemById(id);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        category: item.category,
        isveg: item.isveg,
        image: null,
        discountPercentage: item.discountPercentage.toString(),
        availableQty: item.availableQty.toString()
      });
      setImagePreview(item.image);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load item data");
      console.error("Error loading item:", error);
      navigate('/dashboard/allitems');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'image' && formData[key]) {
          formDataToSend.append('image', formData[key]);
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      await menuService.updateMenuItem(id, formDataToSend);
      toast.success("Item updated successfully");
      navigate('/dashboard/allitems');
    } catch (error) {
      toast.error("Failed to update item");
      console.error('Error updating item:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="animate-spin" size={48} />
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8">
      <ToastContainer />
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-6">
            Edit Menu Item
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isveg}
                    onChange={(e) => setFormData(prev => ({ ...prev, isveg: e.target.checked }))}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Vegetarian</span>
                </label>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-purple-400 transition-colors">
                  <div className="space-y-1 text-center">
                    
                      <div className="flex flex-col items-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Click or drag image to upload
                        </p>
                      </div>
                    
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.availableQty}
                    onChange={(e) => setFormData(prev => ({ ...prev, availableQty: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Percentage
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountPercentage: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <Plus className="mr-2" />
              )}
              {loading ? 'Adding Item...' : 'Add Item'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditItemPage; 