const ErrResponse = require("../utils/errorResponse");
const Review = require("../models/Review.model");
const Bootcamp = require("../models/Bootcamps.model");
const Course = require("../models/Courses.model");


// @desc        Get all reviews
// @route       GET /api/v1/reviews
// @route       GET /api/v1/bootcamps/:bootcampId/reviews
// @access      Public
exports.getReviews = async (req, res, next) => {
    if (req.params.bootcampId) {
        await Review.find({bootcamp: req.params.bootcampId})
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


// @desc        Get single review
// @route       GET /api/v1/reviews/:id
// @access      Public
exports.getReview = async (req, res, next) => {
    await Review.findById(req.params.id)
        .populate({
            path: 'bootcamp',
            select: 'name description user'
        })
        .populate({
            path: 'user',
            select: 'name'
        })
        .exec()
        .then(response => {
            res
                .status(200)
                .json({success: true, data: response});
        }).catch(err => next(new ErrResponse(`No such review ${err}`)));

};


// @desc        Add review
// @route       POST /api/v1/bootcamps/:bootcampId/reviews
// @access      Private
exports.addReview = async (req, res, next) => {
    const bootcampID = req.params.bootcampId;
    req.body.bootcamp = bootcampID;

    /*
    * Find Bootcamp by ID, if exist
    * go ahead and create/add new review
    */

    // Check that Bootcamp exist
    await Bootcamp.findById(bootcampID)
        .exec()
        .then(result => {
            // Add user to body
            req.body.user = req.user.id;

            // One review per bootcamp
            Review.find({user: req.user.id, bootcamp: bootcampID})
                .exec()
                .then(result => {
                    if (result.length >= 1) {
                        return next(new ErrResponse('One review per user', 403))
                    }

                    // Add review
                    Review.create(req.body)
                        .then(response => {
                            res
                                .status(201)
                                .json({success: true, data: response});
                        })
                        .catch(err => {
                            next(err);
                        })
                })


        }).catch(err => {
            next(new ErrResponse(err, 404))
        })

};


// @desc        Update review
// @route       PUT /api/v1/reviews/:id
// @access      Private
exports.updReview = async (req, res, next) => {
    await Review.findById(req.params.id)
        .exec()
        .then(result => {
            // Make sure the user is owner or admin
            if (result.user.toString() === req.user.id || req.user.role === 'admin') {
                // Update course
                Review.findByIdAndUpdate(req.params.id, req.body, {
                    new: true,
                    runValidators: true
                }, (err, doc) => {
                    if (err) {
                        next(new ErrResponse(err, 404));
                    } else {
                        res
                            .status(200)
                            .json({success: true, data: doc});
                    }
                })
            } else {
                return next(new ErrResponse('You are not authorized to add/update/edit/delete course for this bootcamp', 401))
            }
        }).catch(e => next(e));

};


// @desc        Delete review
// @route       DELETE /api/v1/reviews/:id
// @access      Private
exports.delReview = async (req, res, next) => {
    await Review.findById(req.params.id)
        .exec()
        .then(result => {
            // Make sure user bootcamp owner
            if (result.user.toString() !== req.user.id && req.user.role !== 'admin') {
                return next(new ErrResponse('You are not authorized to add/update/edit/delete course for this bootcamp', 401))
            }

            // Remove course
            Review.findByIdAndRemove(req.params.id)
                .exec()
                .then(doc => {
                    res
                        .status(200)
                        .json({success: true, data: doc});
                }).catch(err => next(new ErrResponse(err, 404)))
        })
};