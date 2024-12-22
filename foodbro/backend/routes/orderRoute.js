const express = require('express');
const { checkAuth } = require('../middlewares/auth');
const giveAccess = require('../middlewares/access');
const {
  createOrder,
  getUserOrders,
  getRestaurantOrders,
  updateOrderStatus
} = require('../controllers/orderController');

const router = express.Router();

router.use(checkAuth);

router.post('/create', createOrder);
router.get('/user-orders', getUserOrders);
router.get('/restaurant-orders', giveAccess(['admin']), getRestaurantOrders);
router.patch('/:orderId/status', giveAccess(['admin']), updateOrderStatus);

module.exports = router; 