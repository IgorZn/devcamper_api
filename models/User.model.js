const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
        name: {
            type: String,
            required: [true, 'Please add a name']
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email'
            ]
        },
        role: {
            type: String,
            enum: ['user', 'publisher'],
            default: 'user'
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: 6,
            select: false // do NOT include in query/response by default
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,

    },
    {
        timestamps: true
    }
);

// Encrypt password
UserSchema.pre('save', async function (next) {
    // Если мы НЕ изменяем 'password', то идем просто дальше...
    if (!this.isModified('password')) {
        next();
    }

    // Run below ONLY if we're modifying PASSWORD field
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

UserSchema.method({
    getResetPwdToken: function () {
        // Generate token
        const resetToken = crypto
            .randomBytes(20)
            .toString('hex');

        // Hash token and set to 'resetPasswordToken'
        this.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expire
        this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    },
})

// JWT return
UserSchema.static({

    getSignedJwtToken: async function (userData) {
        return jwt.sign({id: userData._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRE})
    },

    matchPassword: async function (plainTextPassword, hashedPassword) {
        return await bcrypt.compare(plainTextPassword, hashedPassword)
            .then(function (result) {
                return result
            })
    },

})

module.exports = mongoose.model('User', UserSchema);