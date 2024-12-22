const express = require('express');
const router = express.Router();
const { addItem, getAllItems, deleteItem, updateItem, getItemById } = require("../controllers/menucont");
const giveAccess = require("../middlewares/access");
const { checkAuth } = require("../middlewares/auth");
const upload = require("../middlewares/multer");

// Create uploads directory if it doesn't exist
// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}


router.use(checkAuth);

router
  .route("/:resId")
  .get(getAllItems)
  .post(giveAccess(["admin", "superadmin"]), upload.single("image"), addItem);

router
  .route("/item/:id")
  .get(getItemById)
  .delete(checkAuth, giveAccess(["admin", "superadmin"]), deleteItem)
  .patch(checkAuth, giveAccess(["admin", "superadmin"]), upload.single("image"), updateItem);

module.exports = router;