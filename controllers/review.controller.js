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
                .then( result => {
                    if (result.length >= 1) next(new ErrResponse('One review per user', 403))
                })

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

        }).catch(err => {
            next(new ErrResponse(err, 404))
        })

};