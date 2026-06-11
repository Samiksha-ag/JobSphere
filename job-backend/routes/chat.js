const express = require("express");

const chatController = require("../controllers/chat");
const isAuthenticated = require("../middleware/is-authenticated");

const router = express.Router();

router.get("/history/:otherUserId", isAuthenticated, chatController.getHistory);

module.exports = router;
