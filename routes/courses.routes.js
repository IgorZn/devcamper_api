const express = require('express');
const router = express.Router({mergeParams: true});
const {getCourses, getCourse, addCourse, updCourse, delCourse} = require("../controllers/courses.controllers");

// Middleware
const advancedResult = require("../middleware/advancedResult");

// Models
const courses = require("../models/Courses.model");

// Protect
const { protect } = require('../middleware/auth.middleware');

router.route('/')
    .get(advancedResult(courses, {
        path: 'bootcamp',
        select: 'name description'
    }), getCourses)
    .post(protect, addCourse)

router.route('/:id')
    .get(getCourse)
    .put(protect, updCourse)
    .delete(protect, delCourse)


module.exports = router;
