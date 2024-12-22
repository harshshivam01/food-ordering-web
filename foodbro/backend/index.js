const express = require("express");
const cors = require("cors");
const userRouter=require("./routes/userRoute");
const menuRouter=require("./routes/menuRoute");
const cartRouter=require("./routes/cartRoute");
const orderRouter = require('./routes/orderRoute');
const bodyParser=require("body-parser")
require("dotenv").config();
const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Role'],
  exposedHeaders: ['set-cookie']
})); // Enable cors for frontend communication

// Add cookie parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const {connectMongoDB}=require('./utils/connections');

connectMongoDB("foodbro");
const port = process.env.PORT || 3010;
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.urlencoded({ extended: true }));

app.use("/api/user",userRouter);
app.use("/api/cart",cartRouter);
app.use("/api/menu",menuRouter);
app.use('/api/orders', orderRouter);
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
