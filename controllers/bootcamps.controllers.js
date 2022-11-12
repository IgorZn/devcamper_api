// Models
const Bootcamp = require("../models/Bootcamps.model");
const Course = require("../models/Courses.model");

// Other
const path = require("node:path")
const geocoder = require('../utils/geocoder.utils');
const ErrResponse = require("../utils/errorResponse");
const removeFields = require("../utils/request.utils");


// @desc        Get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getRootBC = async (req, res, next) => {
    // remove 'select' from 'query'
    const reqQuery = removeFields(req);

    // Now without 'select' if it was
    let query = JSON.stringify(reqQuery);

    // Create operators (add $)
    query = query.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Do DB query with operators
    let dbQuery = Bootcamp.find(JSON.parse(query));

    // Do SELECT if exist
    if (req.query.select) {
        const selectedFields = req.query.select.split(',').join(' ');
        dbQuery.select(selectedFields);
    }
    ;

    // Do SORT if exist
    if (req.query.sort) {
        const selectedFields = req.query.sort.split(',').join(' ');
        dbQuery.sort(selectedFields);
    }
    ;

    // Do pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Bootcamp.countDocuments();

    dbQuery = dbQuery.skip(startIndex).limit(limit).populate({
        path: 'courses',
        select: 'title description'
    });

    // Pagination result
    const pagination = {};

    pagination.totalDocs = total;

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }
    ;

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }
    ;


    // Finding resource
    dbQuery.then(response => {
        res
            .status(200)
            .json({success: true, pagination, count: response.length, data: response});
    }).catch(err => {
        next(err);
    });
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
    Bootcamp.create(req.body)
        .then(response => {
            res
                .status(201)
                .json({success: true, data: response});
        })
        .catch(err => {
            next(err);
        })
};

// @desc        Update bootcamp
// @route       PUT /api/v1/bootcamps/:id
// @access      Private
exports.putBC = async (req, res, next) => {
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
};

// @desc        Delete bootcamp
// @route       DELETE /api/v1/bootcamps/:id
// @access      Private
exports.deleteBC = async (req, res, next) => {
    Bootcamp.findByIdAndDelete(req.params.id, async (err, doc) => {
        if (err) {
            next(new ErrResponse(err, 404));
        } else {
            // Cascade delete courses
            doc.courses = await Course.deleteMany({bootcamp: req.params.id})

            res
                .status(200)
                .json({success: true, data: doc});
        }
    });
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
    await Bootcamp.findById(req.params.id)
        .then(result => console.log('BootcampId is OK for image upload.'))
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
    await file.mv(uploadPath, async function (err) {
        if (err)
            return next(err);

        await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name})
            .then(result => {console.log('Bootcamp photo was update...'.green.bgCyan)})
            .catch(err => next(err))

        res
            .status(200)
            .json({success: true, data: file.name});
    });
};