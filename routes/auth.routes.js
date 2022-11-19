const express = require('express');
const router = express.Router();


// Controllers
const {regUser, loginUser, getMe} = require("../controllers/auth.controller");
const {get} = require("mongoose");
const {protect} = require("../middleware/auth.middleware");


// Routes
router.route('/register')
    .post(regUser)

router.route('/login')
    .post(loginUser)

router.route('/me')
    .get(protect, getMe)


module.exports = router;