const Bootcamp = require("../models/Bootcamps.model");


// @desc        Get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getRootBC = async (req, res, next) => {
    Bootcamp.find().then(response => {
        res
            .status(200)
            .json({success: true, count: response.length, data: response});
    }).catch(err => {
        res
            .status(400)
            .json({success: false, data: null});
    })

};

// @desc        Get single bootcamps
// @route       GET /api/v1/bootcamps/:id
// @access      Public
exports.getBCbyID = async (req, res, next) => {
    Bootcamp.findById(req.params.id).then(response => {
        res
            .status(200)
            .json({success: true, data: response});
    }).catch(err => {
        res
            .status(400)
            .json({success: false, data: null});
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
            res
                .status(400)
                .json({success: false, data: err.message});
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
            res
                .status(200)
                .json({success: true, data: err });
        } else {
            res
                .status(200)
                .json({success: false, data: doc });
        }
    })
};

// @desc        Delete bootcamp
// @route       DELETE /api/v1/bootcamps/:id
// @access      Private
exports.deleteBC = async (req, res, next) => {
    Bootcamp.findByIdAndDelete(req.params.id, (err, doc) => {
        if (err) {
            res
                .status(200)
                .json({success: true, data: err });
        } else {
            res
                .status(400)
                .json({success: false, data: doc });
        }
    })
};