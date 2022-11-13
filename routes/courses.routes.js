const express = require('express');
const router = express.Router({mergeParams: true});
const {getCourses, getCourse, addCourse, updCourse, delCourse} = require("../controllers/courses.controllers");

// Middleware
const advancedResult = require("../middleware/advancedResult");

// Models
const courses = require("../models/Courses.model");

router.route('/')
    .get(advancedResult(courses, {
        path: 'bootcamp',
        select: 'name description'
    }), getCourses)
    .post(addCourse)

router.route('/:id')
    .get(getCourse)
    .put(updCourse)
    .delete(delCourse)


module.exports = router;
