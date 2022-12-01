const express = require('express');
const {protect, authorize} = require("../middleware/auth.middleware");
const {getUsers, getUser, createUser, updUser} = require("../controllers/users.controller");
const advancedResult = require("../middleware/advancedResult");
const router = express.Router();


// Models
const User = require("../models/User.model");


/* Mount once all middleware for all routes*/
router.use(protect);
router.use(authorize('admin'));


/* GET users listing. */
router.route('/')
    .get(advancedResult(User),getUsers)
    .post(createUser)

router.route('/:id')
    .get(getUser)
    .put(updUser)

module.exports = router;
