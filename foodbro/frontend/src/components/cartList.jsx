import { menuService } from "../services/authproduct";
import { useState, useEffect } from "react";
import { Plus, Minus, Trash2 } from "lucide-react";

const CartList = ({ data, onRemove }) => {
  if (!data) {
    return <div>No item data available.</div>;
  }

  return (
    <div className="p-2 bg-gray-100">
      <div className="max-w-xl mx-auto">
        <CartItemCard items={data} onRemove={onRemove} />
      </div>
    </div>
  );
};

const CartItemCard = ({ items, onRemove }) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(items?.quantity || 1);

  useEffect(() => {
    if (items?.products) {
      loadItems();
    }
  }, [items?.products]);

  const loadItems = async () => {
    try {
      const response = await menuService.getItemById(items.products);
      if (!response) {
        throw new Error("Invalid response from menuService");
      }
      setItem(response);
    } catch (err) {
      setError(err.message || "Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = () => {
    if (quantity < (item?.availableQty || 0)) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const calculateTotal = () => {
    if (!item?.price) return 0;
    const basePrice = item.price * quantity;
    return item.discountPercentage
      ? basePrice * (1 - (item.discountPercentage ?? 0) / 100)
      : basePrice;
  };

  if (loading) {
    return <div className="p-4 text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!item) {
    return <div className="p-4 text-red-500">Error: Item data is missing.</div>;
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md mb-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex p-4 gap-4">
        <div className="w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg">
          <img
            src={item.image || "https://via.placeholder.com/128"}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="pr-4">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {item.name || "Unnamed Item"}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {item.description || "No description available."}
              </p>
            </div>
            <button
              className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
              onClick={() => onRemove(item._id)}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center">
              <button
                className={`p-1 rounded-l border border-r-0 ${
                  quantity <= 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
                onClick={handleDecrement}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="w-12 text-center border-t border-b">
                <input
                  type="text"
                  className="w-full text-center py-1 text-gray-700"
                  value={quantity}
                  readOnly
                />
              </div>
              <button
                className={`p-1 rounded-r border border-l-0 ${
                  quantity >= (item?.availableQty || 0)
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
                onClick={handleIncrement}
                disabled={quantity >= (item?.availableQty || 0)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                ₹ {calculateTotal().toFixed(2)}
              </div>
              {item.discountPercentage > 0 && (
                <div className="text-sm font-medium text-green-600">
                  {item.discountPercentage}% off
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartList;
