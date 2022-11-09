const Course = require("../models/Courses.model");
const ErrResponse = require("../utils/errorResponse");
const removeFields = require("../utils/request.utils");


// @desc        Get all courses
// @route       GET /api/v1/courses
// @route       GET /api/v1/bootcamp/:bootcampId/courses
// @access      Public
exports.getCourses = async (req, res, next) => {
    let query;

    if (req.params.bootcampId) {
        query = Course.find({ bootcamp: req.params.bootcampId}).populate({
            path: 'bootcamp',
            select: 'name description'
        });
    } else {
        query = Course.find()
    }

    await query.then(response => {
        res
            .status(200)
            .json({success: true, count: response.length, data: response});
    })
        .catch(err => next(err));
};