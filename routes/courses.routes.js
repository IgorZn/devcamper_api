const express = require('express');
const {getCourses, getCourse, addCourse, updCourse, delCourse} = require("../controllers/courses.controllers");
const router = express.Router({mergeParams: true});

router.route('/')
    .get(getCourses)
    .post(addCourse)

router.route('/:id')
    .get(getCourse)
    .put(updCourse)
    .delete(delCourse)


module.exports = router;
