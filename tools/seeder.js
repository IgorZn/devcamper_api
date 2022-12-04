const {readFile} = require('node:fs/promises');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');
const connDB = require("../conf/db");

// load env
dotenv.config({path: './conf/config.env'});

// load models
const Bootcamp = require("../models/Bootcamps.model");
const Course = require("../models/Courses.model");
const User = require("../models/User.model")
const Review = require("../models/Review.model");

// read JSON
const bootcamps = require('../_data/bootcamps.json');
const courses = require('../_data/courses.json');
const users = require('../_data/users.json')
const reviews = require('../_data/reviews.json')

// Connect to DB
mongoose.connect(process.env.MNG_URI, {
    useNewUrlParser: true,
});

const dataJsonsAndModels = {
    BootcampModel: [Bootcamp, bootcamps],
    CourseModel: [Course, courses],
    UserModel: [User, users],
    ReviewModel: [Review, reviews],
};

const importData = async () => {
    for (const key of Object.keys(dataJsonsAndModels)) {
        await dataJsonsAndModels[key][0].create(dataJsonsAndModels[key][1])
            .then(result => {
                console.log(`[${key}] Data has been imported...`.bgGreen.inverse);
            })
            .catch(err => {
                console.log(err)
            })
    }

    if (!process.argv[2].includes('di')) {
        process.exit()
    }

    // Bootcamp.create(bootcamps)
    //     .then(result => {
    //         console.log('Data imported...'.bgGreen.inverse);
    //         process.exit()
    //     })
    //     .catch(err => {
    //         console.log(err)
    //     })
};

const deleteData = async () => {
    for (const key of Object.keys(dataJsonsAndModels)) {
        await dataJsonsAndModels[key][0].deleteMany()
            .then(result => {
                console.log(`[${key}] Data was deleted...`.bgRed.inverse);
            })
            .catch(err => {
                console.log(err)
            })
    }

    if (!process.argv[2].includes('di')) {
        process.exit()
    }


    // Bootcamp.deleteMany()
    //     .then(result => {
    //         console.log('All Data was deleted...'.bgRed.inverse)
    //         process.exit()
    //     })
    //     .catch(err => {
    //         console.log(err)
    //     })
};

const deleteImportData = async () => {
    await deleteData()
    await importData()
    process.exit()
};

const tools = {
    '-i': importData,
    '-d': deleteData,
    '-di': deleteImportData
};


const key = process.argv[2];
if (key) tools[key]();

