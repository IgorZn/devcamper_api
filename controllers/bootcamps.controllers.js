// @desc        Get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getRootBC = (req, res, next) => {
    res
        .status(200)
        .json({success: false, msg: 'Get all bootcamps'});
};

// @desc        Get single bootcamps
// @route       GET /api/v1/bootcamps/:id
// @access      Public
exports.getBCbyID = (req, res, next) => {
    res
        .status(200)
        .json({success: true, msg: `Show single bootcamps ID: ${req.params.id}`});
};

// @desc        Create bootcamp
// @route       POST /api/v1/bootcamps
// @access      Private
exports.postBC = (req, res, next) => {
    res
        .status(200)
        .json({success: true, msg: 'Create new bootcamps'});
};

// @desc        Update bootcamp
// @route       PUT /api/v1/bootcamps/:id
// @access      Private
exports.putBC = (req, res, next) => {
    res
        .status(200)
        .json({success: true, msg: `Display bootcamps ${req.params.id}`});
};

// @desc        Delete bootcamp
// @route       DELETE /api/v1/bootcamps/:id
// @access      Private
exports.deleteBC = (req, res, next) => {
    res
        .status(200)
        .json({success: true, msg: `Delete bootcamps ${req.params.id}`});
};