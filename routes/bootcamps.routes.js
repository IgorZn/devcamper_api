const express = require('express');
const router = express.Router();

// Controllers
const {
    getRootBC,
    getBCbyID,
    postBC,
    deleteBC,
    putBC,
    getBCinRadius,
    uploadBCPhoto
} = require("../controllers/bootcamps.controllers");

// Middleware
const advancedResult = require("../middleware/advancedResult");

// Models
const Bootcamp = require("../models/Bootcamps.model");

// Include other/forwarded resources routes
const courseRouter = require('./courses.routes');

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

// Protect
const { protect, authorize } = require('../middleware/auth.middleware');

// Routes
router.route('/')
    .get(advancedResult(Bootcamp, {path: 'courses', select: 'title description'}), getRootBC)
    .post(protect, authorize('publisher', 'admin'), postBC)


router.route('/:id')
    .get(getBCbyID)
    .put(protect, authorize('publisher', 'admin'), putBC)
    .delete(protect, authorize('publisher', 'admin'), deleteBC)


router.route('/:id/photo')
    .put(protect, authorize('publisher', 'admin'), uploadBCPhoto)


router.route('/radius/:zipcode/:distance')
    .get(getBCinRadius)


module.exports = router;
