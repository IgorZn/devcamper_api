const Course = require("../models/Courses.model");
const ErrResponse = require("../utils/errorResponse");
const removeFields = require("../utils/request.utils");
const Bootcamp = require("../models/Bootcamps.model");


// @desc        Get all courses
// @route       GET /api/v1/courses
// @route       GET /api/v1/bootcamp/:bootcampId/courses
// @access      Public
exports.getCourses = async (req, res, next) => {
    let query;

    if (req.params.bootcampId) {
        query = Course.find({bootcamp: req.params.bootcampId}).populate({
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


// @desc        Get single courses
// @route       GET /api/v1/courses/:id
// @access      Public
exports.getCourse = async (req, res, next) => {
    Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    }).then(response => {
        res
            .status(200)
            .json({success: true, data: response});
    }).catch(err => {
        next(new ErrResponse(err, 404))
    })
};


// @desc        Add course
// @route       POST /api/v1/bootcamps/:bootcampId/courses
// @access      Private
exports.addCourse = async (req, res, next) => {
    const bootcampID = req.params.bootcampId;
    req.body.bootcamp = bootcampID;

    /*
    * Find Bootcamp by ID, if exist
    * go ahead and create/add new course
    */

    // Check that Bootcamp exist
    Bootcamp.findById(bootcampID).then(result => {
        // Add course
        Course.create(req.body)
            .then(response => {
                res
                    .status(201)
                    .json({success: true, data: response});
            })
            .catch(err => {
                next(err);
            })
    }).catch(err => {
        next(new ErrResponse(err, 404))
    })

};