import React from 'react';
import { 
  ShoppingCart, 
  Clock, 
  MapPin, 
  Utensils, 
  ChefHat, 
  Smartphone 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import adminDashboard from "../assets/adminDashboard.png"

const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div 
    className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
    whileHover={{ scale: 1.05 }}
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex items-center mb-4">
      <Icon className="text-purple-600 mr-4" size={32} />
      <h3 className="text-lg sm:text-xl font-bold text-purple-800">{title}</h3>
    </div>
    <p className="text-sm sm:text-base text-gray-600">{description}</p>
  </motion.div>
);

const FoodBroLandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Hero Section */}
      <motion.header 
        className="container mx-auto px-4 sm:px-6 pt-8 sm:pt-16 pb-12 sm:pb-24 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.h1 
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-purple-900 mb-4 sm:mb-6"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          FoodBro: Your Culinary Companion
        </motion.h1>
        <motion.p 
          className="text-lg sm:text-xl text-purple-700 max-w-2xl mx-auto mb-8 sm:mb-10 px-4"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Bridging Restaurants, Customers, and Delivery in One Seamless Platform
        </motion.p>

        {/* Auth Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto px-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link 
            to="/login"
            className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors shadow-md text-lg font-medium"
          >
            Login
          </Link>
          <Link 
            to="/signup"
            className="bg-white text-purple-600 px-8 py-3 rounded-lg hover:bg-purple-50 transition-colors shadow-md border-2 border-purple-600 text-lg font-medium"
          >
            Sign Up
          </Link>
        </motion.div>
      </motion.header>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <motion.h2 
          className="text-2xl sm:text-4xl font-bold text-center text-purple-900 mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          How FoodBro Works
        </motion.h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <FeatureCard 
            icon={Smartphone}
            title="Easy Ordering"
            description="Browse menus, customize orders, and checkout with just a few taps."
          />
          <FeatureCard 
            icon={ChefHat}
            title="Restaurant Dashboard"
            description="Streamline kitchen operations with real-time order management."
          />
          <FeatureCard 
            icon={ShoppingCart}
            title="Quick Delivery"
            description="Track your order in real-time with transparent pricing."
          />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-6 py-16 bg-white/50 backdrop-blur-sm">
        <motion.div 
          className="grid md:grid-cols-2 gap-12 items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="space-y-6"
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-purple-900 mb-6">
              Why Choose FoodBro?
            </h2>
            <div className="flex items-start space-x-4">
              <Clock className="text-purple-600 flex-shrink-0" size={36} />
              <div>
                <h3 className="text-xl font-semibold text-purple-800 mb-2">
                  Time-Saving
                </h3>
                <p className="text-gray-600">
                  Reduce order processing time and minimize manual coordination between restaurants and delivery partners.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <MapPin className="text-purple-600 flex-shrink-0" size={36} />
              <div>
                <h3 className="text-xl font-semibold text-purple-800 mb-2">
                  Smart Routing
                </h3>
                <p className="text-gray-600">
                  Optimize delivery routes to ensure faster, more efficient food delivery with minimal delays.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <img 
              src={adminDashboard} 
              alt="FoodBro Dashboard" 
              className="rounded-xl shadow-xl"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Call to Action */}
      <motion.section 
        className="container mx-auto px-6 py-24 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl font-bold text-purple-900 mb-6">
          Ready to Revolutionize Your Food Delivery?
        </h2>
        <p className="text-xl text-purple-700 max-w-2xl mx-auto mb-10">
          Join FoodBro today and experience the future of food delivery and restaurant management.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-purple-600 text-white text-xl px-10 py-4 rounded-full hover:bg-purple-700 transition-colors shadow-lg"
        >
          Get Started for Free
        </motion.button>
      </motion.section>

      {/* Footer */}
      <footer className="bg-purple-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; 2024 FoodBro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default FoodBroLandingPage;