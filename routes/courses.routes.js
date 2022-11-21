const express = require('express');
const router = express.Router({mergeParams: true});
const {getCourses, getCourse, addCourse, updCourse, delCourse} = require("../controllers/courses.controllers");

// Middleware
const advancedResult = require("../middleware/advancedResult");

// Models
const courses = require("../models/Courses.model");

// Protect
const { protect, authorize } = require('../middleware/auth.middleware');

router.route('/')
    .get(advancedResult(courses, {
        path: 'bootcamp',
        select: 'name description'
    }), getCourses)
    .post(protect, authorize('publisher', 'admin'), addCourse)

router.route('/:id')
    .get(getCourse)
    .put(protect, authorize('publisher', 'admin'), updCourse)
    .delete(protect, authorize('publisher', 'admin'), delCourse)


module.exports = router;
