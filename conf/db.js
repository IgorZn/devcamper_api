const mongoose = require('mongoose');
const colors = require('colors');

const connDB = async () => {
    const conn = await mongoose.connect(process.env.MNG_URI, {
        useNewUrlParser: true,
    });

    console.log(`MongoDB connected: ${conn.connections[0].host}`.yellow.bold)
}


module.exports = connDB;