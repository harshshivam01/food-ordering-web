const User = require("../models/userModel");
const { generateToken } = require("../utils/auth");
require('dotenv').config();
const nodemailer=require('nodemailer');
const {uploadOnCloudinary} =require("../utils/cloudinary")

// Email configuration


const { hashPassword, comparePassword } = require("../utils/hash");

const generateOtp=()=>{
  let otp = Math.floor(1000 + Math.random() * 9000);
  return otp;
}

const sendVerificationEmail=(email="harshshivam15@gmail.com", otp)=>{
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: '8197e5001@smtp-brevo.com',
      pass: process.env.SMTP_HOST_PASSWORD,
    },
    logger: true, // Enable logging
    debug: true,  // Include debug information
  });
  const mailOptions = {
    from: 'ciphermaker1@gmail.com', 
    to: email, 
    subject: 'Verification Code', 
    text: `Your verification code is ${otp}. Please enter it to verify your email address and continue the process with FoodBro.` // plain text body
  }
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      console.log(error);
    } else {
      console.log('Email sent: ', info.response);
    }
  });
}


const registerUser = async (req, res) => {
  try {
    const { fullname, username, email, password, address, phone, role, cuisines, restaurantName, discountPercentage } = req.body;
    
    // Validate required fields
    if (!password) {
      return res.status(400).json({
        status: "error",
        message: "Password is required"
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "User already exists with this email or username"
      });
    }

    // Handle file upload (optional)
    let imageUrl = null;
    if (req.file) {
      const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
      if (cloudinaryResponse) {
        imageUrl = cloudinaryResponse.url;
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    if (!hashedPassword) {
      throw new Error('Failed to hash password');
    }

    // Parse cuisines if provided
    const parsedCuisines = cuisines ? 
      (typeof cuisines === 'string' ? JSON.parse(cuisines) : cuisines) 
      : [];

    // Create user
    const user = await User.create({
      fullname,
      username,
      email,
      password: hashedPassword,
      address,
      phone,
      role,
      image: imageUrl,
      cuisines: parsedCuisines,
     
      discountPercentage: discountPercentage ? Number(discountPercentage) : undefined
    });

    // Generate token
    const token = generateToken({
      id: user._id,
      username: user.username,
      role: user.role
    });

    // Send response
    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to register user",
      error: error.message
    });
  }
};


const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('Login attempt:', { username, password });

    const user = await User.findOne({ username });
    console.log('Found user:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid username or password",
      });
    }

    const isMatch = await comparePassword(password, user.password);
    console.log('Password comparison:', { isMatch });

    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid username or password",
      });
    }

    // Generate OTP and test email sending
    
    // Generate token
    const token = generateToken({
      id: user._id,
      username: user.username,
      role: user.role
    });

    // Send token in HTTP-only cookie and response
    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: false, // Set to true if your site is served using HTTPS
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({
        status: "success",
        message: "User logged in successfully",
        token,
        user: {
          id: user._id,
          fullname: user.fullname,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to login user",
      error: error.message,
    });
  }
};


const getAllUsers = (req, res) => {
  User.find({})
    .then((users) => {
      res.json({ users, status: "success" });
    })
    .catch((error) => {
      console.error("Error fetching users:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch users",
        error,
      });
    });
};

const getAllRestaurants = (req, res) => {
  console.log("Fetching restaurants with role 'admin'...");
  User.find({ role: "admin" })
    .then((restaurants) => {
      console.log("Query result:", restaurants);
      res.json({ restaurants, status: "success" });
    })
    .catch((error) => {
      console.error("Error fetching restaurants:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch restaurants",
        error,
      });
    });
};


module.exports = { registerUser, loginUser, getAllUsers, getAllRestaurants };
