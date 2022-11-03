const {readFile} = require('node:fs/promises');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');
const connDB = require("../conf/db");

// load env
dotenv.config({path: './conf/config.env'});

// load models
const Bootcamp = require("../models/Bootcamps.model");

// read JSON
const bootcamps = require('../_data/bootcamps.json');

// Connect to DB
mongoose.connect(process.env.MNG_URI, {
    useNewUrlParser: true,
});

const importData = async () => {
    Bootcamp.create(bootcamps)
        .then(result => {
            console.log('Data imported...'.bgGreen.inverse);
            process.exit()
        })
        .catch(err => {
            console.log(err)
        })
};

const deleteData = async () => {
    Bootcamp.deleteMany()
        .then(result => {
            console.log('All Data was deleted...'.bgRed.inverse)
            process.exit()
        })
        .catch(err => {
            console.log(err)
        })
};

const tools = {
    '-i': importData,
    '-d': deleteData
};


const key = process.argv[2];
if (key) tools[key]();

