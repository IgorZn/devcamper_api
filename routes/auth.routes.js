const express = require('express');
const router = express.Router();


// Controllers
const {regUser} = require("../controllers/auth.controller");


// Routes
router.route('/')
    .post(regUser)


module.exports = router;