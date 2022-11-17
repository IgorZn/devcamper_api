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
            const token = await User.getSignedJwtToken();
            res
                .status(200)
                .json({success: true, data, token});

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
                    const token = await User.getSignedJwtToken();

                    res
                        .status(200)
                        .json({success: true, token});
                } else {
                    return next(new ErrResponse('Invalid credentials', 401))
                };

            }
        )

};