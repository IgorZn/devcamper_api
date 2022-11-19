const path = require("node:path")
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
            ;
        })

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
        .cookie('token', token, options)
        .json({success: true, token})
}