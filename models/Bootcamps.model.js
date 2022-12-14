const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder.utils');
const Course = require('./Courses.model');

const BootcampSchema = new mongoose.Schema({
        name: {
            type: String,
            required: [true, 'Please add a name'],
            unique: true,
            trim: true,
            maxLength: [50, 'Name can not be longer than 50 symbols']
        },
        slug: String,
        description: {
            type: String,
            required: [true, 'Please add a description'],
            maxlength: [500, 'Description can not be more than 500 characters']
        },
        website: {
            type: String,
            match: [
                /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
                'Please use a valid URL with HTTP or HTTPS'
            ]
        },
        phone: {
            type: String,
            maxlength: [20, 'Phone number can not be longer than 20 characters']
        },
        email: {
            type: String,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email'
            ]
        },
        address: {
            type: String,
            required: [true, 'Please add an address']
        },
        location: {
            // GeoJSON Point
            type: {
                type: String,
                enum: ['Point']
            },
            coordinates: {
                type: [Number],
                index: '2dsphere'
            },
            formattedAddress: String,
            street: String,
            city: String,
            state: String,
            zipcode: String,
            country: String
        },
        careers: {
            // Array of strings
            type: [String],
            required: true,
            enum: [
                'Web Development',
                'Mobile Development',
                'UI/UX',
                'Data Science',
                'Business',
                'Other'
            ]
        },
        averageRating: {
            type: Number,
            min: [1, 'Rating must be at least 1'],
            max: [10, 'Rating must can not be more than 10']
        },
        averageCost: Number,
        photo: {
            type: String,
            default: 'no-photo.jpg'
        },
        housing: {
            type: Boolean,
            default: false
        },
        jobAssistance: {
            type: Boolean,
            default: false
        },
        jobGuarantee: {
            type: Boolean,
            default: false
        },
        acceptGi: {
            type: Boolean,
            default: false
        },
        // createdAt: {
        //     type: Date,
        //     default: Date.now
        // },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);


// Add reverse populate on Course model
BootcampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false
});


// Create slug
BootcampSchema.pre('save', function (next) {
    console.log(this.name)
    this.slug = slugify(this.name, {lower: true});
    next()
});

// Geocode
BootcampSchema.pre('save', async function (next) {
    const loc = await geocoder.geocode({zipcode: this.address})
    this.location = {
        // GeoJSON Point
        type: 'Point',
        coordinates: [loc[0].latitude, loc[0].longitude],
        country: loc[0].countryCode,
        formattedAddress: this.address
    }
    // Do not save address
    this.address = undefined;

    next()
});


// Prior cascade delete courses when a bootcamp is deleted
// BootcampSchema.pre('remove', async function (next) {
//     console.log(`Delete course from bootcamp ID: ${this._id}`)
//     await Course.findByIdAndDelete({ bootcamp: this._id })
//     // await this.model('Course').remove({ bootcamp: this._id }, next);
//     next();
// })

module.exports = mongoose.model('Bootcamp', BootcampSchema);