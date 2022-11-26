const Course = require("../models/Courses.model");
const ErrResponse = require("../utils/errorResponse");
const removeFields = require("../utils/request.utils");
const Bootcamp = require("../models/Bootcamps.model");


// @desc        Get all courses
// @route       GET /api/v1/courses
// @route       GET /api/v1/bootcamp/:bootcampId/courses
// @access      Public
exports.getCourses = async (req, res, next) => {
    if (req.params.bootcampId) {
        await Course.find({bootcamp: req.params.bootcampId})
            .then(response => {
                res
                    .status(200)
                    .json({success: true, count: response.length, data: response});
            }).catch(err => next(err));

    } else {
        res
            .status(200)
            .json(res.advancedResults);
    }

};


// @desc        Get all courses by user
// @route       GET /api/v1/courses/user/:id
// @access      Public
exports.getCoursesByUser = async (req, res, next) => {
    if (req.params.userId) {
        await Course.find({user: req.user.id})
            .then(response => {
                res
                    .status(200)
                    .json({success: true, count: response.length, data: response});
            }).catch(err => next(err));

    } else {
        res
            .status(200)
            .json(res.advancedResults);
    }

};


// @desc        Get single courses
// @route       GET /api/v1/courses/:id
// @access      Public
exports.getCourse = async (req, res, next) => {
    Course.findById(req.params.id)
        .populate({
            path: 'bootcamp',
            select: 'name description user'
        })
        // .populate('user')
        .then(response => {
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
    await Bootcamp.findById(bootcampID)
        .exec()
        .then(result => {
            // Make sure user bootcamp owner
            if (result.user.toString() !== req.user.id && req.user.role !== 'admin') {
                return next(new ErrResponse('You are not authorized to add/update/edit/delete course for this bootcamp', 401))
            } else {
                // Add user to body
                req.body.user = req.user.id;

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
            }
        }).catch(err => {
            next(new ErrResponse(err, 404))
        })

};


// @desc        Update course
// @route       PUT /api/v1/courses/:id
// @access      Private
exports.updCourse = async (req, res, next) => {
    await Course.findById(req.params.id)
        .exec()
        .then(result => {
            // Make sure user bootcamp owner
            if (result.user !== req.user.id && req.user.role !== 'admin') {
                return next(new ErrResponse('You are not authorized to add/update/edit/delete course for this bootcamp', 401))
            } else {
                // Update course
                Course.findByIdAndUpdate(req.params.id, req.body, {
                    new: true,
                    runValidators: true
                }, (err, doc) => {
                    if (err) {
                        next(new ErrResponse(err, 404));
                    } else {
                        res
                            .status(200)
                            .json({success: false, data: doc});
                    }
                })
            }
        }).catch(e => next(e));


};


// @desc        Delete course
// @route       DELETE /api/v1/courses/:id
// @access      Private
exports.delCourse = async (req, res, next) => {
    await Course.findById(req.params.id)
        .exec()
        .then(result => {
            // Make sure user bootcamp owner
            if (result.user.toString() !== req.user.id && req.user.role !== 'admin') {
                return next(new ErrResponse('You are not authorized to add/update/edit/delete course for this bootcamp', 401))
            }

            // Remove course
            Course.findByIdAndRemove(req.params.id)
                .exec()
                .then(doc => {
                    res
                        .status(200)
                        .json({success: true, data: doc});
                }).catch(err => next(new ErrResponse(err, 404)))
        })
};