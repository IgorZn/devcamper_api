const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
        title: {
            type: String,
            trim: true,
            required: [true, 'Please add a title for the review'],
            maxlength: 100
        },
        text: {
            type: String,
            required: [true, 'Please add some text']
        },
        rating: {
            type: Number,
            min: 1,
            max: 10,
            required: [true, 'Please add a rating between 1 and 10']
        },
        bootcamp: {
            type: mongoose.Schema.ObjectId,
            ref: 'Bootcamp',
            required: true
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    });

const makeAvg = (numObj, round=2) => {
    return numObj.toFixed(round)
}

// Get avg rating and save
ReviewSchema.static({
    getAverageRating: async function (bootcampId) {
        console.log('Calculating avg rating...'.bold.blue);

        const obj = await this.aggregate([
            {$match: {bootcamp: bootcampId}},
            {$group: {_id: '$bootcamp', averageRating: {$avg: '$rating'}}}
        ]);

        console.log(JSON.stringify(obj).bgCyan);

        const numObj = obj[0].averageRating

        this.model('Bootcamp').findByIdAndUpdate(bootcampId, {averageRating: obj[0].averageRating})
            .then( result => {
                console.log('Bootcamp average Rating has been updated...'.green.bold)
            })
            .catch(err => console.log(`Some errors while adding average Rating - ${err}`.red.bold))
    }
})


// Call getAverageCoast after save
ReviewSchema.post('save', function () {
    this.constructor.getAverageRating(this.bootcamp);
})

// Call getAverageCoast before remove/delete
ReviewSchema.post('remove', function () {
    this.constructor.getAverageRating(this.bootcamp);
})

module.exports = mongoose.model('Review', ReviewSchema)