const express = require('express');
const router = express.Router();


// Controllers
const {regUser, loginUser} = require("../controllers/auth.controller");


// Routes
router.route('/register')
    .post(regUser)

router.route('/login')
    .post(loginUser)


module.exports = router;