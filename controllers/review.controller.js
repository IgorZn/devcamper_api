const ErrResponse = require("../utils/errorResponse");
const Review = require("../models/Review.model");


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