// Models
const Bootcamp = require("../models/Bootcamps.model");
const Course = require("../models/Courses.model");

// Other
const path = require("node:path")
const geocoder = require('../utils/geocoder.utils');
const ErrResponse = require("../utils/errorResponse");


// @desc        Get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getRootBC = async (req, res, next) => {
    res
        .status(200)
        .json(res.advancedResults);

};


// @desc        Get single bootcamps
// @route       GET /api/v1/bootcamps/:id
// @access      Public
exports.getBCbyID = async (req, res, next) => {
    Bootcamp.findById(req.params.id).populate({
        path: 'courses',
        select: 'title description'
    }).then(response => {
        res
            .status(200)
            .json({success: true, data: response});
    }).catch(err => {
        next(new ErrResponse(err, 404))
    })
};


// @desc        Create bootcamp
// @route       POST /api/v1/bootcamps
// @access      Private
exports.postBC = async (req, res, next) => {
    // Add user ID
    req.body.user = req.user.id;

    // If the user is NOT an admin, they can only add ONE bootcamp
    await Bootcamp.findOne({user: req.user.id})
        .then(result => {
            if (result && req.user.role != 'admin') {
                return next(new ErrResponse('The current user already published a bootcamp', 400))
            }

            // Create bootcamp
            return Bootcamp.create(req.body)
                .then(response => {
                    res
                        .status(201)
                        .json({success: true, data: response});
                })
                .catch(e => next(e));
        }).catch(e => next(e));


};


// @desc        Update bootcamp
// @route       PUT /api/v1/bootcamps/:id
// @access      Private
exports.putBC = async (req, res, next) => {
    await Bootcamp.findById(req.params.id)
        .exec()
        .then(result => {
            // Make sure user bootcamp owner
            if (result.user.toString() !== req.user.id && req.user.role !== 'admin') {
                return next(new ErrResponse('You are not authorized to update/edit/delete this bootcamp', 401))
            }

            // else UPDATE bootcamp
            Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
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
        }).catch(e => next(e))


};


// @desc        Delete bootcamp
// @route       DELETE /api/v1/bootcamps/:id
// @access      Private
exports.deleteBC = async (req, res, next) => {
    await Bootcamp.findById(req.params.id)
        .exec()
        .then(result_ => {
            // Make sure user bootcamp owner
            if (result_.user.toString() !== req.user.id && req.user.role !== 'admin') {
                return next(new ErrResponse('You are not authorized to update/edit/delete this bootcamp', 401))
            }

            // else DELETE bootcamp
            Bootcamp.findByIdAndDelete(req.params.id)
                .exec()
                .then(async function (result) {

                    // Cascade delete COURSES
                    await Course.deleteMany({bootcamp: req.params.id})
                        .exec()
                        .then(doc => {
                            res
                                .status(200)
                                .json({success: true, data: result, courses: doc});
                        })
                        .catch(err => next(err));
                })
                .catch(err => next(new ErrResponse(err, 404)));
        })


};


// @desc        Get bootcamp within a radius
// @route       GET /api/v1/:zipcode/:distance
// @access      Private
exports.getBCinRadius = async (req, res, next) => {
    const {zipcode, distance} = req.params;

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode({zipcode});
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radius using radians
    const radius = distance / 3963;

    Bootcamp.find({location: {$geoWithin: {$centerSphere: [[lat, lng], radius]}}}, (err, doc) => {
        if (err) {
            next(new ErrResponse(err, 404));
        } else {
            res
                .status(200)
                .json({success: true, count: doc.length, data: doc});
        }
    })
};


// @desc        Upload photo for bootcamp
// @route       PUT /api/v1/bootcamps/:id/photo
// @access      Private
exports.uploadBCPhoto = async (req, res, next) => {
    let file;
    let uploadPath;

    // Check for bootcampId
    const notAuthorized = await Bootcamp.findById(req.params.id)
        .exec()
        .then(result => {
            // Make sure user bootcamp owner
            if (result.user.toString() !== req.user.id && req.user.role !== 'admin') {
                return true
            }

            // else
            console.log('BootcampId is OK for image upload.'.green.bgCyan)
            return false
        })
        .catch(err => next(new ErrResponse(err, 404)))

    // Check for file
    if (!req.files || Object.keys(req.files).length === 0) {
        next(new ErrResponse('No FILES were uploaded.', 404));
    }

    file = req.files.file;

    // Check that is an image
    if (!file.mimetype.startsWith('image')) {
        next(new ErrResponse('Wrong IMAGE format.', 404));
    }

    // Check MAX size (10Mb)
    if (file.size > process.env.MAX_IMAGE_SIZE) {
        return next(new ErrResponse('File size limit.. 10Mb', 404))
    }

    // The name of the input field (i.e. "file") is used to retrieve the uploaded file
    file.name = `photo_${req.params.id}${path.extname(file.name)}`
    uploadPath = path.join(process.env.FILE_UPLOAD_PATH, file.name)

    // Use the mv() method to place the file somewhere on your server
    if (!notAuthorized) {
        await file.mv(uploadPath, async function (err) {
            if (err)
                return next(err);

            await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name})
                .then(result => {
                    console.log('Bootcamp photo was update...'.green.bgCyan)
                })
                .catch(err => next(err))

            res
                .status(200)
                .json({success: true, data: file.name});
        })
    } else {
        return next(new ErrResponse('You are not authorized to update/edit/delete this bootcamp', 401))
    }

};