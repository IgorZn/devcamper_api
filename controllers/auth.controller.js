const path = require("node:path");
const crypto = require("crypto");
const ErrResponse = require("../utils/errorResponse");

// Models
const User = require("../models/User.model");


// @desc        Register user
// @route       POST /api/v1/auth/register
// @access      Public
exports.regUser = async (req, res, next) => {
    const {name, email, password, role} = req.body;

    // Create user
    await User.create({name, email, password, role})
        .then(async data => {
            await sendTokenResponse(User, 200, res, data = data);
        }).catch(err => next(err))

};


// @desc        Login user
// @route       POST /api/v1/auth/login
// @access      Public
exports.loginUser = async (req, res, next) => {
    const {email, password} = req.body;

    // Find user and send token
    await User.findOne({email}, 'password')
        .exec()
        .then(async function (data) {
            const isMatch = await User.matchPassword(password, data.password);

            // Check passwords
            if (isMatch) {
                await sendTokenResponse(User, 200, res, data = data);
            } else {
                return next(new ErrResponse('Invalid credentials', 401))
            }
        })
        .catch(e => next(e))

};


// @desc        Logout current user
// @route       GET /api/v1/auth/logout
// @access      Private
exports.logoutUser = async (req, res, next) => {
    const options = {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    }

    res.cookie('token', 'none', options)

    res
        .status(200)
        .json({success: true, data: null})

};


// @desc        Get current user
// @route       GET /api/v1/auth/me
// @access      Private
exports.getMe = async (req, res, next) => {

    // Find user and send token
    await User.findById(req.user.id)
        .exec()
        .then(function (data) {
            res
                .status(200)
                .json({success: true, data})
        }).catch(err => next(err))

};


// @desc        Get current user
// @route       PUT /api/v1/auth/updatedetails
// @access      Private
exports.updMe = async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    }

    // Find user and update
    await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {runValidators: true, new: true})
        .exec()
        .then(function (data) {
            res
                .status(200)
                .json({success: true, data})
        }).catch(err => next(err))

};


// @desc        Forgot password
// @route       POST /api/v1/auth/forgotpass
// @access      Public
exports.forgotPwd = async (req, res, next) => {

    // Find user and send token
    await User.findOne({email: req.body.email})
        .exec()
        .then(function (data) {
            // Get reset token
            const resetToken = data.getResetPwdToken()
            data.save({validateBeforeSave: false})

            res
                .status(200)
                .json({success: true, data, resetToken})
        }).catch(err => next(new ErrResponse(err, 404)))

};


// @desc        Forgot password
// @route       PUT /api/v1/auth/resetpass/:resettoken
// @access      Public
exports.resetPwd = async (req, res, next) => {
    // Find user by token and date
    await User.findOne({
        resetPasswordToken: req.params.resettoken,
        resetPasswordExpire: {$gt: Date.now()}
    })
        .exec()
        .then(async doc => {
            // Update password
            doc.password = req.body.password;
            doc.resetPasswordToken = undefined;
            doc.resetPasswordExpire = undefined;

            // Save new password
            await doc.save()

            // Send new token based on new password
            await sendTokenResponse(User, 200, res, data = doc);
        }).catch(err => next(new ErrResponse('Invalid token', 400)))

};


// @desc        Update password
// @route       PUT /api/v1/auth/updatepassword
// @access      Private
exports.updPwd = async (req, res, next) => {
    // Find user by id
    await User.findById(req.user.id)
        .select('+password')
        .exec()
        .then(async user => {
            // Check the password
            if (!(await User.matchPassword(req.body.currentPassword, user.password))) {
                return next(new ErrResponse('Password is incorrect', 401))
            }

            // Update password
            user.password = req.body.newPassword;

            // Save new password
            await user.save()

            // Send new token based on new password
            await sendTokenResponse(User, 200, res, data = user);
        }).catch(err => next(new ErrResponse(err, 400)))

};


// Get token from model, create cookie and send response
const sendTokenResponse = async (model, statusCode, res, data = undefined) => {
    const token = await model.getSignedJwtToken(data);

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)  // Set token to cookie
        .json({success: true, token})
}