const express = require("express");
const { getNotification } = require("../controllers/notificationControllers");
const { protect } = require("../middleware/authenMiddleware");
const router = express.Router()

router.get('/get', protect, getNotification)

module.exports = router