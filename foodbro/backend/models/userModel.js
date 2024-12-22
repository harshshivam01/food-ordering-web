const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    restaurantName: {
      type: String,
      sparse: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      default: "customer",
      enum: ["admin", "customer", "superadmin"],
    },
    image: {
      type: String,
    },
    cuisines: {
      type: [String],
      default: [],
    },
    discountPercentage: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
