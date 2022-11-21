const jwt = require('jsonwebtoken');
const ErrResponse = require('../utils/errorResponse');
const User = require('../models/User.model');


// Protect routes
exports.protect = async (req, res, next) => {
    let token;
    let headers = req.headers.authorization;
    let bearer = 'Bearer'
    let re = /\s(\w+.*)/

    if (headers && headers.startsWith(bearer)) {
        token = re.exec(headers)[1]
    }
    // else if (req.cookie.token) {
    //     token = req.cookie.token
    // }

    if (!token) return next(new ErrResponse('You are not authorize for this route', 401));

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await User.findById(decoded.id)
            .exec()
            .then(function (result) {
                req.user = result;
                next();
            }).catch(err => next(err))
    } catch (e) {
        return next(e)
    }

};


// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return next(new ErrResponse(`User role ${req.user.role} is NOT authorize to access this roure`, 403))
        }
        next();
    }
}