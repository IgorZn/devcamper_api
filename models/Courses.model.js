const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        unique: true,
        required: [true, 'Please add a course title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    weeks: {
        type: String,
        required: [true, 'Please add number of weeks']
    },
    tuition: {
        type: Number,
        required: [true, 'Please add a tuition cost']
    },
    minimumSkill: {
        type: String,
        required: [true, 'Please add a minimum skill'],
        enum: ['beginner', 'intermediate', 'advanced']
    },
    scholarshipAvailable: {
        type: Boolean,
        default: false
    },
    // createdAt: {
    //     type: Date,
    //     default: Date.now
    // },
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
}, {
    timestamps: true
})

const makeAvg = (numObj, round=2) => {
    return numObj.toFixed(round)
}

CourseSchema.static({
    getAverageCost: async function (bootcampId) {
        console.log('Calculating avg cost...'.bold.blue);

        const obj = await this.aggregate([
            {$match: {bootcamp: bootcampId}},
            {$group: {_id: '$bootcamp', averageCost: {$avg: '$tuition'}}}
        ]);

        console.log(JSON.stringify(obj).bgCyan);

        const numObj = obj[0].averageCost

        this.model('Bootcamp').findByIdAndUpdate(bootcampId, {averageCost: makeAvg(numObj)})
            .then( result => {
                console.log('Bootcamp averageCost has been updated...'.green.bold)
            })
            .catch(err => console.log(`Some errors while adding averageCost - ${err}`.red.bold))
    }
})


// Call getAverageCoast after save
CourseSchema.post('save', function () {
    this.constructor.getAverageCost(this.bootcamp);
})

// Call getAverageCoast before remove/delete
CourseSchema.post('remove', function () {
    this.constructor.getAverageCost(this.bootcamp);
})


module.exports = mongoose.model('Course', CourseSchema);