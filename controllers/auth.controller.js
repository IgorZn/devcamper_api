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
        .then(data => {
            res
                .status(200)
                .json({success: true, data});

        }).catch( err => next(err))


};