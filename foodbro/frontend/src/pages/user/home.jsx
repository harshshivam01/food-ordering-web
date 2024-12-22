import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import { authService } from "../../services/authuser";
import { User, ShoppingCart as LucideShoppingCart, LogOut, Clock, Star, MapPin, Utensils } from 'lucide-react';

const Home = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authService.getAllRestaurants()
            .then((res) => {
                setRestaurants(res.restaurants || res.data || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching restaurants:", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl md:text-2xl font-bold text-center my-6 md:my-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                Welcome to FoodBro
            </h1>
            {loading ? (
                <p className="text-center text-lg text-gray-500">Loading restaurants...</p>
            ) : restaurants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {restaurants.map((restaurant) => (
                        <Link
                            to={`/restaurant/${restaurant.id || restaurant._id}`}
                            key={restaurant.id || restaurant._id}
                            className="group bg-purple-300 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
                        >
                            <div className="relative">
                                <img
                                    src={restaurant.image || "https://via.placeholder.com/300"}
                                    alt={restaurant.fullname}
                                    className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-2 right-2 bg-white px-2 py-0.5 rounded-full shadow-md">
                                    <span className="text-sm text-purple-600 font-semibold">
                                        {restaurant.discountPercentage || 0}% OFF
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 sm:p-6">
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors line-clamp-1">
                                    {restaurant.fullname}
                                </h2>
                                <div className="flex items-center mb-2">
                                    <MapPin className="w-4 h-4 text-gray-400 mr-1 flex-shrink-0" />
                                    <p className="text-sm text-gray-600 line-clamp-1">
                                        {restaurant.address || 'Location not specified'}
                                    </p>
                                </div>
                                <div className="flex items-center mb-3">
                                    <Utensils className="w-4 h-4 text-gray-400 mr-1 flex-shrink-0" />
                                    <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">
                                        {Array.isArray(restaurant.cuisines) ? restaurant.cuisines.join(", ") : "Cuisine not specified"}
                                    </p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                        <span className="text-sm text-gray-700">4.5</span>
                                    </div>
                                    <span className="text-sm text-purple-600 font-medium">View Menu →</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500">No restaurants found.</p>
            )}
        </div>
    );
};

export default Home;
