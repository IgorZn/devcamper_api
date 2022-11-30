const express = require('express');
const router = express.Router();


// Controllers
const {regUser, loginUser, getMe, forgotPwd, resetPwd, updMe, updPwd} = require("../controllers/auth.controller");
const {protect} = require("../middleware/auth.middleware");


// Routes
router.route('/register')
    .post(regUser)

router.route('/login')
    .post(loginUser)

router.route('/me')
    .get(protect, getMe)

router.route('/updatedetails')
    .put(protect, updMe)

router.route('/forgotpass')
    .post(forgotPwd)

router.route('/updatepassword')
    .put(protect, updPwd)

router.route('/resetpass/:resettoken')
    .put(resetPwd)


module.exports = router;