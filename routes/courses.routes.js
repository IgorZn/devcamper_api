const express = require('express');
const { getCourses } = require("../controllers/courses.controllers");
const router = express.Router({ mergeParams: true });

router.route('/')
    .get(getCourses)


module.exports = router;
