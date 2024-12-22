import React, { useEffect } from "react";
import { Outlet, RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import Navbar from "./components/navbar";
import SignupPage from "./pages/signup";
import LoginPage from "./pages/login";
import AddProductPage from "./pages/addItem";
import AllProductsPage from "./pages/AllItem";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/user/home";
import RestaurantMenu from "./pages/user/RestaurantMenu";
import RestaurantDashboard from "./RestrauntDashBoard/Dashboard";
import FoodBroLandingPage from "./pages/Landingpage";
import CartView from "./pages/cartView";
import Checkout from "./pages/Checkout";
import OrderHistory from "./pages/user/OrderHistory";
import RestaurantOrders from "./pages/admin/RestaurantOrders";
import EditItemPage from './pages/EditItem';
import Profile from './components/Profile';
import { authService } from "./services/authuser";

const Layout = () => {
  return (
    <>
      <Navbar />
      <main className="container mx-auto">
        <Outlet />
      </main>
    </>
  );
};

// New component to handle root route redirection
const RootRedirect = () => {
  const isLoggedIn = authService.isLoggedIn();
  return isLoggedIn ? <Navigate to="/home" replace /> : <FoodBroLandingPage />;
};

// New component to handle order history redirection
const OrderHistoryRedirect = () => {
  const user = authService.getUser();
  if (!user) return <Navigate to="/login" />;
  
  return user.role === "admin" ? 
    <Navigate to="/dashboard/orders" /> : 
    <Navigate to="/orders" />;
};

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <RootRedirect />,
        },
        {
          path: "/signup",
          element: !authService.isLoggedIn() ? <SignupPage /> : <Navigate to="/home" replace />,
        },
        {
          path: "/login",
          element: !authService.isLoggedIn() ? <LoginPage /> : <Navigate to="/home" replace />,
        },
        {
          path: "/home",
          element: (
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          ),
        },
        {
          path: "/cart",
          element: (
            <ProtectedRoute>
              <CartView />
            </ProtectedRoute>
          ),
        },
        {
          path: "/checkout",
          element: (
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          ),
        },
        {
          path: "/order-history",
          element: <OrderHistoryRedirect />,
        },
        {
          path: "/orders",
          element: (
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          ),
        },
        {
          path: "/restaurant/:restaurantId",
          element: (
            <ProtectedRoute>
              <RestaurantMenu />
            </ProtectedRoute>
          ),
        },
        {
          path: "/profile",
          element: <ProtectedRoute><Profile /></ProtectedRoute>,
        },
      ],
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute requireAdmin={true}>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "", // Default dashboard page
          element: <RestaurantDashboard />,
        },
        {
          path: "edit-item/:id",
          element: <EditItemPage />,
        },
        {
          path: "orders",
          element: <RestaurantOrders />,
        },
        {
          path: "additem",
          element: <AddProductPage />,
        },
        {
          path: "allitems",
          element: <AllProductsPage />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
