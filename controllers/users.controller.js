const User = require("../models/User.model");


// @desc        Get all users
// @route       GET /api/v1/auth/users
// @access      Private/Admin
exports.getUsers = async (req, res, next) => {
    res
        .status(200)
        .json(res.advancedResults)

};


// @desc        Get single user
// @route       GET /api/v1/auth/users/:id
// @access      Private/Admin
exports.getUser = async (req, res, next) => {

    // Find user and send token
    await User.findById(req.params.id)
        .exec()
        .then(function (data) {
            res
                .status(200)
                .json({success: true, data})
        }).catch(err => next(err))

};


// @desc        Create user
// @route       POST /api/v1/auth/users
// @access      Private/Admin
exports.createUser = async (req, res, next) => {

    // Find user and send token
    await User.create(req.body)
        .then(function (data) {
            res
                .status(201)
                .json({success: true, data})
        }).catch(err => next(err))

};


// @desc        Update user
// @route       POST /api/v1/auth/users/:id
// @access      Private/Admin
exports.updUser = async (req, res, next) => {

    // Find user and send token
    const options = {new: true, runValidators: true}
    await User.findByIdAndUpdate(req.params.id, req.body, options)
        .exec()
        .then(doc => {
            res
                .status(201)
                .json({success: true, doc})
        }).catch(err => next(err))

};


// @desc        Delete user
// @route       DELETE /api/v1/auth/users/:id
// @access      Private/Admin
exports.deleteUser = async (req, res, next) => {

    // Find user and send token
    await User.findByIdAndDelete(req.params.id)
        .exec()
        .then(function (data) {
            res
                .status(201)
                .json({success: true, data})
        }).catch(err => next(err))

};