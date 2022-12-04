const express = require('express');
const router = express.Router({mergeParams: true});
const {getReviews, getReview, addReview} = require("../controllers/review.controller");


// Middleware
const {protect, authorize} = require("../middleware/auth.middleware");
const advancedResult = require("../middleware/advancedResult");


/* Mount once all middleware for all routes*/
// router.use(protect);
// router.use(authorize('admin'));


// Models
const Review = require("../models/Review.model");


router.route('/')
    .get(advancedResult(Review, {
        path: 'bootcamp',
        select: 'name description'
    }), getReviews)
    .post(protect, authorize('user', 'admin'), addReview)

router.route('/:id')
    .get(getReview)


module.exports = router;