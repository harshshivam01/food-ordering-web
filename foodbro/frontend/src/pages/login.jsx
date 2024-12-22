import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { authService } from "../services/authuser";
import { useNavigate } from "react-router-dom";
import  loginreq from "../assets/loginreq.png"

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    form: "",
    username: "",
    password: "",
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      username: "",
      password: "",
      form: "",
    };

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    } else if (formData.username.length < 2) {
      newErrors.username = "Username must be at least 2 characters";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 2) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors(prev => ({
      ...prev,
      [name]: "",
      form: "",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    authService
      .login(formData)
      .then((res) => {
        if (res.user.role === "admin") {
          navigate("/dashboard", { replace: true });
        } else if (res.user.role === "superadmin") {
          navigate("/superadmin", { replace: true });
        } else {
          navigate("/home");
        }
      })
      .catch((err) => {
        // Check if it's a 401 error
        if (err.response && err.response.status === 401) {
          setErrors(prev => ({
            ...prev,
            form: (
              <div className="flex flex-col space-y-2">
                <span>User not found. Please register first.</span>
              
              </div>
            )
          }));
        } else {
          // Handle other errors
          setErrors(prev => ({
            ...prev,
            form: err.response?.data?.message || "Invalid username or password"
          }));
        }
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Illustration Side */}
          <div className="hidden md:block ">
            <img
              src={loginreq}
              alt="Login Illustration"
              className="w-6/12 h-[80vh] mx-auto rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Login Form */}
          <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                Welcome Back
              </h2>
              <p className="text-gray-500 mt-2">
                Login to continue your culinary adventure
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 border ${
                      errors.username ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none`}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.username}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`w-full pl-10 pr-4 py-2 border ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none`}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.password}
                  </p>
                )}
                <div className="text-right mt-2">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {/* Error Message Display */}
              {errors.form && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-sm text-red-600">
                    {errors.form}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg hover:opacity-90 transition duration-300 flex items-center justify-center space-x-2"
              >
                <span>Log In</span>
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;