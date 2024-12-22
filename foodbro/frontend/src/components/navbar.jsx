import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, LucideShoppingCart, User, ChevronDown } from "lucide-react";
import { authService } from "../services/authuser";
import { useCart } from "../context/cartContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isadmin, setIsadmin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { cartLength } = useCart();
  const location = useLocation();

  useEffect(() => {
    const user = authService.getUser();
    if (user && user.role === "admin") {
      setIsadmin(true);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    // Instead of using navigate, we'll use window.location
    window.location.href = "/";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const closeDropdown = (e) => {
      if (isDropdownOpen && !e.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, [isDropdownOpen]);

  // Close dropdown when location changes
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location]);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {isadmin ? (
          <Link
            to="/dashboard"
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500"
          >
            FoodBro Admin
          </Link>
        ) : (
          <Link
            to="/home"
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500"
          >
            FoodBro
          </Link>
        )}

        <div className="md:flex space-x-6 items-center">
          {authService.isAdmin() && (
            <div className="hidden md:flex space-x-6">
              <Link
                to="/dashboard/additem"
                className="text-gray-700 hover:text-purple-600"
              >
                Add Item
              </Link>
              <Link
                to="/dashboard/allitems"
                className="text-gray-700 hover:text-purple-600"
              >
                Show Item
              </Link>
            </div>
          )}

          <div className="flex space-x-4 items-center">
            {!authService.isLoggedIn() ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {!isadmin && (
                  <Link
                    to="/cart"
                    className="relative flex items-center text-gray-700 hover:text-purple-600"
                  >
                    <LucideShoppingCart size={30} />
                    {cartLength > 0 && (
                      <span className="absolute top-0 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartLength}
                      </span>
                    )}
                  </Link>
                )}
                
                {/* User Dropdown */}
                <div className="relative dropdown-container">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDropdownOpen(!isDropdownOpen);
                    }}
                    className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 focus:outline-none"
                  >
                    <User size={24} />
                    <ChevronDown size={16} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                      {authService.isAdmin() && (
                        <div className="md:hidden border-b border-gray-100 mb-2">
                          <Link
                            to="/dashboard/additem"
                            className="block px-4 py-2 text-gray-700 hover:bg-purple-50"
                          >
                            Add Item
                          </Link>
                          <Link
                            to="/dashboard/allitems"
                            className="block px-4 py-2 text-gray-700 hover:bg-purple-50"
                          >
                            Show Item
                          </Link>
                        </div>
                      )}
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-purple-50"
                      >
                        Profile
                      </Link>
                      <Link
                        to={isadmin ? "/dashboard/orders" : "/order-history"}
                        className="block px-4 py-2 text-gray-700 hover:bg-purple-50"
                      >
                        Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;